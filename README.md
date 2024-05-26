# 3D Shooting Game

## Overview
This project is a 3D shooting game built using the Three.js library. The player controls a soldier character, firing bullets at enemies and avoiding obstacles. The game includes functionalities such as shooting, reloading, enemy movement, collision detection, and a user interface (UI) displaying ammo count, health bars, and hit probability.

## Features
- **Shooting Mechanism**: Fire bullets by clicking the mouse, and reload automatically when the ammo runs out.
- **Enemy Movement**: Enemies move randomly within the boundaries of the map.
- **Collision Detection**: Bullets can collide with enemies and obstacles, triggering appropriate responses.
- **UI Elements**: Displays the ammo count, crosshair, hit probability, and a distance display to the nearest enemy.
- **Zoom and Camera Control**: Zoom in and out using the mouse wheel and rotate the camera around the soldier.

## Prerequisites
Ensure you have the following installed:
- Node.js
- npm (Node Package Manager)
- A modern web browser (Chrome, Firefox, Edge, etc.)

## Installation
1. Clone the repository:
    ```sh
    git@github.com:Fabryz/survival-strike.git
    cd survival-strike
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm start
    ```

## Usage
1. **Movement**: 
    - **W**: Move forward
    - **S**: Move backward
    - **A**: Move left
    - **D**: Move right

2. **Shooting**:
    - **Click**: Fire a bullet if ammo is available.
    - **Double Click**: Prevents default double click behavior.

3. **Camera Control**:
    - **Mouse Wheel**: Zoom in and out.
    - **Rotate Left**: Rotate the camera to the left.
    - **Rotate Right**: Rotate the camera to the right.

## File Structure
* src
* index.html // Main HTML file
* main.js // Main JavaScript file
* style.css // Add styles here
* assets // Add your assets here (textures, models, etc.)
* package.json // npm configuration
* README.md // This file*

## Technical Details
- **Classes and Libraries**: The main library used is [Three.js](https://threejs.org/).
- **Shooting**: Bullets are created as meshes and added to the scene. The velocity is set, and collision detection is done for each frame.
    ```js
  const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    ```
Reloading: Handled using setInterval for the reload progress and setTimeout for the delay.

```js
const reloadInterval = setInterval(() => {
  // Update progress
}, 10);
Enemy Movement: Each enemy has a random direction which is occasionally changed.

for (let i = 0; i < enemies.length; i++) {
  const direction = new THREE.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize();
  enemyDirections.push(direction);
}
```

## Future Improvements
* Add more complex AI for enemies.
* Include various types of obstacles and power-ups.
* Implement different levels and difficulty settings.
* Enhance graphics and add sound effects.

## Contributing
Feel free to fork this repository and create pull requests. Any contributions are highly appreciated.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

Enjoy playing the game
