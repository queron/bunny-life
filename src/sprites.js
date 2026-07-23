// SpriteGenerator: Programmatic pixel art canvas renderer
// Renders ultra-crisp 16x16 / 32x32 pixel sprites into cached HTML Canvas elements

export const TILE_SIZE = 32;

// Utility to create a canvas of width x height
function createCanvas(w = TILE_SIZE, h = TILE_SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Utility to draw pixel arrays: 
// map is an array of strings or color keys, colors is a dictionary of char -> hex color
function drawPixelMap(ctx, map, colors, scale = 1, offsetX = 0, offsetY = 0) {
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char !== '.' && colors[char]) {
        ctx.fillStyle = colors[char];
        ctx.fillRect(offsetX + c * scale, offsetY + r * scale, scale, scale);
      }
    }
  }
}

// Global Sprite Cache
export const SpriteCache = {
  bunny: {},
  tiles: {},
  crops: {},
  tools: {},
  decorations: {}
};

// -------------------------------------------------------------
// 1. YELLOW BUNNY PLAYER SPRITE GENERATOR (Matches user drawing!)
// -------------------------------------------------------------
export function initBunnySprites() {
  const directions = ['down', 'up', 'left', 'right'];
  const actions = ['idle', 'walk1', 'walk2', 'action'];

  const C = {
    'Y': '#FFEE00', // Primary Bright Yellow body & ears
    'y': '#ECC94B', // Yellow Shadow/Shading
    'B': '#1A202C', // Black Eyes & Mouth
    'P': '#FF80AB', // Pink Nose
    'W': '#FFFFFF', // Eye highlight
    'O': '#D69E2E', // Dark yellow outline
    'E': '#F6E05E', // Inner ear tone
    'T': '#4a5568'  // Tool dark
  };

  directions.forEach(dir => {
    SpriteCache.bunny[dir] = {};
    actions.forEach(act => {
      const { canvas, ctx } = createCanvas(32, 32);
      
      let bounce = 0;
      let earWiggle = 0;
      if (act === 'walk1') { bounce = -2; earWiggle = 1; }
      if (act === 'walk2') { bounce = -4; earWiggle = -1; }
      if (act === 'action') { bounce = 2; }

      // Bunny facing DOWN (front view like user drawing)
      if (dir === 'down') {
        const pixelMap = [
          "................................",
          "....EEEE............EEEE........",
          "...EYYYYE..........EYYYYE.......",
          "...EYYYYYE........EYYYYYE.......",
          "...EYYYYYE........EYYYYYE.......",
          "....EYYYYE........EYYYYE........",
          ".....EYYYE........EYYYE.........",
          "......EYYE........EYYE..........",
          ".......EYE........EYE...........",
          "........YY........YY............",
          ".......YYYYYYYYYYYYYY...........",
          "......YYYYYYYYYYYYYYYY..........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          ".....YYYYBBYYYYYYBBYYYY.........",
          ".....YYYYBBYYYYYYBBYYYY.........",
          ".....YYYYBBYYYYYYBBYYYY.........",
          ".....YYYYYYYPPPPYYYYYYY.........",
          ".....YYYYYYYPPPPYYYYYYY.........",
          "......YYYYYBB..BBYYYYY..........",
          "......YYYYYBB..BBYYYYY..........",
          ".......YYYYYBBBBYYYYY...........",
          "......YYYYYYYYYYYYYYYY..........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          "....YYYYYYYYYYYYYYYYYYYY........",
          "....YYYYYYYYYYYYYYYYYYYY........",
          "....YYYYYYYYYYYYYYYYYYYY........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          "......YYYYYYYYYYYYYYYY..........",
          ".......yyyy......yyyy...........",
          ".......yyyy......yyyy...........",
          "................................",
          "................................"
        ];
        drawPixelMap(ctx, pixelMap, C, 1, 0, bounce);

        // Action overlay (holding tool / swinging)
        if (act === 'action') {
          ctx.fillStyle = '#A0AEC0';
          ctx.fillRect(20, 16, 8, 4);
          ctx.fillStyle = '#718096';
          ctx.fillRect(22, 12, 4, 12);
        }
      } 
      // Bunny facing UP (back view)
      else if (dir === 'up') {
        const pixelMap = [
          "................................",
          "....EEEE............EEEE........",
          "...EYYYYE..........EYYYYE.......",
          "...EYYYYYE........EYYYYYE.......",
          "...EYYYYYE........EYYYYYE.......",
          "....EYYYYE........EYYYYE........",
          ".....EYYYE........EYYYE.........",
          "......EYYE........EYYE..........",
          ".......EYE........EYE...........",
          "........YY........YY............",
          ".......YYYYYYYYYYYYYY...........",
          "......YYYYYYYYYYYYYYYY..........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          "......YYYYYYYYYYYYYYYY..........",
          "......YYYYYYYYYYYYYYYY..........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          "....YYYYYYYYYYYYYYYYYYYY........",
          "....YYYYYYYYYYYYYYYYYYYY........",
          "....YYYYYYYYYYYYYYYYYYYY........",
          ".....YYYYYYYYYYYYYYYYYY.........",
          "......YYYYYYYYYYYYYYYY..........",
          ".......yyyy......yyyy...........",
          ".......yyyy......yyyy...........",
          "................................",
          "................................"
        ];
        drawPixelMap(ctx, pixelMap, C, 1, 0, bounce);
      }
      // Bunny facing LEFT
      else if (dir === 'left') {
        const pixelMap = [
          "................................",
          "......EEEE......................",
          ".....EYYYYE.....................",
          "....EYYYYYE.....................",
          "....EYYYYYE.....................",
          ".....EYYYYE.....................",
          "......EYYYE.....................",
          ".......EYYE.....................",
          "........EYE.....................",
          ".........YY.....................",
          "........YYYYYYYYYY..............",
          ".......YYYYYYYYYYYYY............",
          "......YYYYBBYYYYYYYYY...........",
          "......YYYYBBYYYYYYYYY...........",
          "......YYYYYYPPPPYYYY............",
          ".......YYYYYBB..YYYY............",
          "........YYYYYBBYYYYY............",
          ".......YYYYYYYYYYYYY............",
          "......YYYYYYYYYYYYYYYY..........",
          ".....YYYYYYYYYYYYYYYYY..........",
          ".....YYYYYYYYYYYYYYYYY..........",
          "......YYYYYYYYYYYYYYYY..........",
          ".......YYYYYYYYYYYYYY...........",
          "........yyyy....yyyy............",
          "........yyyy....yyyy............",
          "................................"
        ];
        drawPixelMap(ctx, pixelMap, C, 1, 0, bounce);
      }
      // Bunny facing RIGHT
      else if (dir === 'right') {
        const pixelMap = [
          "................................",
          "......................EEEE......",
          ".....................EYYYYE.....",
          ".....................EYYYYYE....",
          ".....................EYYYYYE....",
          "......................EYYYYE....",
          ".....................EYYYE......",
          ".....................EYYE.......",
          ".....................EYE........",
          ".....................YY.........",
          "..............YYYYYYYYYY........",
          "............YYYYYYYYYYYYY.......",
          "...........YYYYYYYYYBBYYYY......",
          "...........YYYYYYYYYBBYYYY......",
          "............YYYYPPPPYYYYYY......",
          "............YYYY..BBYYYYY.......",
          "............YYYYYBBYYYYY........",
          "............YYYYYYYYYYYYY.......",
          "..........YYYYYYYYYYYYYYYY......",
          "..........YYYYYYYYYYYYYYYYY.....",
          "..........YYYYYYYYYYYYYYYYY.....",
          "..........YYYYYYYYYYYYYYYY......",
          "...........YYYYYYYYYYYYYY.......",
          "............yyyy....yyyy........",
          "............yyyy....yyyy........",
          "................................"
        ];
        drawPixelMap(ctx, pixelMap, C, 1, 0, bounce);
      }

      SpriteCache.bunny[dir][act] = canvas;
    });
  });
}

