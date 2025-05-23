// Game state variables
let money = 0;
let moneyPerSecond = 1;
let baseHealth = 100;
let enemyBaseHealth = 100;
let gameRunning = false;
let currentLevel = 1;
let units = [];
let enemies = [];
let gameLoop;
let unitsDeployed = 0;
let enemiesDefeated = 0;
let moneySpent = 0;
let attackBonus = 0;
let incomeLevel = 0;
let attackLevel = 0;

// Emoji expressions for units
const unitEmojis = {
    basic: ['😊', '😃', '😄', '😁', '🙂', '😇'],
    tank: ['😎', '🤨', '😐', '😑', '😤', '😠'],
    attacker: ['😈', '👿', '😡', '🤬', '👹', '👺']
};

// DOM Elements
const moneyDisplay = document.getElementById('money');
const moneyPerSecondDisplay = document.getElementById('money-per-second');
const baseHealthDisplay = document.getElementById('base-health');
const enemyBaseHealthDisplay = document.getElementById('enemy-base-health');
const enemyBaseHealthFill = document.getElementById('enemy-base-health-fill');
const unitsContainer = document.getElementById('units-container');
const enemiesContainer = document.getElementById('enemies-container');
const startLevelButton = document.getElementById('start-level');
const currentLevelDisplay = document.getElementById('current-level');
const gameOverScreen = document.getElementById('game-over');
const gameOverMessage = document.getElementById('game-over-message');
const restartGameButton = document.getElementById('restart-game');
const unitsDeployedDisplay = document.getElementById('units-deployed');
const enemiesDefeatedDisplay = document.getElementById('enemies-defeated');
const moneySpentDisplay = document.getElementById('money-spent');
const currentIncomeDisplay = document.getElementById('current-income');
const incomeLevelDisplay = document.getElementById('income-level');
const attackBonusDisplay = document.getElementById('attack-bonus');
const attackLevelDisplay = document.getElementById('attack-level');

// Unit purchase buttons
const buyButtons = document.querySelectorAll('.unit-buttons button');
const upgradeButtons = document.querySelectorAll('.upgrade-buttons button');

// Initialize the game
function init() {
    // Reset game state
    money = 50; // Starting money
    moneyPerSecond = 1;
    baseHealth = 100;
    enemyBaseHealth = 100;
    gameRunning = false;
    currentLevel = 1;
    units = [];
    enemies = [];
    unitsDeployed = 0;
    enemiesDefeated = 0;
    moneySpent = 0;
    attackBonus = 0;
    incomeLevel = 0;
    attackLevel = 0;
    
    // Update displays
    updateDisplays();
    
    // Clear game field
    unitsContainer.innerHTML = '';
    enemiesContainer.innerHTML = '';
    
    // Set up event listeners
    startLevelButton.addEventListener('click', startLevel);
    restartGameButton.addEventListener('click', restartGame);
    
    buyButtons.forEach(button => {
        button.addEventListener('click', () => buyUnit(button));
    });
    
    upgradeButtons.forEach(button => {
        button.addEventListener('click', () => buyUpgrade(button));
    });
    
    // Reset enemy base health display
    enemyBaseHealthFill.style.width = '100%';
    
    // Start money generation
    startMoneyGeneration();
}

