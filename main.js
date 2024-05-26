// Setup di base della scena, della camera e del renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

const crosshair = document.getElementById('crosshair');
const crosshairSize = 20; // Assumendo una larghezza e altezza di 20px

// Aggiungere gravità e rimuovere proiettili caduti
const gravity = new THREE.Vector3(0, -0.002, 0); // Ridotto ulteriormente l'effetto della gravità

// Aggiunta di una luce
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1).normalize();
scene.add(light);

// Creazione del terreno
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Creazione del fucile (semplice bastone marrone)
const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 1); // Forma base del fucile
const gunMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Colore marrone
const gun = new THREE.Mesh(gunGeometry, gunMaterial);
gun.position.y = 0.5; // Alzare il fucile sopra il terreno

// Creazione del soldato con fucile
const soldierGeometry = new THREE.BoxGeometry(1, 1, 1);
const soldierMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const soldier = new THREE.Mesh(soldierGeometry, soldierMaterial);
soldier.add(gun); // Aggiungere il fucile al soldato
gun.position.set(0, 0, 0.6); // Posizionare il fucile nel punto giusto rispetto al soldato

// Posizione iniziale del soldato leggermente sollevata
soldier.position.set(0, 0.5, 0); // Modifica questa linea: Y=0.5 per evitare che il soldato trapassi il terreno

scene.add(soldier);

// Dimensioni della mappa
const mapSize = 25;

// Aggiunta di ostacoli casuali nella mappa
const obstacleCount = 10; // Numero di ostacoli da aggiungere
const obstacles = [];

for (let i = 0; i < obstacleCount; i++) {
    const obstacleSize = Math.random() * 1 + 0.5; // Dimensione casuale dell'ostacolo
    const obstacleGeometry = new THREE.BoxGeometry(obstacleSize, obstacleSize, obstacleSize);
    const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Marrone per una cassa di legno
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);

    // Posizione casuale entro i limiti della mappa
    obstacle.position.set(
        (Math.random() - 0.5) * mapSize * 2,
        obstacleSize / 2, // Per far sì che l'ostacolo sia appoggiato al terreno
        (Math.random() - 0.5) * mapSize * 2
    );

    obstacles.push(obstacle);
    scene.add(obstacle);
}

// Funzione per rilevare collisioni
function detectCollisions(object, obstacles) {
    for (const obstacle of obstacles) {
        const distance = object.position.distanceTo(obstacle.position);
        const combinedHalfLength = (object.geometry.parameters.width + obstacle.geometry.parameters.width) / 2;

        if (distance <= combinedHalfLength) {
            return true;
        }
    }
    return false;
}

// Creazione di nemici
const enemies = [];
const enemyHPs = [];
for (let i = 0; i < 5; i++) {
    const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(Math.random() * 20 - 10, 0.5, Math.random() * 20 - 10);
    scene.add(enemy);
    enemies.push(enemy);

    // Creazione della barra HP
    const hpGeometry = new THREE.PlaneGeometry(1, 0.1);
    const hpMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const hpBar = new THREE.Mesh(hpGeometry, hpMaterial);
    hpBar.position.set(enemy.position.x, enemy.position.y + 1.2, enemy.position.z);
    scene.add(hpBar);
    enemyHPs.push({ bar: hpBar, hp: 100 }); // 100 HP iniziali
}

// Posizionamento iniziale della camera
camera.position.z = 25;
camera.position.y = 15;
camera.lookAt(0, 0, 0);

// Variabili di controllo
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let rotateLeft = false;
let rotateRight = false;

// Array per contenere i proiettili
const bullets = [];

let cameraRotationAngle = 0;
const rotationSpeed = 0.025; // Velocità di rotazione

// Event listener per i tasti di movimento
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'KeyQ':
            rotateLeft = true;
            break;
        case 'KeyE':
            rotateRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
        case 'KeyQ':
            rotateLeft = false;
            break;
        case 'KeyE':
            rotateRight = false;
            break;
    }
});

// Aggiungere HUD
const healthDisplay = document.getElementById('health');
const ammoDisplay = document.getElementById('ammo');
let playerHealth = 100;
let ammo = 10;
let reloading = false;

// Barra di progresso per la ricarica
const reloadBarContainer = document.getElementById('reload-bar-container');
const reloadBar = document.getElementById('reload-bar');

// Funzione di ricarica automatica (con delay e barra di progresso)
function reloadAmmo() {
reloading = true;
reloadBarContainer.style.display = 'block';

const reloadTime = 2000; // Tempo di ricarica in millisecondi (2 secondi)
let reloadProgress = 0;
const reloadInterval = setInterval(() => {
    reloadProgress += 10;
    reloadBar.style.width = `${(reloadProgress / reloadTime) * 100}%`;

    if (reloadProgress >= reloadTime) {
        clearInterval(reloadInterval);
        ammo = 10;
        ammoDisplay.innerHTML = `Ammo: ${ammo}`;
        reloadBarContainer.style.display = 'none';
        reloading = false;
    }
}, 10);
}

