import { SelectionManager } from './src/SelectionManager.js'
import { MovementController } from './src/MovementController.js'
import { Unit } from './src/Unit.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(10, 20, 10)
light.castShadow = true
scene.add(light)

const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
scene.add(ambientLight)

const planeGeometry = new THREE.PlaneGeometry(100, 100)
const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 })
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true
scene.add(plane)

camera.position.set(0, 20, 20)
camera.lookAt(0, 0, 0)

const selectionManager = new SelectionManager(scene, camera, renderer)
const movementController = new MovementController(scene, camera, plane)

const playerUnits = []
const enemyUnits = []

function createPlayerSquad() {
  const types = ['rifleman', 'rifleman', 'machinegunner', 'sniper', 'rifleman']
  
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 2
    const position = new THREE.Vector3(x, 0.5, -5)
    const unit = new Unit(scene, position, 'player', types[i])
    
    playerUnits.push(unit)
    selectionManager.registerUnit(unit.getMesh())
  }
}

function createEnemySquad() {
  for (let i = 0; i < 5; i++) {
    const x = (Math.random() - 0.5) * 20
    const z = (Math.random() - 0.5) * 20 + 10
    const position = new THREE.Vector3(x, 0.5, z)
    const unit = new Unit(scene, position, 'enemy', 'rifleman')
    
    enemyUnits.push(unit)
  }
}

createPlayerSquad()
createEnemySquad()

document.addEventListener('contextmenu', (event) => {
  event.preventDefault()
  
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  )
  
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  
  const enemyMeshes = enemyUnits.map(u => u.getMesh())
  const enemyIntersects = raycaster.intersectObjects(enemyMeshes)
  
  if (enemyIntersects.length > 0) {
    const targetEnemy = enemyIntersects[0].object.userData.unit
    const selectedUnits = selectionManager.getSelectedUnits()
    
    selectedUnits.forEach(unitMesh => {
      const unit = unitMesh.userData.unit
      if (unit) {
        unit.setAttackTarget(targetEnemy)
      }
    })
  } else {
    const selectedUnits = selectionManager.getSelectedUnits()
    
    if (selectedUnits.length > 0) {
      const targetPosition = movementController.onRightClick(event)
      
      if (targetPosition) {
        selectedUnits.forEach(unitMesh => {
          const unit = unitMesh.userData.unit
          if (unit) {
            unit.clearAttackTarget()
          }
        })
        
        movementController.moveUnits(selectedUnits, targetPosition)
      }
    }
  }
})

const keys = {}
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true)
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false)

let cameraDistance = 25
let cameraAngle = Math.PI / 4
let cameraTarget = new THREE.Vector3(0, 0, 0)
const cameraPanSpeed = 0.3

document.addEventListener('wheel', (event) => {
  cameraDistance += event.deltaY * 0.01
  cameraDistance = Math.max(10, Math.min(50, cameraDistance))
})

const hudElement = document.getElementById('hud')
if (hudElement) {
  hudElement.innerHTML = `
    <div style="background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px;">
      <h3 style="margin: 0 0 10px 0;">RTS Controls</h3>
      <p style="margin: 5px 0;"><strong>Left Click:</strong> Select unit</p>
      <p style="margin: 5px 0;"><strong>Drag:</strong> Box select</p>
      <p style="margin: 5px 0;"><strong>Right Click Ground:</strong> Move units</p>
      <p style="margin: 5px 0;"><strong>Right Click Enemy:</strong> Attack target</p>
      <p style="margin: 5px 0;"><strong>Shift + Click:</strong> Add to selection</p>
      <p style="margin: 5px 0;"><strong>WASD/Arrows:</strong> Pan camera</p>
      <p style="margin: 5px 0;"><strong>Q/E:</strong> Rotate camera</p>
      <p style="margin: 5px 0;"><strong>Scroll:</strong> Zoom</p>
      <div id="unit-count" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #fff;">
        <p style="margin: 5px 0;">Player Units: <span id="player-count">5</span></p>
        <p style="margin: 5px 0;">Enemy Units: <span id="enemy-count">5</span></p>
        <p style="margin: 5px 0;">Selected: <span id="selected-count">0</span></p>
      </div>
    </div>
  `
}

function updateCamera() {
  if (keys['q']) cameraAngle += 0.02
  if (keys['e']) cameraAngle -= 0.02
  
  const forward = new THREE.Vector3(
    Math.sin(cameraAngle),
    0,
    Math.cos(cameraAngle)
  )
  const right = new THREE.Vector3(
    Math.cos(cameraAngle),
    0,
    -Math.sin(cameraAngle)
  )
  
  if (keys['w'] || keys['arrowup']) {
    cameraTarget.add(forward.clone().multiplyScalar(-cameraPanSpeed))
  }
  if (keys['s'] || keys['arrowdown']) {
    cameraTarget.add(forward.clone().multiplyScalar(cameraPanSpeed))
  }
  if (keys['a'] || keys['arrowleft']) {
    cameraTarget.add(right.clone().multiplyScalar(-cameraPanSpeed))
  }
  if (keys['d'] || keys['arrowright']) {
    cameraTarget.add(right.clone().multiplyScalar(cameraPanSpeed))
  }
  
  camera.position.x = cameraTarget.x + Math.sin(cameraAngle) * cameraDistance
  camera.position.z = cameraTarget.z + Math.cos(cameraAngle) * cameraDistance
  camera.position.y = cameraDistance * 0.8
  camera.lookAt(cameraTarget)
}

function updateEnemyAI() {
  enemyUnits.forEach(unit => {
    if (Math.random() < 0.005) {
      const randomX = (Math.random() - 0.5) * 40
      const randomZ = (Math.random() - 0.5) * 40
      const targetPos = new THREE.Vector3(randomX, 0.5, randomZ)
      
      unit.getMesh().userData.targetPosition = targetPos
      unit.getMesh().userData.isMoving = true
    }
  })
}

function updateHUD() {
  const selectedCount = selectionManager.getSelectedUnits().length
  const playerCountEl = document.getElementById('player-count')
  const enemyCountEl = document.getElementById('enemy-count')
  const selectedCountEl = document.getElementById('selected-count')
  
  if (playerCountEl) playerCountEl.textContent = playerUnits.length
  if (enemyCountEl) enemyCountEl.textContent = enemyUnits.length
  if (selectedCountEl) selectedCountEl.textContent = selectedCount
}

function animate() {
  requestAnimationFrame(animate)
  
  updateCamera()
  updateEnemyAI()
  
  for (let i = playerUnits.length - 1; i >= 0; i--) {
    playerUnits[i].update(0.016)
    if (playerUnits[i].health <= 0) {
      selectionManager.unregisterUnit(playerUnits[i].getMesh())
      playerUnits[i].destroy()
      playerUnits.splice(i, 1)
    }
  }
  
  for (let i = enemyUnits.length - 1; i >= 0; i--) {
    enemyUnits[i].update(0.016)
    if (enemyUnits[i].health <= 0) {
      enemyUnits[i].destroy()
      enemyUnits.splice(i, 1)
    }
  }
  
  updateHUD()
  
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