// Update all displays
function updateDisplays() {
    moneyDisplay.textContent = Math.floor(money);
    moneyPerSecondDisplay.textContent = `(+${moneyPerSecond}/sec)`;
    baseHealthDisplay.textContent = baseHealth;
    enemyBaseHealthDisplay.textContent = enemyBaseHealth;
    currentLevelDisplay.textContent = currentLevel;
    unitsDeployedDisplay.textContent = unitsDeployed;
    enemiesDefeatedDisplay.textContent = enemiesDefeated;
    moneySpentDisplay.textContent = moneySpent;
    currentIncomeDisplay.textContent = moneyPerSecond;
    incomeLevelDisplay.textContent = incomeLevel;
    attackBonusDisplay.textContent = attackBonus * 100;
    attackLevelDisplay.textContent = attackLevel;
    
    // Update button states
    buyButtons.forEach(button => {
        const cost = parseInt(button.getAttribute('data-cost'));
        button.disabled = money < cost || !gameRunning;
    });
    
    // Update upgrade buttons
    upgradeButtons.forEach(button => {
        const cost = parseInt(button.getAttribute('data-cost'));
        button.disabled = money < cost;
        
        // Update costs based on level
        if (button.id === 'upgrade-income') {
            const newCost = 50 + (incomeLevel * 25);
            button.setAttribute('data-cost', newCost);
            button.innerHTML = `Income +2/sec (${newCost} coins)
                <div class="upgrade-info">Current: +${moneyPerSecond}/sec | Level: ${incomeLevel}</div>`;
        } else if (button.id === 'upgrade-attack') {
            const newCost = 75 + (attackLevel * 50);
            button.setAttribute('data-cost', newCost);
            button.innerHTML = `Attack Power +25% (${newCost} coins)
                <div class="upgrade-info">Current: +${attackBonus * 100}% | Level: ${attackLevel}</div>`;
        }
    });
}

// Start automatic money generation
function startMoneyGeneration() {
    setInterval(() => {
        if (gameRunning) {
            money += moneyPerSecond / 10; // Divide by 10 for smoother updates (10 times per second)
            updateDisplays();
        }
    }, 100);
}

// Buy a unit
function buyUnit(button) {
    const cost = parseInt(button.getAttribute('data-cost'));
    const attack = parseInt(button.getAttribute('data-attack'));
    const health = parseInt(button.getAttribute('data-health'));
    const type = button.getAttribute('data-type');
    
    if (money >= cost) {
        money -= cost;
        moneySpent += cost;
        // Apply attack bonus from upgrades
        const bonusAttack = attack * (1 + attackBonus);
        createUnit(type, bonusAttack, health);
        unitsDeployed++;
        updateDisplays();
    }
}

// Buy an upgrade
function buyUpgrade(button) {
    const cost = parseInt(button.getAttribute('data-cost'));
    
    if (money >= cost) {
        money -= cost;
        moneySpent += cost;
        
        if (button.id === 'upgrade-income') {
            moneyPerSecond += 2;
            incomeLevel++;
        } else if (button.id === 'upgrade-attack') {
            attackBonus += 0.25;
            attackLevel++;
        }
        
        updateDisplays();
    }
}

// Create a unit element and add it to the game
function createUnit(type, attack, health) {
    // Select a random emoji for this unit type
    const emoji = unitEmojis[type][Math.floor(Math.random() * unitEmojis[type].length)];
    
    const unit = {
        id: 'unit-' + Date.now(),
        type: type,
        attack: attack,
        health: health,
        maxHealth: health,
        position: 50 + Math.random() * 50, // Random position for variety
        element: document.createElement('div'),
        emoji: emoji,
        advanceToEnemyBase: Math.random() > 0.7 // 30% chance unit will advance to enemy base
    };
    
    // Create the unit element
    unit.element.id = unit.id;
    unit.element.className = `unit unit-${type}`;
    unit.element.style.bottom = `${unit.position}px`;
    
    // Add emoji face
    const face = document.createElement('div');
    face.className = 'unit-face';
    face.textContent = emoji;
    unit.element.appendChild(face);
    
    // Add health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    const healthBarFill = document.createElement('div');
    healthBarFill.className = 'health-bar-fill';
    healthBar.appendChild(healthBarFill);
    unit.element.appendChild(healthBar);
    
    unitsContainer.appendChild(unit.element);
    units.push(unit);
}

// Create an enemy
function createEnemy(type, health, damage, speed) {
    const enemy = {
        id: 'enemy-' + Date.now(),
        type: type,
        health: health,
        maxHealth: health,
        damage: damage,
        speed: speed,
        position: 50 + Math.random() * 50, // Random position for variety
        element: document.createElement('div')
    };
    
    // Create the enemy element
    enemy.element.id = enemy.id;
    enemy.element.className = `enemy enemy-${type}`;
    enemy.element.style.bottom = `${enemy.position}px`;
    
    // Add health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    const healthBarFill = document.createElement('div');
    healthBarFill.className = 'health-bar-fill';
    healthBar.appendChild(healthBarFill);
    enemy.element.appendChild(healthBar);
    
    enemiesContainer.appendChild(enemy.element);
    enemies.push(enemy);
}