document.addEventListener('dblclick', function(event) {
    event.preventDefault();
});

// Modifica velocità iniziale del proiettile
document.addEventListener('click', () => {
    if (ammo > 0 && !reloading) {
        // Creazione del proiettile
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        // Posizione iniziale del proiettile
        bullet.position.set(soldier.position.x, soldier.position.y, soldier.position.z);

        // Calcolo della direzione del proiettile
        const bulletDirection = new THREE.Vector3();
        soldier.getWorldDirection(bulletDirection);
        bullet.userData.velocity = bulletDirection.clone().multiplyScalar(2); // Aumentata la velocità iniziale

        // Aggiunta del proiettile alla scena e all'array dei proiettili
        scene.add(bullet);
        bullets.push(bullet);

        // Aggiornamento delle munizioni
        ammo--;
        ammoDisplay.innerHTML = `Ammo: ${ammo}`;

        // Se le munizioni sono esaurite, attivare la ricarica automatica
        if (ammo === 0) {
            setTimeout(reloadAmmo, 500); // Ritardo minimo prima di iniziare la ricarica (500ms)
        }
    }
});

// Puntamento del soldato verso il mouse
// Puntamento del soldato verso il mouse
document.addEventListener('mousemove', (event) => {
    // Aggiorna la posizione del mirino
    const halfSize = crosshairSize / 2;
    crosshair.style.left = `${event.clientX - halfSize}px`;
    crosshair.style.top = `${event.clientY - halfSize}px`;

    const distanceDisplay = document.getElementById('distance-display');

    // Calcolare la posizione del mouse in coordinate di mondo
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        const point = intersects[0].point;

        // Calcola la direzione verso cui il soldato dovrebbe guardare
        const direction = new THREE.Vector3();
        direction.subVectors(point, soldier.position).normalize();

        // Calcola l'angolo in cui girare il soldato
        const angle = Math.atan2(direction.x, direction.z);
        soldier.rotation.y = angle;

        // Calcolare la probabilità di colpire e la distanza
        const enemyIntersects = raycaster.intersectObjects(enemies);
        let color = 'red'; // Default a bassa probabilità
        let distance = null;

        if (enemyIntersects.length > 0) {
            distance = enemyIntersects[0].distance.toFixed(2);
            if (distance < 30) color = 'green'; // Alta probabilità di colpire
            else if (distance < 50) color = 'yellow'; // Probabilità media
        }

        crosshair.style.backgroundColor = color;

        if (distance !== null) {
            distanceDisplay.style.display = 'block';
            distanceDisplay.style.left = `${event.clientX + 15}px`;
            distanceDisplay.style.top = `${event.clientY + 15}px`;
            distanceDisplay.innerHTML = `Distance: ${distance}`;
        } else {
            distanceDisplay.style.display = 'none';
        }
    }
});


// Array per memorizzare la direzione dei nemici
const enemyDirections = [];

// Inizializza le direzioni dei nemici
for (let i = 0; i < enemies.length; i++) {
    const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        0,
        Math.random() * 2 - 1
    ).normalize();
    enemyDirections.push(direction);
}

// Funzione per aggiornare la direzione dei nemici
function updateEnemyDirections() {
    for (let i = 0; i < enemies.length; i++) {
        if (Math.random() < 0.02) { // Cambia direzione occasionalmente
            enemyDirections[i] = new THREE.Vector3(
                Math.random() * 2 - 1,
                0,
                Math.random() * 2 - 1
            ).normalize();
        }
    }
}

// Funzione per aggiornare la posizione dei nemici
function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].position.add(enemyDirections[i].clone().multiplyScalar(0.05));

        // Controllo dei confini della mappa
        if (enemies[i].position.x < -mapSize || enemies[i].position.x > mapSize) {
            enemies[i].position.x = THREE.MathUtils.clamp(enemies[i].position.x, -mapSize, mapSize);
            enemyDirections[i].x = -enemyDirections[i].x; // Cambia direzione orizzontale
        }
        if (enemies[i].position.z < -mapSize || enemies[i].position.z > mapSize) {
            enemies[i].position.z = THREE.MathUtils.clamp(enemies[i].position.z, -mapSize, mapSize);
            enemyDirections[i].z = -enemyDirections[i].z; // Cambia direzione verticale
        }
    }
}

// Variabili di controllo per lo zoom
let zoomLevel = 15; // Distanza iniziale della camera dal soldato
const zoomSpeed = 1; // Velocità dello zoom
const minZoom = 5; // Minima distanza di zoom (più vicina al soldato)
const maxZoom = 50; // Massima distanza di zoom (più lontana dal soldato)

// Funzione per gestire lo zoom con la rotellina del mouse
function handleZoom(event) {
    // Normalizza deltaY per gestire lo zoom sia verso l'alto che verso il basso
    const delta = Math.sign(event.deltaY);
    zoomLevel = THREE.MathUtils.clamp(zoomLevel + delta * zoomSpeed, minZoom, maxZoom);
}