// -------------------------------------------------------------
// 2. TERRAIN & ENVIRONMENT TILES
// -------------------------------------------------------------
export function initTileSprites() {
  // Grass Tile
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#558b2f'; // Base Grass Green
    ctx.fillRect(0, 0, 32, 32);
    // Grass blade details
    ctx.fillStyle = '#689f38';
    ctx.fillRect(4, 6, 2, 4);
    ctx.fillRect(18, 12, 3, 3);
    ctx.fillRect(26, 4, 2, 4);
    ctx.fillRect(8, 22, 3, 4);
    ctx.fillRect(22, 24, 2, 3);

    ctx.fillStyle = '#33691e'; // Dark green specs
    ctx.fillRect(12, 16, 2, 2);
    ctx.fillRect(28, 18, 2, 2);
    ctx.fillRect(2, 28, 2, 2);
    SpriteCache.tiles['grass'] = canvas;
  }

  // Tilled Soil (Dry)
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#5d4037'; // Dirt Brown
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#4e342e'; // Dark grooves
    for (let y = 4; y < 32; y += 8) {
      ctx.fillRect(2, y, 28, 3);
    }
    ctx.fillStyle = '#795548'; // Soil highlight
    ctx.fillRect(4, 2, 6, 2);
    ctx.fillRect(18, 10, 8, 2);
    ctx.fillRect(8, 18, 6, 2);
    ctx.fillRect(20, 26, 6, 2);
    SpriteCache.tiles['dirt'] = canvas;
  }

  // Tilled Soil (Watered)
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#3e2723'; // Moist Dark Brown
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#271c19'; // Deep grooves
    for (let y = 4; y < 32; y += 8) {
      ctx.fillRect(2, y, 28, 3);
    }
    ctx.fillStyle = '#4e342e'; // Dark highlight
    ctx.fillRect(4, 2, 6, 2);
    ctx.fillRect(18, 10, 8, 2);
    // Water droplets gleam
    ctx.fillStyle = '#81d4fa';
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillRect(22, 14, 2, 2);
    ctx.fillRect(12, 22, 2, 2);
    SpriteCache.tiles['dirt_watered'] = canvas;
  }

  // Water Pond Tile
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#0288d1';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#039be5';
    ctx.fillRect(4, 4, 24, 24);
    ctx.fillStyle = '#4fc3f7'; // Water ripple
    ctx.fillRect(6, 8, 8, 2);
    ctx.fillRect(18, 20, 10, 2);
    // Lilypad
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(12, 20, 5, 0, Math.PI * 2);
    ctx.fill();
    SpriteCache.tiles['water'] = canvas;
  }

  // Wooden Fence
  {
    const { canvas, ctx } = createCanvas();
    // Transparent background
    ctx.fillStyle = '#8d6e63'; // Wood post
    ctx.fillRect(2, 6, 6, 20);
    ctx.fillRect(24, 6, 6, 20);
    ctx.fillStyle = '#a1887f'; // Planks
    ctx.fillRect(0, 10, 32, 4);
    ctx.fillRect(0, 18, 32, 4);
    ctx.fillStyle = '#5d4037'; // Shadow
    ctx.fillRect(2, 24, 6, 2);
    ctx.fillRect(24, 24, 6, 2);
    SpriteCache.tiles['fence'] = canvas;
  }

  // Pathway Stone
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#78909c';
    ctx.fillRect(4, 4, 10, 10);
    ctx.fillRect(18, 6, 10, 8);
    ctx.fillRect(6, 18, 12, 10);
    ctx.fillRect(20, 18, 8, 10);
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(5, 5, 8, 2);
    ctx.fillRect(19, 7, 8, 2);
    SpriteCache.tiles['stone'] = canvas;
  }
}

