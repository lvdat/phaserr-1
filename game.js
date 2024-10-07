const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
}

const game = new Phaser.Game(config)
let player
let enemies
let score = 0
let scoreText
let upgradeCost = {
  speed: 10,
  size: 10,
  strength: 15,
  health: 20
}
let playerStats = {
  speed: 200,
  strength: 1,
  size: 1,
  maxHealth: 5,
  health: 5
}
let healthBar

function preload() {
  this.load.image('player', 'https://via.placeholder.com/50')
  this.load.image('enemy', 'https://via.placeholder.com/40')
}

function create() {
  player = this.physics.add.sprite(400, 300, 'player')
  player.setScale(playerStats.size)
  enemies = this.physics.add.group()

  this.time.addEvent({
    delay: 1000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  })

  scoreText = this.add.text(10, 10, `Score: ${score}`, { fontSize: '20px', fill: '#fff' })
  this.add.text(10, 40, `Press 1: Speed (${upgradeCost.speed}), 2: Size (${upgradeCost.size}), 3: Strength (${upgradeCost.strength}), 4: Health (${upgradeCost.health})`, { fontSize: '16px', fill: '#fff' })
  
  // Create health bar
  healthBar = this.add.graphics()
  updateHealthBar()

  this.physics.add.overlap(player, enemies, (player, enemy) => {
    enemy.destroy()
    score += playerStats.strength // Increase score based on player's strength
    scoreText.setText(`Score: ${score}`)
  }, null, this)

  // Add collision detection between player and enemies
  this.physics.add.collider(player, enemies, playerHit, null, this)
}

function update() {
  const cursors = this.input.keyboard.createCursorKeys()
  if (cursors.left.isDown) player.setVelocityX(-playerStats.speed)
  else if (cursors.right.isDown) player.setVelocityX(playerStats.speed)
  else player.setVelocityX(0)

  if (cursors.up.isDown) player.setVelocityY(-playerStats.speed)
  else if (cursors.down.isDown) player.setVelocityY(playerStats.speed)
  else player.setVelocityY(0)
}

function spawnEnemy() {
  const x = Phaser.Math.Between(0, 800)
  const y = Phaser.Math.Between(0, 600)
  const enemy = enemies.create(x, y, 'enemy')
  enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100))
}

function updateHealthBar() {
  // Clear the old health bar
  healthBar.clear()
  
  // Draw the new health bar
  healthBar.fillStyle(0xff0000, 1)
  const barWidth = 100 * (playerStats.health / playerStats.maxHealth)
  healthBar.fillRect(10, 70, barWidth, 10)
}

function playerHit(player, enemy) {
  enemy.destroy()
  playerStats.health -= 1
  updateHealthBar()

  // If the player's health reaches 0, end the game
  if (playerStats.health <= 0) {
    this.physics.pause()
    player.setTint(0xff0000)
    this.add.text(400, 300, 'Game Over', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5)
  }
}

// Upgrade mechanic with multiple upgrades
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case '1': // Upgrade speed
      if (score >= upgradeCost.speed) {
        score -= upgradeCost.speed
        upgradeCost.speed += 5
        playerStats.speed += 20
        scoreText.setText(`Score: ${score}`)
      }
      break
    case '2': // Upgrade size
      if (score >= upgradeCost.size) {
        score -= upgradeCost.size
        upgradeCost.size += 5
        playerStats.size += 0.1
        player.setScale(playerStats.size)
        scoreText.setText(`Score: ${score}`)
      }
      break
    case '3': // Upgrade strength
      if (score >= upgradeCost.strength) {
        score -= upgradeCost.strength
        upgradeCost.strength += 10
        playerStats.strength += 1
        scoreText.setText(`Score: ${score}`)
      }
      break
    case '4': // Upgrade health
      if (score >= upgradeCost.health) {
        score -= upgradeCost.health
        upgradeCost.health += 10
        playerStats.maxHealth += 1
        playerStats.health = playerStats.maxHealth
        updateHealthBar()
        scoreText.setText(`Score: ${score}`)
      }
      break
  }
})
