export class MovementController {
  constructor(scene, camera, plane) {
    this.scene = scene
    this.camera = camera
    this.plane = plane
    this.moveMarkers = []
    
    this.setupEventListeners()
  }

  setupEventListeners() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.onRightClick(e)
    })
  }

  onRightClick(event) {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    const intersects = raycaster.intersectObject(this.plane)

    if (intersects.length > 0) {
      const targetPosition = intersects[0].point
      this.createMoveMarker(targetPosition)
      return targetPosition
    }
    return null
  }

  createMoveMarker(position) {
    this.clearMarkers()

    const markerGeometry = new THREE.RingGeometry(0.3, 0.5, 16)
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      side: THREE.DoubleSide 
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(position)
    marker.position.y = 0.05
    marker.rotation.x = -Math.PI / 2
    
    this.scene.add(marker)
    this.moveMarkers.push(marker)

    setTimeout(() => {
      this.scene.remove(marker)
      const index = this.moveMarkers.indexOf(marker)
      if (index > -1) this.moveMarkers.splice(index, 1)
    }, 2000)
  }

  clearMarkers() {
    this.moveMarkers.forEach(marker => this.scene.remove(marker))
    this.moveMarkers = []
  }

  moveUnits(units, targetPosition) {
    if (units.length === 0) return

    const formationSpacing = 2
    const unitsPerRow = Math.ceil(Math.sqrt(units.length))

    units.forEach((unit, index) => {
      const row = Math.floor(index / unitsPerRow)
      const col = index % unitsPerRow
      
      const offsetX = (col - unitsPerRow / 2) * formationSpacing
      const offsetZ = row * formationSpacing

      const finalPosition = new THREE.Vector3(
        targetPosition.x + offsetX,
        unit.position.y,
        targetPosition.z + offsetZ
      )

      unit.userData.targetPosition = finalPosition
      unit.userData.isMoving = true
    })
  }

  updateUnitMovement(unit, speed = 0.1) {
    if (!unit.userData.isMoving || !unit.userData.targetPosition) return

    const direction = new THREE.Vector3()
    direction.subVectors(unit.userData.targetPosition, unit.position)
    
    const distance = direction.length()
    
    if (distance < 0.1) {
      unit.userData.isMoving = false
      unit.userData.targetPosition = null
      return
    }

    direction.normalize()
    unit.position.add(direction.multiplyScalar(speed))

    const angle = Math.atan2(direction.x, direction.z)
    unit.rotation.y = angle
  }
}