// -------------------------------------------------------------
// 3. CROPS SPRITE GENERATOR (7 Crop Varieties with 4 Stages)
// -------------------------------------------------------------
export const CROPS_DATA = {
  carrot: {
    name: 'Carrot 🥕',
    seedPrice: 10,
    sellPrice: 25,
    growthTimeSec: 10,
    color: '#ff6d00',
    energy: 20
  },
  golden_carrot: {
    name: 'Golden Carrot 🌟',
    seedPrice: 50,
    sellPrice: 150,
    growthTimeSec: 25,
    color: '#ffd700',
    energy: 50
  },
  radish: {
    name: 'Radish 🧅',
    seedPrice: 15,
    sellPrice: 40,
    growthTimeSec: 14,
    color: '#e91e63',
    energy: 25
  },
  strawberry: {
    name: 'Strawberry 🍓',
    seedPrice: 30,
    sellPrice: 85,
    growthTimeSec: 20,
    color: '#ff1744',
    energy: 35
  },
  sunflower: {
    name: 'Sunflower 🌻',
    seedPrice: 40,
    sellPrice: 110,
    growthTimeSec: 22,
    color: '#ffea00',
    energy: 40
  },
  watermelon: {
    name: 'Watermelon 🍉',
    seedPrice: 60,
    sellPrice: 180,
    growthTimeSec: 30,
    color: '#2e7d32',
    energy: 60
  },
  clover: {
    name: 'Lucky Clover 🍀',
    seedPrice: 25,
    sellPrice: 70,
    growthTimeSec: 15,
    color: '#00e676',
    energy: 30
  }
};