// Start a level
function startLevel() {
    if (gameRunning) return;
    
    gameRunning = true;
    startLevelButton.textContent = 'Level in progress...';
    startLevelButton.disabled = true;
    
    // Generate enemies based on level
    generateEnemies();
    
    // Start game loop
    gameLoop = setInterval(update, 100); // Update 10 times per second
    
    // Enable unit purchase buttons
    buyButtons.forEach(button => {
        const cost = parseInt(button.getAttribute('data-cost'));
        button.disabled = money < cost;
    });
}

// Generate enemies based on current level
function generateEnemies() {
    const enemyCount = Math.min(3 + currentLevel, 10); // Cap at 10 enemies
    
    for (let i = 0; i < enemyCount; i++) {
        // Determine enemy type based on level and position in wave
        let type, health, damage, speed;
        
        if (i === enemyCount - 1 && currentLevel % 3 === 0) {
            // Boss every 3 levels as last enemy
            type = 'boss';
            health = 50 + currentLevel * 20;
            damage = 10 + currentLevel;
            speed = 0.5;
        } else if (i >= Math.floor(enemyCount / 2) && currentLevel > 1) {
            // Tough enemies in second half of wave after level 1
            type = 'tough';
            health = 20 + currentLevel * 5;
            damage = 3 + Math.floor(currentLevel / 2);
            speed = 0.8;
        } else {
            // Basic enemies
            type = 'basic';
            health = 10 + currentLevel * 2;
            damage = 1 + Math.floor(currentLevel / 3);
            speed = 1;
        }
        
        // Delay enemy spawning for varied appearance
        setTimeout(() => {
            if (gameRunning) {
                createEnemy(type, health, damage, speed);
            }
        }, i * 2000); // Spawn every 2 seconds
    }
}

