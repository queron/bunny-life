import { 
  TILE_SIZE, 
  SpriteCache, 
  CROPS_DATA, 
  initAllSprites 
} from './sprites.js';

import { 
  playSound, 
  toggleMute, 
  startMusic 
} from './audio.js';

// Map Dimensions (24 columns x 18 rows = 768 x 576 px)
const GRID_COLS = 24;
const GRID_ROWS = 18;
const CANVAS_WIDTH = GRID_COLS * TILE_SIZE;
const CANVAS_HEIGHT = GRID_ROWS * TILE_SIZE;

// Weather Definitions
export const WEATHER_DATA = {
  sunny: { 
    name: 'Sunny', 
    icon: '☀️', 
    desc: 'Clear skies and warm sunshine! A lovely, productive day on the farm.' 
  },
  rainy: { 
    name: 'Rainy', 
    icon: '🌧️', 
    desc: 'Soft rain falling! Automatically waters all your tilled soil plots today.' 
  },
  stormy: { 
    name: 'Thunderstorm', 
    icon: '⛈️', 
    desc: 'Heavy rain & thunder! Waters all crops and gives extra growth speed.' 
  },
  windy: { 
    name: 'Petal Breeze', 
    icon: '🌸', 
    desc: 'Cherry blossom petals & leaves floating gently in a refreshing breeze.' 
  },
  snowy: { 
    name: 'Snowy Chill', 
    icon: '❄️', 
    desc: 'Crisp winter snowflakes drifting over your farm.' 
  }
};

// Game State
const state = {
  canvas: null,
  ctx: null,
  day: 1,
  timeMinutes: 6 * 60, // Starts at 6:00 AM (360 minutes)
  coins: 50,
  stamina: 100,
  maxStamina: 100,
  scene: 'farm', // 'farm' or 'house'

  // Dynamic Weather Engine
  weather: {
    current: 'sunny',
    tomorrow: 'rainy',
    particles: [],
    lightningTimer: 0
  },

  // Player position & animation
  player: {
    x: 11 * TILE_SIZE,
    y: 9 * TILE_SIZE,
    speed: 3,
    dir: 'down',
    isMoving: false,
    animTick: 0,
    animFrame: 'idle',
    actionCooldown: 0
  },

  // Waps the Dog
  waps: {
    x: 12 * TILE_SIZE,
    y: 9 * TILE_SIZE,
    wagTimer: 0,
    animFrame: 'idle',
    hearts: []
  },

  // Inventory Slots (6 slots on quickbar)
  selectedSlot: 0,
  inventory: [
    { id: 'tool_hoe', type: 'tool', name: 'Hoe', count: 1, icon: 'hoe' },
    { id: 'tool_water', type: 'tool', name: 'Watering Can', count: 1, icon: 'watering_can' },
    { id: 'tool_glove', type: 'tool', name: 'Harvest Glove', count: 1, icon: 'glove' },
    { id: 'seed_carrot', type: 'seed', cropKey: 'carrot', name: 'Carrot Seeds', count: 5 },
    { id: 'seed_strawberry', type: 'seed', cropKey: 'strawberry', name: 'Strawberry Seeds', count: 3 },
    { id: 'seed_sunflower', type: 'seed', cropKey: 'sunflower', name: 'Sunflower Seeds', count: 2 }
  ],

  grid: [],
  keys: {},
  fireflies: []
};

// Initialize Grid Map
function initGrid() {
  state.grid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      let type = 'grass';
      
      if (c >= 1 && c <= 4 && r >= 1 && r <= 3) {
        type = 'water';
      } else if (c >= 18 && c <= 20 && r >= 1 && r <= 3) {
        type = 'burrow';
      } else if (c >= 19 && c <= 21 && r >= 13 && r <= 15) {
        type = 'shop';
      } else if (r === 0 || r === GRID_ROWS - 1 || c === 0 || c === GRID_COLS - 1) {
        type = 'fence';
      } else if (c === 11 || c === 12) {
        type = 'stone';
      } else if (((c >= 5 && c <= 10) || (c >= 13 && c <= 17)) && (r >= 6 && r <= 13)) {
        type = 'dirt';
      }

      row.push({
        type: type,
        crop: null,
        isWatered: false
      });
    }
    state.grid.push(row);
  }

  // Pre-generate Night Fireflies & Weather Particles
  initWeatherParticles();
}