export function initCropSprites() {
  Object.keys(CROPS_DATA).forEach(cropKey => {
    SpriteCache.crops[cropKey] = [];

    // Stage 0: Tiny seed sprout
    {
      const { canvas, ctx } = createCanvas();
      ctx.fillStyle = '#8bc34a';
      ctx.fillRect(14, 20, 4, 4);
      ctx.fillRect(15, 18, 2, 2);
      SpriteCache.crops[cropKey].push(canvas);
    }

    // Stage 1: Small growing sprout
    {
      const { canvas, ctx } = createCanvas();
      ctx.fillStyle = '#689f38';
      ctx.fillRect(13, 16, 6, 6);
      ctx.fillRect(11, 14, 4, 4);
      ctx.fillRect(17, 14, 4, 4);
      SpriteCache.crops[cropKey].push(canvas);
    }

    // Stage 2: Medium leafy plant
    {
      const { canvas, ctx } = createCanvas();
      ctx.fillStyle = '#33691e';
      ctx.fillRect(10, 12, 12, 10);
      ctx.fillStyle = '#558b2f';
      ctx.fillRect(8, 10, 6, 6);
      ctx.fillRect(18, 10, 6, 6);
      SpriteCache.crops[cropKey].push(canvas);
    }

    // Stage 3: Fully Ripe Harvestable Crop!
    {
      const { canvas, ctx } = createCanvas();
      // Leaves top
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(12, 4, 8, 8);
      ctx.fillRect(8, 8, 4, 4);
      ctx.fillRect(20, 8, 4, 4);

      // Crop Fruit / Veggie Body
      const cData = CROPS_DATA[cropKey];
      ctx.fillStyle = cData.color;

      if (cropKey === 'carrot') {
        ctx.beginPath();
        ctx.moveTo(16, 28);
        ctx.lineTo(10, 14);
        ctx.lineTo(22, 14);
        ctx.closePath();
        ctx.fill();
      } else if (cropKey === 'golden_carrot') {
        ctx.fillStyle = '#ffe082';
        ctx.beginPath();
        ctx.moveTo(16, 28);
        ctx.lineTo(9, 12);
        ctx.lineTo(23, 12);
        ctx.closePath();
        ctx.fill();
        // Golden sparkle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 16, 4, 4);
      } else if (cropKey === 'strawberry') {
        ctx.beginPath();
        ctx.arc(16, 20, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff'; // seeds
        ctx.fillRect(14, 18, 2, 2);
        ctx.fillRect(18, 21, 2, 2);
      } else if (cropKey === 'sunflower') {
        ctx.fillStyle = '#795548'; // center seed disc
        ctx.beginPath();
        ctx.arc(16, 14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffea00'; // yellow petals
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          ctx.fillRect(16 + Math.cos(ang) * 8 - 2, 14 + Math.sin(ang) * 8 - 2, 4, 4);
        }
      } else if (cropKey === 'watermelon') {
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.arc(16, 20, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81c784'; // stripes
        ctx.fillRect(12, 14, 2, 12);
        ctx.fillRect(18, 14, 2, 12);
      } else {
        // Radish / Clover
        ctx.beginPath();
        ctx.arc(16, 20, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      SpriteCache.crops[cropKey].push(canvas);
    }
  });
}

// -------------------------------------------------------------
// 4. TOOLS & UI ICONS
// -------------------------------------------------------------
export function initToolSprites() {
  // Hoe Tool
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#8d6e63'; // Wooden handle
    ctx.fillRect(6, 22, 18, 4);
    ctx.fillStyle = '#b0bec5'; // Metal head
    ctx.fillRect(20, 10, 6, 14);
    ctx.fillStyle = '#eceff1'; // Metal shine
    ctx.fillRect(24, 10, 2, 14);
    SpriteCache.tools['hoe'] = canvas;
  }

  // Watering Can
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#29b6f6'; // Blue Body
    ctx.fillRect(8, 12, 14, 14);
    ctx.fillStyle = '#81d4fa'; // Spout & Handle
    ctx.fillRect(4, 16, 4, 4);
    ctx.fillRect(22, 14, 6, 3);
    ctx.fillRect(26, 10, 3, 6);
    SpriteCache.tools['watering_can'] = canvas;
  }

  // Harvest Glove / Hand
  {
    const { canvas, ctx } = createCanvas();
    ctx.fillStyle = '#ffb74d'; // Glove
    ctx.fillRect(10, 10, 12, 14);
    ctx.fillRect(6, 14, 4, 6);
    ctx.fillStyle = '#e65100'; // Cuff
    ctx.fillRect(10, 22, 12, 4);
    SpriteCache.tools['glove'] = canvas;
  }
}

// -------------------------------------------------------------
// 5. LARGE STRUCTURES (Burrow House & Market Stall)
// -------------------------------------------------------------
export function initDecorationSprites() {
  // Cozy Bunny Burrow House (64x64)
  {
    const { canvas, ctx } = createCanvas(64, 64);
    // Earthy mound roof
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.arc(32, 36, 28, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#2e7d32'; // Grass tufts on top
    ctx.fillRect(16, 12, 8, 4);
    ctx.fillRect(40, 14, 8, 4);

    // Front wood burrow wall
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(12, 36, 40, 24);

    // Round doorway
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(32, 52, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(22, 52, 20, 10);

    // Yellow Bunny Ear Sign above doorway!
    ctx.fillStyle = '#ffee00';
    ctx.fillRect(26, 24, 4, 10);
    ctx.fillRect(34, 24, 4, 10);
    ctx.fillStyle = '#ff80ab';
    ctx.fillRect(27, 26, 2, 6);
    ctx.fillRect(35, 26, 2, 6);

    SpriteCache.decorations['burrow'] = canvas;
  }

  // Market Stall Shop (64x64)
  {
    const { canvas, ctx } = createCanvas(64, 64);
    // Striped Canopy (Yellow & Red)
    for (let x = 4; x < 60; x += 14) {
      ctx.fillStyle = '#ffb300'; // Yellow
      ctx.fillRect(x, 8, 7, 16);
      ctx.fillStyle = '#e53935'; // Red
      ctx.fillRect(x + 7, 8, 7, 16);
    }

    // Wood Counter
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(4, 28, 56, 26);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(4, 50, 56, 4);

    // Display Veggies on Counter
    ctx.fillStyle = '#ff6d00'; // Carrot
    ctx.fillRect(12, 34, 6, 8);
    ctx.fillStyle = '#76ff03'; // Apple/Radish
    ctx.fillRect(28, 34, 8, 8);
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(44, 34, 8, 8);

    SpriteCache.decorations['shop'] = canvas;
  }
}

// Master Initialize Function
export function initAllSprites() {
  initBunnySprites();
  initTileSprites();
  initCropSprites();
  initToolSprites();
  initDecorationSprites();
  console.log('All pixel art sprites initialized successfully!');
}