// Main game update loop
function update() {
    // Battle logic
    for (let unit of units) {
        // Skip dead units
        if (unit.health <= 0) continue;
        
        // Check if this unit should attack the enemy base
        if (unit.advanceToEnemyBase) {
            // Move unit towards enemy base
            const currentLeft = parseInt(unit.element.style.left || '0');
            unit.element.style.left = `${currentLeft + 1}px`;
            
            // Check if unit reached enemy base
            if (currentLeft >= 200) {
                // Attack enemy base
                enemyBaseHealth -= unit.attack / 10;
                
                // Update enemy base health display
                enemyBaseHealthDisplay.textContent = Math.ceil(enemyBaseHealth);
                enemyBaseHealthFill.style.width = `${(enemyBaseHealth / 100) * 100}%`;
                
                // Flash enemy base red
                document.querySelector('.enemy-base').style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                setTimeout(() => {
                    document.querySelector('.enemy-base').style.backgroundColor = '';
                }, 300);
                
                // Check if enemy base is destroyed
                if (enemyBaseHealth <= 0) {
                    gameOver(true);
                    return;
                }
            }
        } else {
            // Find closest enemy
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (let enemy of enemies) {
                if (enemy.health > 0) {
                    const distance = 300; // Fixed distance for simplicity
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            }
            
            // Attack if enemy found
            if (closestEnemy) {
                closestEnemy.health -= unit.attack / 10; // Divide by 10 since we update 10 times per second
                
                // Update enemy health bar
                const healthPercent = (closestEnemy.health / closestEnemy.maxHealth) * 100;
                const healthBar = closestEnemy.element.querySelector('.health-bar-fill');
                healthBar.style.width = `${Math.max(0, healthPercent)}%`;
                
                // Check if enemy died
                if (closestEnemy.health <= 0) {
                    closestEnemy.element.style.opacity = '0.5';
                    enemiesDefeated++;
                    updateDisplays();
                    
                    // Remove enemy after animation
                    setTimeout(() => {
                        if (closestEnemy.element.parentNode) {
                            closestEnemy.element.parentNode.removeChild(closestEnemy.element);
                        }
                    }, 500);
                    
                    // Check for level completion
                    checkLevelCompletion();
                }
            }
        }
    }
    
    // Enemy movement and attack
    for (let enemy of enemies) {
        if (enemy.health <= 0) continue;
        
        // Move enemy towards base
        const currentLeft = parseInt(enemy.element.style.left || '0');
        enemy.element.style.left = `${currentLeft - enemy.speed}px`;
        
        // Check if enemy reached base
        if (currentLeft <= -50) {
            baseHealth -= enemy.damage;
            baseHealthDisplay.textContent = baseHealth;
            
            // Remove enemy
            enemy.element.parentNode.removeChild(enemy.element);
            enemy.health = 0;
            
            // Flash base red
            document.querySelector('.player-base').style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            setTimeout(() => {
                document.querySelector('.player-base').style.backgroundColor = '';
            }, 300);
            
            // Check game over
            if (baseHealth <= 0) {
                gameOver(false);
            }
        }
    }
    
    // Clean up dead enemies
    enemies = enemies.filter(enemy => enemy.health > 0);
}

// Check if level is complete
function checkLevelCompletion() {
    // Count remaining enemies (both alive and scheduled to spawn)
    const aliveEnemies = enemies.filter(enemy => enemy.health > 0).length;
    
    if (aliveEnemies === 0 && document.querySelectorAll('.enemy').length === 0) {
        // Small delay to ensure all enemies are processed
        setTimeout(() => {
            if (gameRunning && document.querySelectorAll('.enemy').length === 0) {
                levelComplete();
            }
        }, 1000);
    }
}

// Level complete function
function levelComplete() {
    clearInterval(gameLoop);
    gameRunning = false;
    
    // Reward: bonus money based on level
    const bonus = 20 + currentLevel * 10;
    money += bonus;
    
    // Clear units and enemies
    units.forEach(unit => {
        if (unit.element.parentNode) {
            unit.element.parentNode.removeChild(unit.element);
        }
    });
    units = [];
    enemies = [];
    
    // Update level
    currentLevel++;
    
    // Reset enemy base health with level scaling
    enemyBaseHealth = 100 + (currentLevel - 1) * 25;
    enemyBaseHealthDisplay.textContent = enemyBaseHealth;
    enemyBaseHealthFill.style.width = '100%';
    
    // Increase money generation slightly with level
    moneyPerSecond = 1 + Math.floor(currentLevel / 3) + (incomeLevel * 2);
    
    // Update UI
    startLevelButton.textContent = `Start Level ${currentLevel}`;
    startLevelButton.disabled = false;
    updateDisplays();
    
    // Show level complete message
    alert(`Level ${currentLevel - 1} complete! Bonus: ${bonus} coins`);
    } +  bonus;
    
    // Clear units and enemies
    units.forEach(unit => {
        if (unit.element.parentNode) {
            unit.element.parentNode.removeChild(unit.element);
        }
    });
    units = [];
    enemies = [];
    
    // Update level
    currentLevel++;{ 
    
    // Increase money generation slightly with level
    moneyPerSecond = 1 + Math.floor(currentLevel / 3);
    
    // Update UI
    startLevelButton.textContent = `Start Level ${currentLevel}`;
    startLevelButton.disabled = false;
    updateDisplays();
    
    // Show level complete message
    alert(`Level ${currentLevel - 1} complete! Bonus: ${bonus} coins`);
}

// Game over function
function gameOver(victory) {
    clearInterval(gameLoop);
    gameRunning = false;
    
    // Show game over screen
    gameOverScreen.classList.remove('hidden');
    
    if (victory) {
        gameOverMessage.textContent = 'Victory! You destroyed the enemy base!';
    } else {
        gameOverMessage.textContent = 'Game Over! Your base was destroyed!';
    }
}

// Restart game
function restartGame() {
    gameOverScreen.classList.add('hidden');
    init();
}

// Initialize the game when page loads
window.addEventListener('load', init);