function initWeatherParticles() {
  state.fireflies = [];
  for (let i = 0; i < 25; i++) {
    state.fireflies.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2 + 1,
      alpha: Math.random()
    });
  }

  state.weather.particles = [];
  for (let i = 0; i < 60; i++) {
    state.weather.particles.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      speedX: (Math.random() - 0.5) * 2,
      speedY: Math.random() * 4 + 2,
      size: Math.random() * 3 + 1
    });
  }
}

// Show Toast Notification
export function showNotification(msg) {
  const toast = document.getElementById('notification-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Scene Transitions
export function enterHouse() {
  state.scene = 'house';
  state.player.x = 11.5 * TILE_SIZE;
  state.player.y = 13 * TILE_SIZE;
  state.player.dir = 'up';
  showNotification("Inside Bunny Burrow 🏡");
}

export function exitHouse() {
  state.scene = 'farm';
  state.player.x = 19 * TILE_SIZE;
  state.player.y = 4 * TILE_SIZE;
  state.player.dir = 'down';
  showNotification("Back to the Farm 🥕");
}

// Pet Waps the Dog
export function petWaps() {
  playSound('bark');
  state.waps.wagTimer = 90;
  
  for (let i = 0; i < 5; i++) {
    state.waps.hearts.push({
      x: state.waps.x + 8 + (Math.random() - 0.5) * 16,
      y: state.waps.y - 4,
      vy: -1.0 - Math.random() * 0.8,
      alpha: 1.0
    });
  }

  state.stamina = Math.min(state.maxStamina, state.stamina + 10);
  showNotification("You petted Waps! 🐶❤️ Waps wags his tail!");
}

// Open Retro TV Weather Forecast Modal
export function openTVModal() {
  playSound('tv_on');
  const modal = document.getElementById('tv-modal');
  if (!modal) return;

  const tomorrowData = WEATHER_DATA[state.weather.tomorrow] || WEATHER_DATA['sunny'];
  const iconEl = document.getElementById('forecast-icon');
  const nameEl = document.getElementById('forecast-name');
  const descEl = document.getElementById('forecast-desc');

  if (iconEl) iconEl.textContent = tomorrowData.icon;
  if (nameEl) nameEl.textContent = tomorrowData.name;
  if (descEl) descEl.textContent = tomorrowData.desc;

  modal.classList.add('open');
}

export function closeTVModal() {
  const modal = document.getElementById('tv-modal');
  if (modal) modal.classList.remove('open');
}

// Setup Event Listeners
function setupControls() {
  window.addEventListener('keydown', (e) => {
    state.keys[e.code] = true;
    
    if (e.key >= '1' && e.key <= '6') {
      selectSlot(parseInt(e.key) - 1);
    }
    if (e.code === 'Space' || e.code === 'KeyE') {
      performTileAction();
    }
  });

  window.addEventListener('keyup', (e) => {
    state.keys[e.code] = false;
  });

  state.canvas.addEventListener('click', (e) => {
    const rect = state.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(mouseX / TILE_SIZE);
    const row = Math.floor(mouseY / TILE_SIZE);

    interactWithTile(col, row);
  });
}

function selectSlot(index) {
  if (index >= 0 && index < 6) {
    state.selectedSlot = index;
    renderQuickbar();
  }
}

function renderQuickbar() {
  const container = document.getElementById('quickbar');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const item = state.inventory[i];
    const slotEl = document.createElement('div');
    slotEl.className = `slot ${i === state.selectedSlot ? 'active' : ''}`;
    
    const keyHint = document.createElement('span');
    keyHint.className = 'key-hint';
    keyHint.textContent = (i + 1).toString();
    slotEl.appendChild(keyHint);

    if (item) {
      const img = document.createElement('img');
      img.className = 'item-icon';
      
      if (item.type === 'tool') {
        img.src = SpriteCache.tools[item.icon].toDataURL();
      } else if (item.type === 'seed') {
        img.src = SpriteCache.crops[item.cropKey][3].toDataURL();
      } else if (item.type === 'crop') {
        img.src = SpriteCache.crops[item.cropKey][3].toDataURL();
      }
      slotEl.appendChild(img);

      if (item.count > 1) {
        const countEl = document.createElement('span');
        countEl.className = 'item-count';
        countEl.textContent = item.count.toString();
        slotEl.appendChild(countEl);
      }
    }

    slotEl.addEventListener('click', () => selectSlot(i));
    container.appendChild(slotEl);
  }

  const activeItem = state.inventory[state.selectedSlot];
  const tooltip = document.getElementById('item-tooltip');
  if (tooltip) {
    tooltip.textContent = activeItem ? activeItem.name : 'Empty Hand';
  }
}

function performTileAction() {
  let col = Math.floor((state.player.x + TILE_SIZE / 2) / TILE_SIZE);
  let row = Math.floor((state.player.y + TILE_SIZE / 2) / TILE_SIZE);

  if (state.player.dir === 'up') row--;
  if (state.player.dir === 'down') row++;
  if (state.player.dir === 'left') col--;
  if (state.player.dir === 'right') col++;

  interactWithTile(col, row);
}

function interactWithTile(col, row) {
  if (state.scene === 'house') {
    // Interacting with Retro TV (col 16, row 4..5)
    if (col >= 15 && col <= 17 && row >= 3 && row <= 6) {
      openTVModal();
      return;
    }

    // Interacting with Waps
    const wapsCol = Math.floor(state.waps.x / TILE_SIZE);
    const wapsRow = Math.floor(state.waps.y / TILE_SIZE);
    if (Math.abs(col - wapsCol) <= 1 && Math.abs(row - wapsRow) <= 1) {
      petWaps();
      return;
    }

    // Interacting with Green Bed
    if (col >= 5 && col <= 8 && row >= 4 && row <= 7) {
      sleepToNextDay();
      return;
    }

    // Interacting with Exit Mat
    if ((col === 11 || col === 12) && row >= 13) {
      exitHouse();
      return;
    }
    return;
  }

  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
  const tile = state.grid[row][col];
  const item = state.inventory[state.selectedSlot];

  if (tile.type === 'shop') {
    openShopModal();
    return;
  }

  if (tile.type === 'burrow') {
    enterHouse();
    return;
  }

  if (state.stamina <= 0) {
    showNotification("Bunny is exhausted! Sleep in House 😴");
    return;
  }

  if (!item) return;

  if (item.id === 'tool_hoe') {
    if (tile.type === 'grass') {
      tile.type = 'dirt';
      state.stamina = Math.max(0, state.stamina - 2);
      playSound('till');
      state.player.actionCooldown = 15;
    }
  } else if (item.id === 'tool_water') {
    if (tile.type === 'dirt' && !tile.isWatered) {
      tile.isWatered = true;
      state.stamina = Math.max(0, state.stamina - 1);
      playSound('water');
      state.player.actionCooldown = 15;
    }
  } else if (item.type === 'seed') {
    if (tile.type === 'dirt' && !tile.crop) {
      tile.crop = {
        key: item.cropKey,
        stage: 0,
        timer: 0
      };
      item.count--;
      if (item.count <= 0) {
        state.inventory[state.selectedSlot] = null;
      }
      playSound('plant');
      renderQuickbar();
      state.player.actionCooldown = 12;
    }
  } else if (item.id === 'tool_glove' || !item) {
    if (tile.crop && tile.crop.stage === 3) {
      const cropKey = tile.crop.key;
      const cData = CROPS_DATA[cropKey];
      
      addItemToInventory({
        id: `crop_${cropKey}`,
        type: 'crop',
        cropKey: cropKey,
        name: cData.name,
        count: 1
      });

      tile.crop = null;
      playSound('harvest');
      showNotification(`Harvested ${cData.name}!`);
      state.player.actionCooldown = 15;
    }
  }
}

function addItemToInventory(newItem) {
  const existing = state.inventory.find(i => i && i.id === newItem.id);
  if (existing) {
    existing.count += newItem.count;
  } else {
    const emptyIndex = state.inventory.findIndex(i => i === null);
    if (emptyIndex !== -1) {
      state.inventory[emptyIndex] = newItem;
    } else {
      showNotification("Inventory Full!");
    }
  }
  renderQuickbar();
}

// Sleep & Pass to Next Day with Weather Transition
function sleepToNextDay() {
  const overlay = document.getElementById('day-transition-overlay');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      state.day++;
      state.timeMinutes = 6 * 60;
      state.stamina = state.maxStamina;

      // Update Weather for the New Day
      state.weather.current = state.weather.tomorrow;
      const weatherTypes = ['sunny', 'rainy', 'stormy', 'windy', 'snowy'];
      state.weather.tomorrow = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

      const isRainyDay = (state.weather.current === 'rainy' || state.weather.current === 'stormy');

      // Daily crop growth & automatic rain watering
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const t = state.grid[r][c];
          if (t.type === 'dirt' && isRainyDay) {
            t.isWatered = true; // Rain waters all tilled soil plots!
          }
          if (t.crop && t.isWatered) {
            t.crop.stage = Math.min(3, t.crop.stage + 1);
            if (!isRainyDay) t.isWatered = false;
          }
        }
      }

      updateHUD();
      overlay.classList.remove('active');

      if (isRainyDay) {
        showNotification(`Good morning! Rain watered your farm plots! 🌧️`);
      } else {
        showNotification(`Good morning! Day ${state.day}`);
      }
    }, 1200);
  }
}

