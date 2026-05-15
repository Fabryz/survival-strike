export class Unit {
  constructor(scene, position, team = 'player', type = 'rifleman') {
    this.scene = scene
    this.team = team
    this.type = type
    this.mesh = null
    this.weapon = null
    this.healthBar = null
    
    this.stats = this.getStatsForType(type)
    this.health = this.stats.maxHealth
    this.ammo = this.stats.maxAmmo
    this.attackTarget = null
    this.lastFireTime = 0
    this.bullets = []
    
    this.createMesh(position)
    this.createHealthBar()
  }

  getStatsForType(type) {
    const stats = {
      rifleman: {
        maxHealth: 100,
        maxAmmo: 30,
        damage: 20,
        fireRate: 0.5,
        accuracy: 0.7,
        speed: 0.1,
        color: 0x00ff00
      },
      machinegunner: {
        maxHealth: 120,
        maxAmmo: 100,
        damage: 15,
        fireRate: 0.1,
        accuracy: 0.5,
        speed: 0.08,
        color: 0x0088ff
      },
      sniper: {
        maxHealth: 80,
        maxAmmo: 10,
        damage: 80,
        fireRate: 2,
        accuracy: 0.95,
        speed: 0.09,
        color: 0xffaa00
      }
    }
    return stats[type] || stats.rifleman
  }

  createMesh(position) {
    const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: this.team === 'player' ? this.stats.color : 0xff0000 
    })
    this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    this.mesh.position.copy(position)
    this.mesh.userData.unit = this
    
    const weaponGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.8)
    const weaponMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
    this.weapon = new THREE.Mesh(weaponGeometry, weaponMaterial)
    this.weapon.position.set(0, 0, 0.5)
    this.mesh.add(this.weapon)
    
    this.scene.add(this.mesh)
  }

  createHealthBar() {
    const barWidth = 1
    const barHeight = 0.1
    
    const bgGeometry = new THREE.PlaneGeometry(barWidth, barHeight)
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
    const background = new THREE.Mesh(bgGeometry, bgMaterial)
    
    const hpGeometry = new THREE.PlaneGeometry(barWidth, barHeight)
    const hpMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    this.healthBar = new THREE.Mesh(hpGeometry, hpMaterial)
    
    background.position.set(0, 1.2, 0)
    this.healthBar.position.set(0, 1.21, 0)
    
    this.mesh.add(background)
    this.mesh.add(this.healthBar)
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage)
    this.updateHealthBar()
    return this.health <= 0
  }

  updateHealthBar() {
    const healthPercent = this.health / this.stats.maxHealth
    this.healthBar.scale.x = healthPercent
    this.healthBar.position.x = -(1 - healthPercent) / 2
    
    if (healthPercent > 0.6) {
      this.healthBar.material.color.setHex(0x00ff00)
    } else if (healthPercent > 0.3) {
      this.healthBar.material.color.setHex(0xffff00)
    } else {
      this.healthBar.material.color.setHex(0xff0000)
    }
  }

  setAttackTarget(target) {
    this.attackTarget = target
    this.mesh.userData.isMoving = false
    this.mesh.userData.targetPosition = null
  }

  clearAttackTarget() {
    this.attackTarget = null
  }

  update(deltaTime) {
    this.updateBullets(deltaTime)
    
    if (this.attackTarget) {
      if (this.attackTarget.health <= 0) {
        this.attackTarget = null
        return
      }
      
      const direction = new THREE.Vector3()
      direction.subVectors(this.attackTarget.getPosition(), this.mesh.position)
      const distance = direction.length()
      
      const angle = Math.atan2(direction.x, direction.z)
      this.mesh.rotation.y = angle
      
      const attackRange = 15
      
      if (distance > attackRange) {
        direction.normalize()
        this.mesh.position.add(direction.multiplyScalar(this.stats.speed * 0.7))
      } else {
        const currentTime = Date.now() / 1000
        if (currentTime - this.lastFireTime > this.stats.fireRate) {
          this.shoot(this.attackTarget)
          this.lastFireTime = currentTime
        }
      }
    } else if (this.mesh.userData.isMoving && this.mesh.userData.targetPosition) {
      const direction = new THREE.Vector3()
      direction.subVectors(this.mesh.userData.targetPosition, this.mesh.position)
      
      const distance = direction.length()
      
      if (distance < 0.1) {
        this.mesh.userData.isMoving = false
        this.mesh.userData.targetPosition = null
      } else {
        direction.normalize()
        this.mesh.position.add(direction.multiplyScalar(this.stats.speed))
        
        const angle = Math.atan2(direction.x, direction.z)
        this.mesh.rotation.y = angle
      }
    }
  }

  shoot(target) {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial)
    
    bullet.position.copy(this.mesh.position)
    bullet.position.y += 0.5
    
    const direction = new THREE.Vector3()
    direction.subVectors(target.getPosition(), this.mesh.position)
    direction.normalize()
    
    const spread = (1 - this.stats.accuracy) * 0.2
    direction.x += (Math.random() - 0.5) * spread
    direction.z += (Math.random() - 0.5) * spread
    direction.normalize()
    
    bullet.userData = {
      velocity: direction.multiplyScalar(0.4),
      target: target,
      shooter: this,
      damage: this.stats.damage
    }
    
    this.scene.add(bullet)
    this.bullets.push(bullet)
  }

  updateBullets(deltaTime) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      bullet.position.add(bullet.userData.velocity)
      
      const target = bullet.userData.target
      if (target && target.health > 0) {
        const targetPos = target.getPosition()
        const distance = bullet.position.distanceTo(targetPos)
        
        if (distance < 1.0) {
          target.takeDamage(bullet.userData.damage)
          this.scene.remove(bullet)
          this.bullets.splice(i, 1)
          continue
        }
      }
      
      const distanceFromOrigin = new THREE.Vector3(
        bullet.position.x,
        0,
        bullet.position.z
      ).length()
      
      if (distanceFromOrigin > 100 || bullet.position.y < 0) {
        this.scene.remove(bullet)
        this.bullets.splice(i, 1)
      }
    }
  }

  destroy() {
    this.scene.remove(this.mesh)
  }

  getMesh() {
    return this.mesh
  }

  getPosition() {
    return this.mesh.position
  }
}
