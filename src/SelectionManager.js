export class SelectionManager {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.selectedUnits = []
    this.selectableUnits = []
    
    this.isSelecting = false
    this.selectionStart = { x: 0, y: 0 }
    this.selectionEnd = { x: 0, y: 0 }
    
    this.selectionBox = this.createSelectionBox()
    this.setupEventListeners()
  }

  createSelectionBox() {
    const box = document.createElement('div')
    box.id = 'selection-box'
    box.style.position = 'absolute'
    box.style.border = '2px solid rgba(0, 255, 0, 0.8)'
    box.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'
    box.style.pointerEvents = 'none'
    box.style.display = 'none'
    document.body.appendChild(box)
    return box
  }

  setupEventListeners() {
    document.addEventListener('mousedown', (e) => this.onMouseDown(e))
    document.addEventListener('mousemove', (e) => this.onMouseMove(e))
    document.addEventListener('mouseup', (e) => this.onMouseUp(e))
  }

  onMouseDown(event) {
    if (event.button === 0) {
      this.isSelecting = true
      this.selectionStart = { x: event.clientX, y: event.clientY }
      this.selectionEnd = { x: event.clientX, y: event.clientY }
      
      if (!event.shiftKey) {
        this.clearSelection()
      }
    }
  }

  onMouseMove(event) {
    if (this.isSelecting) {
      this.selectionEnd = { x: event.clientX, y: event.clientY }
      this.updateSelectionBox()
    }
  }

  onMouseUp(event) {
    if (event.button === 0 && this.isSelecting) {
      this.isSelecting = false
      this.selectionBox.style.display = 'none'
      this.performSelection()
    }
  }

  updateSelectionBox() {
    const left = Math.min(this.selectionStart.x, this.selectionEnd.x)
    const top = Math.min(this.selectionStart.y, this.selectionEnd.y)
    const width = Math.abs(this.selectionEnd.x - this.selectionStart.x)
    const height = Math.abs(this.selectionEnd.y - this.selectionStart.y)

    this.selectionBox.style.left = `${left}px`
    this.selectionBox.style.top = `${top}px`
    this.selectionBox.style.width = `${width}px`
    this.selectionBox.style.height = `${height}px`
    this.selectionBox.style.display = 'block'
  }

  performSelection() {
    const box = {
      left: Math.min(this.selectionStart.x, this.selectionEnd.x),
      top: Math.min(this.selectionStart.y, this.selectionEnd.y),
      right: Math.max(this.selectionStart.x, this.selectionEnd.x),
      bottom: Math.max(this.selectionStart.y, this.selectionEnd.y)
    }

    const width = box.right - box.left
    const height = box.bottom - box.top

    if (width < 5 && height < 5) {
      this.selectSingleUnit(this.selectionStart.x, this.selectionStart.y)
    } else {
      this.selectUnitsInBox(box)
    }
  }

  selectSingleUnit(x, y) {
    const mouse = new THREE.Vector2(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    const intersects = raycaster.intersectObjects(this.selectableUnits)

    if (intersects.length > 0) {
      const unit = intersects[0].object
      this.addToSelection(unit)
    }
  }

  selectUnitsInBox(box) {
    const tempVector = new THREE.Vector3()
    
    this.selectableUnits.forEach(unit => {
      tempVector.copy(unit.position)
      tempVector.project(this.camera)

      const x = (tempVector.x + 1) / 2 * window.innerWidth
      const y = -(tempVector.y - 1) / 2 * window.innerHeight

      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        this.addToSelection(unit)
      }
    })
  }

  addToSelection(unit) {
    if (!this.selectedUnits.includes(unit)) {
      this.selectedUnits.push(unit)
      this.highlightUnit(unit, true)
    }
  }

  clearSelection() {
    this.selectedUnits.forEach(unit => {
      this.highlightUnit(unit, false)
    })
    this.selectedUnits = []
  }

  highlightUnit(unit, selected) {
    if (unit.userData.selectionRing) {
      unit.userData.selectionRing.visible = selected
    } else if (selected) {
      const ringGeometry = new THREE.RingGeometry(0.6, 0.7, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        side: THREE.DoubleSide 
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.01
      unit.add(ring)
      unit.userData.selectionRing = ring
    }
  }

  registerUnit(unit) {
    if (!this.selectableUnits.includes(unit)) {
      this.selectableUnits.push(unit)
    }
  }

  unregisterUnit(unit) {
    const index = this.selectableUnits.indexOf(unit)
    if (index > -1) {
      this.selectableUnits.splice(index, 1)
    }
    
    const selectedIndex = this.selectedUnits.indexOf(unit)
    if (selectedIndex > -1) {
      this.selectedUnits.splice(selectedIndex, 1)
    }
  }

  getSelectedUnits() {
    return this.selectedUnits
  }
}