document.addEventListener('wheel', handleZoom);

// Vectori per muoversi rispetto alla direzione della telecamera
const moveSpeed = 0.1;

const direction = new THREE.Vector3();
camera.getWorldDirection(direction);
direction.y = 0;
direction.normalize();

const right = new THREE.Vector3();
right.crossVectors(camera.up, direction);
right.normalize();

function animate() {
    requestAnimationFrame(animate);

    // Vectori per muoversi rispetto alla direzione della telecamera
    const moveSpeed = 0.1;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction);
    right.normalize();

    // Salva la posizione corrente del soldato
    const previousPosition = soldier.position.clone();

    // Movimentazione del soldato
    if (moveForward) soldier.position.add(direction.clone().multiplyScalar(moveSpeed));
    if (moveBackward) soldier.position.add(direction.clone().multiplyScalar(-moveSpeed));
    if (moveLeft) soldier.position.add(right.clone().multiplyScalar(moveSpeed));
    if (moveRight) soldier.position.add(right.clone().multiplyScalar(-moveSpeed));

    // Rileva collisioni e ripristina la posizione precedente se necessario
    if (detectCollisions(soldier, obstacles)) {
        soldier.position.copy(previousPosition);
    }

 // Muovi i nemici
 updateEnemyDirections();
 moveEnemies();

 // Funzione per creare un effetto quando il proiettile colpisce un ostacolo
function createHitEffect(position) {
    const hitGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const hitMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hitEffect = new THREE.Mesh(hitGeometry, hitMaterial);
    
    hitEffect.position.copy(position);
    scene.add(hitEffect);

    // Rimuovi l'effetto dopo un breve periodo di tempo
    setTimeout(() => {
        scene.remove(hitEffect);
    }, 300); // Durata dell'effetto in millisecondi
}

// Aggiornamento dei proiettili (aggiornato per includere il rilevamento delle collisioni con gli ostacoli)
bullets.forEach((bullet, index) => {
    bullet.userData.velocity.add(gravity);
    bullet.position.add(bullet.userData.velocity);

    if (bullet.position.y < -1 || bullet.position.distanceTo(soldier.position) > mapSize * 2) {
        scene.remove(bullet);
        bullets.splice(index, 1);
    }

    // Collisione dei proiettili con i nemici
    enemies.forEach((enemy, enemyIndex) => {
        if (bullet.position.distanceTo(enemy.position) < 1) {
            enemyHPs[enemyIndex].hp -= 20;
            const hpRatio = enemyHPs[enemyIndex].hp / 100;
            enemyHPs[enemyIndex].bar.scale.set(hpRatio, 1, 1);
            enemyHPs[enemyIndex].bar.material.color.setRGB(1 - hpRatio, hpRatio, 0);

            if (enemyHPs[enemyIndex].hp <= 0) {
                scene.remove(enemy);
                scene.remove(enemyHPs[enemyIndex].bar);
                enemies.splice(enemyIndex, 1);
                enemyHPs.splice(enemyIndex, 1);
            }

            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });

    // Collisione dei proiettili con gli ostacoli
    obstacles.forEach((obstacle) => {
        if (bullet.position.distanceTo(obstacle.position) < 1) {
            createHitEffect(bullet.position);
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });
});

 // Aggiornare le barre HP dei nemici
 enemyHPs.forEach((enemyHP, index) => {
     enemyHP.bar.position.set(enemies[index].position.x, enemies[index].position.y + 1.2, enemies[index].position.z);
     // Fai ruotare la HP bar per essere sempre frontale rispetto alla telecamera
     enemyHP.bar.lookAt(camera.position);
 });

 // Rotazione della telecamera
 if (rotateLeft) cameraRotationAngle -= rotationSpeed;
 if (rotateRight) cameraRotationAngle += rotationSpeed;

 const offsetX = Math.sin(cameraRotationAngle) * zoomLevel;
 const offsetZ = Math.cos(cameraRotationAngle) * zoomLevel;

 camera.position.set(
     soldier.position.x + offsetX,
     soldier.position.y + 10,
     soldier.position.z + offsetZ
 );
 camera.lookAt(soldier.position);

 renderer.render(scene, camera);
}

function calculateHitProbability() {
 const mouse = new THREE.Vector2(
     (window.innerWidth / 2 / window.innerWidth) * 2 - 1,
     - (window.innerHeight / 2 / window.innerHeight) * 2 + 1
 );

 const raycaster = new THREE.Raycaster();
 raycaster.setFromCamera(mouse, camera);
 const intersects = raycaster.intersectObjects(enemies);

 if (intersects.length > 0) {
     const distance = intersects[0].distance;
     if (distance < 5) return 'green'; // Alta probabilità di colpire
     if (distance < 10) return 'yellow'; // Probabilità media
     return 'red'; // Bassa probabilità
 }
 return 'red'; // Nessun nemico colpibile
}

// Avviare l'animazione
animate();