function updatePlayer() {
  if (state.player.actionCooldown > 0) {
    state.player.actionCooldown--;
    return;
  }

  let dx = 0;
  let dy = 0;

  if (state.keys['KeyW'] || state.keys['ArrowUp']) { dy -= 1; state.player.dir = 'up'; }
  if (state.keys['KeyS'] || state.keys['ArrowDown']) { dy += 1; state.player.dir = 'down'; }
  if (state.keys['KeyA'] || state.keys['ArrowLeft']) { dx -= 1; state.player.dir = 'left'; }
  if (state.keys['KeyD'] || state.keys['ArrowRight']) { dx += 1; state.player.dir = 'right'; }

  if (dx !== 0 && dy !== 0) {
    dx *= 0.7071;
    dy *= 0.7071;
  }

  state.player.isMoving = (dx !== 0 || dy !== 0);

  if (state.player.isMoving) {
    const nextX = state.player.x + dx * state.player.speed;
    const nextY = state.player.y + dy * state.player.speed;

    if (state.scene === 'farm') {
      const col = Math.floor((nextX + TILE_SIZE / 2) / TILE_SIZE);
      const row = Math.floor((nextY + TILE_SIZE / 2) / TILE_SIZE);

      if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
        const targetTile = state.grid[row][col];

        if (targetTile.type === 'burrow' && state.player.dir === 'up') {
          enterHouse();
          return;
        }

        if (targetTile.type !== 'water' && targetTile.type !== 'fence') {
          state.player.x = nextX;
          state.player.y = nextY;
        }
      }
    } else if (state.scene === 'house') {
      const minX = 5 * TILE_SIZE;
      const maxX = 18 * TILE_SIZE;
      const minY = 4.5 * TILE_SIZE;
      const maxY = 14 * TILE_SIZE;

      const col = Math.floor((nextX + TILE_SIZE / 2) / TILE_SIZE);
      const row = Math.floor((nextY + TILE_SIZE / 2) / TILE_SIZE);

      if ((col === 11 || col === 12) && row >= 14 && state.player.dir === 'down') {
        exitHouse();
        return;
      }

      if (nextX >= minX && nextX <= maxX && nextY >= minY && nextY <= maxY) {
        state.player.x = nextX;
        state.player.y = nextY;
      }
    }

    state.player.animTick++;
    if (state.player.animTick % 10 === 0) {
      playSound('hop');
    }
    const frameIndex = Math.floor(state.player.animTick / 6) % 2;
    state.player.animFrame = frameIndex === 0 ? 'walk1' : 'walk2';
  } else {
    state.player.animFrame = 'idle';
  }

  if (state.waps.wagTimer > 0) {
    state.waps.wagTimer--;
    const frame = Math.floor(state.waps.wagTimer / 10) % 2 === 0 ? 'wag1' : 'wag2';
    state.waps.animFrame = frame;
  } else {
    state.waps.animFrame = 'idle';
  }

  state.waps.hearts.forEach((h, i) => {
    h.y += h.vy;
    h.alpha -= 0.02;
    if (h.alpha <= 0) state.waps.hearts.splice(i, 1);
  });
}

function updateGameTime(dt = 0.016) {
  state.timeMinutes += dt * 1;
  if (state.timeMinutes >= 24 * 60) {
    sleepToNextDay();
  }

  // Real-time crop growth for watered crops (bonus speed during storms)
  const growthMultiplier = state.weather.current === 'stormy' ? 1.5 : 1.0;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tile = state.grid[r][c];
      if (tile.crop && tile.isWatered && tile.crop.stage < 3) {
        const cData = CROPS_DATA[tile.crop.key];
        tile.crop.timer += dt * growthMultiplier;
        if (tile.crop.timer >= cData.growthTimeSec / 3) {
          tile.crop.stage++;
          tile.crop.timer = 0;
        }
      }
    }
  }

  // Stormy Lightning Flash FX
  if (state.weather.current === 'stormy') {
    if (Math.random() < 0.003) {
      state.weather.lightningTimer = 6;
      playSound('thunder');
    }
    if (state.weather.lightningTimer > 0) {
      state.weather.lightningTimer--;
    }
  }

  updateHUD();
}

function updateHUD() {
  const hours = Math.floor(state.timeMinutes / 60);
  const mins = Math.floor(state.timeMinutes % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const timeStr = `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;

  const clockEl = document.getElementById('clock-display');
  if (clockEl) clockEl.textContent = timeStr;

  const dayEl = document.getElementById('day-display');
  if (dayEl) {
    const loc = state.scene === 'house' ? ' 🏡 House' : '';
    dayEl.textContent = `Day ${state.day}${loc}`;
  }

  const wData = WEATHER_DATA[state.weather.current] || WEATHER_DATA['sunny'];
  const wIconEl = document.getElementById('weather-icon');
  const wNameEl = document.getElementById('weather-display');
  if (wIconEl) wIconEl.textContent = wData.icon;
  if (wNameEl) wNameEl.textContent = wData.name;

  const coinsEl = document.getElementById('coins-display');
  if (coinsEl) coinsEl.textContent = state.coins.toString();

  const staminaFill = document.getElementById('stamina-fill');
  if (staminaFill) {
    const pct = Math.max(0, Math.min(100, (state.stamina / state.maxStamina) * 100));
    staminaFill.style.width = `${pct}%`;
  }
}

// Render Game Canvas (Farm vs House & Weather Particles)
function render() {
  const ctx = state.ctx;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (state.scene === 'farm') {
    // ------------------------------------
    // FARM SCENE RENDERING
    // ------------------------------------
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const tile = state.grid[r][c];
        const posX = c * TILE_SIZE;
        const posY = r * TILE_SIZE;

        let spriteKey = tile.type;
        if (tile.type === 'dirt' && tile.isWatered) {
          spriteKey = 'dirt_watered';
        }

        if (SpriteCache.tiles[spriteKey]) {
          ctx.drawImage(SpriteCache.tiles[spriteKey], posX, posY);
        } else if (tile.type === 'burrow' || tile.type === 'shop') {
          ctx.drawImage(SpriteCache.tiles['grass'], posX, posY);
        }

        if (tile.crop) {
          const cropSprites = SpriteCache.crops[tile.crop.key];
          if (cropSprites && cropSprites[tile.crop.stage]) {
            ctx.drawImage(cropSprites[tile.crop.stage], posX, posY);
          }
        }
      }
    }

    // Outdoor Structures
    ctx.drawImage(SpriteCache.decorations['burrow'], 18 * TILE_SIZE - 16, 1 * TILE_SIZE - 20);
    ctx.drawImage(SpriteCache.decorations['shop'], 19 * TILE_SIZE - 16, 13 * TILE_SIZE - 16);

    // Player Bunny
    const bunnySprite = SpriteCache.bunny[state.player.dir][state.player.animFrame];
    if (bunnySprite) {
      ctx.drawImage(bunnySprite, state.player.x, state.player.y);
    }

    // Day / Night Ambient Overlay
    const hours = state.timeMinutes / 60;
    let overlayAlpha = 0;
    let overlayColor = '0, 0, 40';

    if (hours >= 18 && hours < 21) {
      overlayAlpha = ((hours - 18) / 3) * 0.4;
      overlayColor = '120, 40, 20';
    } else if (hours >= 21 || hours < 5) {
      overlayAlpha = 0.55;
      overlayColor = '10, 15, 45';
    } else if (hours >= 5 && hours < 7) {
      overlayAlpha = ((7 - hours) / 2) * 0.3;
      overlayColor = '255, 180, 100';
    }

    // Weather Effects Rendering
    const w = state.weather.current;
    if (w === 'rainy' || w === 'stormy') {
      ctx.fillStyle = '#81d4fa';
      state.weather.particles.forEach(p => {
        p.y += p.speedY;
        if (p.y > CANVAS_HEIGHT) p.y = -10;
        ctx.fillRect(p.x, p.y, 1, 8);
      });
    } else if (w === 'windy') {
      state.weather.particles.forEach((p, idx) => {
        p.x += p.speedX + 1.5;
        p.y += Math.sin(Date.now() * 0.003 + p.x) * 0.5;
        if (p.x > CANVAS_WIDTH) p.x = -10;

        ctx.fillStyle = idx % 2 === 0 ? '#ff80ab' : '#81c784'; // Blossom & Leaf
        ctx.fillRect(p.x, p.y, 4, 3);
      });
    } else if (w === 'snowy') {
      ctx.fillStyle = '#ffffff';
      state.weather.particles.forEach(p => {
        p.y += 1.0;
        p.x += Math.sin(Date.now() * 0.002 + p.y) * 0.5;
        if (p.y > CANVAS_HEIGHT) p.y = -10;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    }

    // Storm Lightning Screen Flash
    if (state.weather.lightningTimer > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else if (overlayAlpha > 0) {
      ctx.fillStyle = `rgba(${overlayColor}, ${overlayAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Night Fireflies
    if (hours >= 20 || hours < 5) {
      ctx.fillStyle = '#ffee00';
      state.fireflies.forEach(f => {
        f.x += f.speedX;
        f.y += f.speedY;
        if (f.x < 0) f.x = CANVAS_WIDTH;
        if (f.x > CANVAS_WIDTH) f.x = 0;
        if (f.y < 0) f.y = CANVAS_HEIGHT;
        if (f.y > CANVAS_HEIGHT) f.y = 0;

        ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.005 + f.x) * 0.4;
        ctx.fillRect(f.x, f.y, f.size, f.size);
      });
      ctx.globalAlpha = 1.0;
    }

  } else if (state.scene === 'house') {
    // ------------------------------------
    // HOUSE INTERIOR SCENE RENDERING
    // ------------------------------------
    ctx.fillStyle = '#11141a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Room Interior Tiles (cols 5..18, rows 4..14)
    for (let r = 4; r <= 14; r++) {
      for (let c = 5; c <= 18; c++) {
        const posX = c * TILE_SIZE;
        const posY = r * TILE_SIZE;

        if (r === 4) {
          ctx.drawImage(SpriteCache.tiles['walnut_wall'], posX, posY);
        } else {
          ctx.drawImage(SpriteCache.tiles['wood_floor'], posX, posY);
        }
      }
    }

    // Exit Mat
    ctx.drawImage(SpriteCache.tiles['exit_mat'], 11 * TILE_SIZE, 14 * TILE_SIZE);
    ctx.drawImage(SpriteCache.tiles['exit_mat'], 12 * TILE_SIZE, 14 * TILE_SIZE);

    // Green Furniture Items
    ctx.drawImage(SpriteCache.decorations['green_rug'], 10 * TILE_SIZE, 8 * TILE_SIZE);
    ctx.drawImage(SpriteCache.decorations['green_bed'], 6 * TILE_SIZE, 5 * TILE_SIZE);
    ctx.drawImage(SpriteCache.decorations['green_sofa'], 14 * TILE_SIZE, 8 * TILE_SIZE);
    ctx.drawImage(SpriteCache.decorations['fireplace'], 11 * TILE_SIZE + 16, 3 * TILE_SIZE + 16);

    // RETRO CRT TELEVISION SET (Next to Green Sofa / Walnut Wall)
    ctx.drawImage(SpriteCache.decorations['tv'], 16 * TILE_SIZE, 4 * TILE_SIZE + 10);
    ctx.fillStyle = '#ffee00';
    ctx.font = '9px Silkscreen, cursive';
    ctx.fillText('TV 📺', 16 * TILE_SIZE, 4 * TILE_SIZE + 4);

    // Render Waps the Yellow Dog!
    const wapsSprite = SpriteCache.waps[state.waps.animFrame] || SpriteCache.waps['idle'];
    ctx.drawImage(wapsSprite, state.waps.x, state.waps.y);

    ctx.fillStyle = '#ffee00';
    ctx.font = '10px Silkscreen, cursive';
    ctx.fillText('Waps 🐶', state.waps.x, state.waps.y - 4);

    // Floating Heart Particles ❤️
    ctx.fillStyle = '#ff80ab';
    state.waps.hearts.forEach(h => {
      ctx.globalAlpha = Math.max(0, h.alpha);
      ctx.fillRect(h.x, h.y, 4, 4);
      ctx.fillRect(h.x - 2, h.y - 2, 2, 2);
      ctx.fillRect(h.x + 4, h.y - 2, 2, 2);
    });
    ctx.globalAlpha = 1.0;

    // Render Bunny Player
    const bunnySprite = SpriteCache.bunny[state.player.dir][state.player.animFrame];
    if (bunnySprite) {
      ctx.drawImage(bunnySprite, state.player.x, state.player.y);
    }

    // Cozy Fireplace & Lamp Glow Overlay
    ctx.fillStyle = 'rgba(255, 180, 80, 0.08)';
    ctx.fillRect(5 * TILE_SIZE, 4 * TILE_SIZE, 14 * TILE_SIZE, 11 * TILE_SIZE);
  }
}

// Open Shop Modal
export function openShopModal() {
  const modal = document.getElementById('shop-modal');
  if (!modal) return;
  modal.classList.add('open');
  renderShopItems();
}

export function closeShopModal() {
  const modal = document.getElementById('shop-modal');
  if (modal) modal.classList.remove('open');
}

// Render Shop Items (Buy Seeds & Sell Crops)
function renderShopItems() {
  const container = document.getElementById('shop-grid');
  if (!container) return;
  container.innerHTML = '';

  Object.keys(CROPS_DATA).forEach(cropKey => {
    const cData = CROPS_DATA[cropKey];
    const card = document.createElement('div');
    card.className = 'shop-item-card';

    const iconBox = document.createElement('div');
    iconBox.className = 'shop-item-icon-box';
    const img = document.createElement('img');
    img.src = SpriteCache.crops[cropKey][3].toDataURL();
    img.style.width = '32px';
    iconBox.appendChild(img);

    const info = document.createElement('div');
    info.className = 'shop-item-info';
    info.innerHTML = `
      <div class="shop-item-name">${cData.name} Seeds</div>
      <div class="shop-item-desc">Grows in ${cData.growthTimeSec}s</div>
      <div class="shop-item-price">🪙 ${cData.seedPrice} Coins</div>
    `;

    const buyBtn = document.createElement('button');
    buyBtn.className = 'buy-sell-btn';
    buyBtn.textContent = 'Buy Seed';
    buyBtn.onclick = () => {
      if (state.coins >= cData.seedPrice) {
        state.coins -= cData.seedPrice;
        addItemToInventory({
          id: `seed_${cropKey}`,
          type: 'seed',
          cropKey: cropKey,
          name: `${cData.name} Seeds`,
          count: 1
        });
        playSound('coin');
        updateHUD();
        renderShopItems();
      } else {
        showNotification("Not enough Bunny Coins!");
      }
    };

    card.appendChild(iconBox);
    card.appendChild(info);
    card.appendChild(buyBtn);
    container.appendChild(card);
  });

  state.inventory.forEach((item, idx) => {
    if (item && item.type === 'crop') {
      const cData = CROPS_DATA[item.cropKey];
      const card = document.createElement('div');
      card.className = 'shop-item-card';

      const iconBox = document.createElement('div');
      iconBox.className = 'shop-item-icon-box';
      const img = document.createElement('img');
      img.src = SpriteCache.crops[item.cropKey][3].toDataURL();
      img.style.width = '32px';
      iconBox.appendChild(img);

      const info = document.createElement('div');
      info.className = 'shop-item-info';
      info.innerHTML = `
        <div class="shop-item-name">${item.name} (x${item.count})</div>
        <div class="shop-item-desc">Sell produce for profit</div>
        <div class="shop-item-price">🪙 ${cData.sellPrice * item.count} Coins</div>
      `;

      const sellBtn = document.createElement('button');
      sellBtn.className = 'buy-sell-btn sell';
      sellBtn.textContent = 'Sell All';
      sellBtn.onclick = () => {
        const totalEarnings = cData.sellPrice * item.count;
        state.coins += totalEarnings;
        state.inventory[idx] = null;
        playSound('coin');
        showNotification(`Sold for 🪙 ${totalEarnings} Coins!`);
        updateHUD();
        renderQuickbar();
        renderShopItems();
      };

      card.appendChild(iconBox);
      card.appendChild(info);
      card.appendChild(sellBtn);
      container.appendChild(card);
    }
  });
}

// Game Loop
let lastFrameTime = 0;
function gameLoop(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.1);
  lastFrameTime = timestamp;

  updatePlayer();
  updateGameTime(dt);
  render();
  requestAnimationFrame(gameLoop);
}

// Main Setup Init
window.addEventListener('DOMContentLoaded', () => {
  state.canvas = document.getElementById('gameCanvas');
  state.canvas.width = CANVAS_WIDTH;
  state.canvas.height = CANVAS_HEIGHT;
  state.ctx = state.canvas.getContext('2d');
  state.ctx.imageSmoothingEnabled = false;

  initAllSprites();
  initGrid();
  setupControls();
  renderQuickbar();
  updateHUD();

  window.addEventListener('click', () => {
    startMusic();
  }, { once: true });

  const shopBtn = document.getElementById('open-shop-btn');
  if (shopBtn) shopBtn.onclick = openShopModal;

  const closeShopBtn = document.getElementById('close-shop-btn');
  if (closeShopBtn) closeShopBtn.onclick = closeShopModal;

  const closeTvBtn = document.getElementById('close-tv-btn');
  if (closeTvBtn) closeTvBtn.onclick = closeTVModal;

  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.onclick = () => {
      const muted = toggleMute();
      audioBtn.textContent = muted ? '🔇 Sound Off' : '🔊 Sound On';
    };
  }

  requestAnimationFrame(gameLoop);
});
