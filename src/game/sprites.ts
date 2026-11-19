import {
  Boss,
  BossProjectile,
  Checkpoint,
  Coin,
  Decoration,
  Enemy,
  FloatingText,
  GameWorld,
  HittableBlock,
  Particle,
  Platform,
  Player,
  Portal,
  PowerUpItem,
  Signpost,
  SpikeTrap,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './types';

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  time: number
) {
  // Rich enchanted forest sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  skyGrad.addColorStop(0, '#135f7a');
  skyGrad.addColorStop(0.45, '#3aa1b5');
  skyGrad.addColorStop(0.82, '#8cd8be');
  skyGrad.addColorStop(1, '#bcebd0');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  // Soft sun glow
  const sunX = 760 - (cameraX * 0.02) % 200;
  const sunGrad = ctx.createRadialGradient(sunX, 90, 10, sunX, 90, 140);
  sunGrad.addColorStop(0, 'rgba(255, 248, 200, 0.75)');
  sunGrad.addColorStop(0.4, 'rgba(255, 240, 160, 0.25)');
  sunGrad.addColorStop(1, 'rgba(255, 240, 160, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(sunX - 150, -50, 300, 300);

  // Parallax Layer 1: Pixel Clouds
  const cloudScroll = cameraX * 0.08 + time * 8;
  for (let i = 0; i < 8; i++) {
    const cx = ((i * 220 - cloudScroll) % (VIEW_WIDTH + 220) + (VIEW_WIDTH + 220)) % (VIEW_WIDTH + 220) - 110;
    const cy = 48 + (i % 3) * 34;
    px(ctx, cx, cy, 76, 18, 'rgba(255,255,255,0.75)');
    px(ctx, cx + 14, cy - 12, 46, 14, 'rgba(255,255,255,0.85)');
    px(ctx, cx + 26, cy - 20, 24, 10, 'rgba(255,255,255,0.9)');
  }

  // Parallax Layer 2: Distant Spires, Temple Ruins & Waterfalls
  const farScroll = cameraX * 0.16;
  const farSpan = 480;
  const startFar = Math.floor(farScroll / farSpan) - 1;
  for (let i = startFar; i <= startFar + 4; i++) {
    const bx = i * farSpan - farScroll;
    // Tall misty cliff/mountain
    px(ctx, bx + 20, 180, 140, 360, '#2a6f75');
    px(ctx, bx + 45, 140, 90, 45, '#2a6f75');
    px(ctx, bx + 20, 174, 140, 10, '#3e9472'); // moss top

    // Distant temple / castle spire
    px(ctx, bx + 230, 165, 110, 375, '#256168');
    px(ctx, bx + 260, 110, 50, 60, '#21545c');
    px(ctx, bx + 275, 78, 20, 36, '#1c474f');
    px(ctx, bx + 282, 58, 6, 22, '#1c474f');
    // Glowing window
    px(ctx, bx + 280, 130, 10, 14, '#fde68a');

    // Distant twin waterfalls
    const wfOffset = (time * 40) % 16;
    px(ctx, bx + 66, 184, 18, 356, '#7be0e8');
    px(ctx, bx + 70, 184, 6, 356, '#d6fbff');
    for (let w = 0; w < 18; w++) {
      px(ctx, bx + 67, 190 + w * 20 + wfOffset, 16, 4, 'rgba(255,255,255,0.45)');
    }
    px(ctx, bx + 380, 210, 100, 330, '#2c7678');
    px(ctx, bx + 392, 204, 76, 10, '#46a379');
  }

  // Parallax Layer 3: Mid-ground Forest Trees & Canopy
  const midScroll = cameraX * 0.35;
  const midSpan = 260;
  const startMid = Math.floor(midScroll / midSpan) - 1;
  for (let i = startMid; i <= startMid + 6; i++) {
    const tx = i * midSpan - midScroll;
    const hVar = ((i * 73) % 50) + 180;
    // Trunk
    px(ctx, tx + 42, VIEW_HEIGHT - hVar, 36, hVar, '#254231');
    px(ctx, tx + 52, VIEW_HEIGHT - hVar, 10, hVar, '#335840');
    // Lush canopy cluster
    px(ctx, tx, VIEW_HEIGHT - hVar - 48, 120, 62, '#1b5e38');
    px(ctx, tx + 18, VIEW_HEIGHT - hVar - 74, 84, 34, '#247946');
    px(ctx, tx + 32, VIEW_HEIGHT - hVar - 86, 56, 18, '#369b5a');

    // Second smaller tree
    px(ctx, tx + 166, VIEW_HEIGHT - 140, 22, 140, '#2b4d37');
    px(ctx, tx + 136, VIEW_HEIGHT - 178, 82, 48, '#1f6c40');
    px(ctx, tx + 150, VIEW_HEIGHT - 196, 54, 24, '#2f8c52');
  }

  // Subtle sunbeams through canopy
  ctx.fillStyle = 'rgba(255, 250, 210, 0.06)';
  for (let i = 0; i < 4; i++) {
    const beamX = ((i * 320 - cameraX * 0.22) % (VIEW_WIDTH + 300) + (VIEW_WIDTH + 300)) % (VIEW_WIDTH + 300) - 120;
    ctx.beginPath();
    ctx.moveTo(beamX, 0);
    ctx.lineTo(beamX + 60, 0);
    ctx.lineTo(beamX + 190, VIEW_HEIGHT);
    ctx.lineTo(beamX + 90, VIEW_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  // Distant forest water shimmer at very bottom
  px(ctx, 0, VIEW_HEIGHT - 22, VIEW_WIDTH, 22, '#145a64');
  for (let i = 0; i < 16; i++) {
    const rx = ((i * 80 - cameraX * 0.5 + time * 18) % (VIEW_WIDTH + 80) + (VIEW_WIDTH + 80)) % (VIEW_WIDTH + 80) - 40;
    px(ctx, rx, VIEW_HEIGHT - 16 + (i % 2) * 6, 36, 3, 'rgba(165, 243, 252, 0.35)');
  }

  // Drifting golden forest motes / fireflies
  for (let i = 0; i < 18; i++) {
    const mx = ((i * 97 + time * 14 - cameraX * 0.45) % VIEW_WIDTH + VIEW_WIDTH) % VIEW_WIDTH;
    const my = 120 + ((i * 61) % 320) + Math.sin(time * 2 + i) * 14;
    const alpha = 0.35 + 0.35 * Math.sin(time * 3 + i * 1.7);
    ctx.fillStyle = `rgba(253, 230, 138, ${alpha.toFixed(2)})`;
    ctx.fillRect(Math.round(mx), Math.round(my), 3, 3);
  }
}

export function renderPlatform(
  ctx: CanvasRenderingContext2D,
  p: Platform,
  camX: number,
  time: number
) {
  const x = Math.round(p.x - camX);
  const y = Math.round(p.y);
  if (x + p.width < -60 || x > VIEW_WIDTH + 60) return;

  if (p.kind === 'bridge') {
    // Timber deck + support trusses
    px(ctx, x, y, p.width, 14, '#784421');
    px(ctx, x, y, p.width, 4, '#a66332');
    px(ctx, x, y + 12, p.width, 4, '#4a2810');
    // Planks
    for (let bx = 0; bx < p.width; bx += 20) {
      px(ctx, x + bx, y, 2, 14, '#4a2810');
    }
    // Support beams underneath
    px(ctx, x + 12, y + 14, 10, p.height - 14, '#593115');
    px(ctx, x + p.width - 22, y + 14, 10, p.height - 14, '#593115');
    for (let bx = 28; bx < p.width - 28; bx += 80) {
      px(ctx, x + bx, y + 14, 8, p.height - 14, '#4a2810');
      // Cross brace visual
      px(ctx, x + bx - 16, y + 26, 40, 5, '#593115');
    }
    return;
  }

  if (p.kind === 'floating' || p.kind === 'moving') {
    const isMoving = p.kind === 'moving';
    // Stone base
    px(ctx, x + 4, y + 8, p.width - 8, p.height - 8, '#4a3c31');
    px(ctx, x + 8, y + p.height - 6, p.width - 16, 6, '#362a21');
    // Pixel stone bricks
    for (let bx = 6; bx < p.width - 14; bx += 22) {
      px(ctx, x + bx, y + 14, 16, 10, isMoving ? '#4d5d58' : '#635143');
      if (isMoving) {
        // Glowing emerald rune on moving platforms
        const pulse = 0.5 + 0.5 * Math.sin(time * 4 + bx);
        ctx.fillStyle = `rgba(52, 211, 153, ${0.45 + pulse * 0.45})`;
        ctx.fillRect(x + bx + 5, y + 17, 6, 4);
      }
    }
    // Mossy grass cap
    px(ctx, x, y, p.width, 10, '#2ea44f');
    px(ctx, x, y, p.width, 4, '#6ee77a');
    for (let gx = 4; gx < p.width - 6; gx += 12) {
      px(ctx, x + gx, y + 10, 6, 4, '#22863a');
    }
    return;
  }

  if (p.kind === 'secret_floor') {
    px(ctx, x, y, p.width, p.height, '#2e4a3d');
    px(ctx, x, y, p.width, 8, '#fbbf24');
    px(ctx, x, y + 8, p.width, 4, '#b45309');
    for (let bx = 8; bx < p.width - 12; bx += 24) {
      px(ctx, x + bx, y + 16, 16, 12, '#3b5f4f');
    }
    return;
  }

  // 'ground' or 'pillar'
  px(ctx, x, y + 10, p.width, p.height - 10, '#3f2e21');
  // Dirt pebbles / stone strata
  for (let row = 16; row < p.height - 10; row += 26) {
    for (let col = 8; col < p.width - 14; col += 32) {
      const offset = (row % 52 === 16 ? 0 : 14);
      if (col + offset < p.width - 16) {
        px(ctx, x + col + offset, y + row, 16, 10, '#543e2d');
        px(ctx, x + col + offset + 2, y + row + 2, 10, 4, '#69503b');
      }
    }
  }
  // Left/right stone edge highlight
  px(ctx, x, y + 10, 4, p.height - 10, '#2c1f16');
  px(ctx, x + p.width - 4, y + 10, 4, p.height - 10, '#2c1f16');

  // Lush moss & grass top
  px(ctx, x - 2, y, p.width + 4, 12, '#22863a');
  px(ctx, x - 2, y, p.width + 4, 5, '#5ad666');
  for (let gx = 2; gx < p.width - 4; gx += 14) {
    px(ctx, x + gx, y + 12, 8, 5, '#19692c');
    if (gx % 28 === 2) {
      px(ctx, x + gx + 2, y - 3, 4, 3, '#7ef288');
    }
  }
}

export function renderDecoration(
  ctx: CanvasRenderingContext2D,
  d: Decoration,
  camX: number,
  time: number
) {
  const x = Math.round(d.x - camX);
  const y = Math.round(d.y);
  if (x < -100 || x > VIEW_WIDTH + 100) return;

  if (d.kind === 'lantern') {
    // Wooden post + hanging lantern (inspired by reference image 1)
    px(ctx, x, y - 54, 6, 54, '#593115');
    px(ctx, x, y - 54, 24, 5, '#593115');
    px(ctx, x + 19, y - 49, 2, 6, '#334155');
    // Lantern body
    px(ctx, x + 14, y - 43, 12, 14, '#1e293b');
    const flicker = 0.75 + 0.25 * Math.sin(time * 7 + d.x);
    ctx.fillStyle = `rgba(253, 224, 71, ${flicker.toFixed(2)})`;
    ctx.fillRect(x + 16, y - 41, 8, 10);
    // Warm glow halo
    const glow = ctx.createRadialGradient(x + 20, y - 36, 2, x + 20, y - 36, 36);
    glow.addColorStop(0, `rgba(253, 224, 71, ${(0.35 * flicker).toFixed(2)})`);
    glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 16, y - 72, 72, 72);
  } else if (d.kind === 'crate') {
    px(ctx, x, y - 28, 28, 28, '#8c5327');
    px(ctx, x + 3, y - 25, 22, 22, '#b46f39');
    px(ctx, x, y - 28, 28, 3, '#542e12');
    px(ctx, x, y - 3, 28, 3, '#542e12');
    px(ctx, x + 12, y - 25, 4, 22, '#6b3b18');
  } else if (d.kind === 'pot') {
    px(ctx, x + 4, y - 20, 18, 20, '#9a4f25');
    px(ctx, x + 2, y - 16, 22, 12, '#b86231');
    px(ctx, x + 6, y - 24, 14, 4, '#c97240');
  } else if (d.kind === 'bush') {
    px(ctx, x, y - 18, 44, 18, '#1b6e35');
    px(ctx, x + 8, y - 26, 28, 12, '#279147');
    px(ctx, x + 14, y - 24, 6, 4, '#5ee078');
  } else if (d.kind === 'flower') {
    px(ctx, x + 5, y - 10, 2, 10, '#22c55e');
    px(ctx, x + 2, y - 14, 8, 6, '#fb923c');
    px(ctx, x + 4, y - 12, 4, 3, '#fef08a');
  } else if (d.kind === 'torch') {
    px(ctx, x + 4, y - 26, 4, 26, '#593115');
    const f = Math.sin(time * 12 + d.x) * 2;
    px(ctx, x + 2, y - 34 + f * 0.4, 8, 9, '#f97316');
    px(ctx, x + 4, y - 32 + f * 0.4, 4, 5, '#fef08a');
  }
}

export function renderSignpost(
  ctx: CanvasRenderingContext2D,
  s: Signpost,
  camX: number,
  nearPlayer: boolean
) {
  const x = Math.round(s.x - camX);
  const y = Math.round(s.y);
  if (x < -80 || x > VIEW_WIDTH + 80) return;

  px(ctx, x + 13, y - 24, 6, 24, '#5c3417');
  px(ctx, x, y - 40, 32, 20, '#965a2c');
  px(ctx, x + 2, y - 38, 28, 16, '#b8743d');
  px(ctx, x + 6, y - 34, 20, 3, '#5c3417');
  px(ctx, x + 6, y - 28, 14, 3, '#5c3417');

  if (nearPlayer) {
    // Subtle glowing exclamation above signpost
    px(ctx, x + 14, y - 54, 4, 8, '#fde047');
    px(ctx, x + 14, y - 44, 4, 3, '#fde047');
  }
}

export function renderCheckpoint(
  ctx: CanvasRenderingContext2D,
  cp: Checkpoint,
  camX: number,
  time: number
) {
  const x = Math.round(cp.x - camX);
  const y = Math.round(cp.y);
  if (x < -60 || x > VIEW_WIDTH + 60) return;

  // Stone pedestal & pole
  px(ctx, x - 6, y - 10, 20, 10, '#475569');
  px(ctx, x + 2, y - 56, 4, 46, '#94a3b8');

  if (cp.activated) {
    const wave = Math.sin(time * 6) * 2;
    px(ctx, x + 6, y - 54 + wave * 0.4, 24, 16, '#10b981');
    px(ctx, x + 10, y - 50 + wave * 0.4, 12, 8, '#a7f3d0');
    // Glowing crystal atop pole
    px(ctx, x, y - 64, 8, 8, '#fde047');
  } else {
    px(ctx, x + 6, y - 54, 20, 14, '#64748b');
    px(ctx, x, y - 64, 8, 8, '#38bdf8');
  }
}

export function renderBlock(
  ctx: CanvasRenderingContext2D,
  b: HittableBlock,
  camX: number,
  time: number
) {
  if (b.broken) return;
  const x = Math.round(b.x - camX);
  const y = Math.round(b.y + b.bounceY);
  if (x + b.width < -40 || x > VIEW_WIDTH + 40) return;

  if (b.kind === 'brick') {
    px(ctx, x, y, b.width, b.height, '#7c3f1d');
    px(ctx, x + 2, y + 2, b.width - 4, b.height - 4, '#a4572c');
    // Brick seams
    px(ctx, x, y + 18, b.width, 3, '#542911');
    px(ctx, x + 18, y, 3, 18, '#542911');
    px(ctx, x + 8, y + 21, 3, 18, '#542911');
    px(ctx, x + 28, y + 21, 3, 18, '#542911');
    if (b.secret) {
      // Subtle mossy shimmer indicating secret block
      const shimmer = 0.35 + 0.35 * Math.sin(time * 5 + b.x);
      ctx.fillStyle = `rgba(110, 231, 183, ${shimmer.toFixed(2)})`;
      ctx.fillRect(x + 4, y + 4, 8, 4);
    }
    return;
  }

  if (b.used) {
    px(ctx, x, y, b.width, b.height, '#475569');
    px(ctx, x + 3, y + 3, b.width - 6, b.height - 6, '#64748b');
    px(ctx, x + 6, y + 6, 4, 4, '#334155');
    px(ctx, x + b.width - 10, y + 6, 4, 4, '#334155');
    return;
  }

  const pulse = Math.sin(time * 5 + b.x * 0.05) > 0;
  const baseColor =
    b.kind === 'star'
      ? '#d97706'
      : b.kind === 'heart'
      ? '#be123c'
      : '#ca8a04';
  const faceColor =
    b.kind === 'star'
      ? '#fbbf24'
      : b.kind === 'heart'
      ? '#fb7185'
      : '#facc15';

  px(ctx, x, y, b.width, b.height, baseColor);
  px(ctx, x + 3, y + 3, b.width - 6, b.height - 6, faceColor);
  // Corner rivets
  px(ctx, x + 5, y + 5, 4, 4, baseColor);
  px(ctx, x + b.width - 9, y + 5, 4, 4, baseColor);
  px(ctx, x + 5, y + b.height - 9, 4, 4, baseColor);
  px(ctx, x + b.width - 9, y + b.height - 9, 4, 4, baseColor);

  // Symbol
  ctx.fillStyle = pulse ? '#ffffff' : '#fef08a';
  if (b.kind === 'star') {
    px(ctx, x + 17, y + 9, 6, 20, '#ffffff');
    px(ctx, x + 10, y + 16, 20, 6, '#ffffff');
  } else if (b.kind === 'heart') {
    px(ctx, x + 11, y + 12, 7, 7, '#ffffff');
    px(ctx, x + 22, y + 12, 7, 7, '#ffffff');
    px(ctx, x + 13, y + 17, 14, 7, '#ffffff');
    px(ctx, x + 17, y + 24, 6, 4, '#ffffff');
  } else {
    // Question mark
    px(ctx, x + 14, y + 10, 12, 4, '#ffffff');
    px(ctx, x + 22, y + 14, 4, 6, '#ffffff');
    px(ctx, x + 17, y + 18, 6, 4, '#ffffff');
    px(ctx, x + 17, y + 26, 5, 5, '#ffffff');
  }
}

export function renderCoin(
  ctx: CanvasRenderingContext2D,
  c: Coin,
  camX: number,
  time: number
) {
  if (c.collected) return;
  const x = Math.round(c.x - camX);
  const y = Math.round(c.y + Math.sin(time * 5 + c.bobOffset) * 4);
  if (x < -30 || x > VIEW_WIDTH + 30) return;

  const spin = Math.abs(Math.cos(time * 5 + c.bobOffset));
  const w = Math.max(4, Math.round(18 * spin));

  px(ctx, x - w / 2, y - 10, w, 20, '#ca8a04');
  px(ctx, x - w / 2 + 2, y - 8, Math.max(2, w - 4), 16, '#facc15');
  if (w >= 10) {
    px(ctx, x - 2, y - 5, 4, 10, '#fef08a');
  }
}

export function renderPowerUp(
  ctx: CanvasRenderingContext2D,
  item: PowerUpItem,
  camX: number,
  time: number
) {
  if (item.collected) return;
  const x = Math.round(item.x - camX);
  const y = Math.round(item.y);
  if (x < -40 || x > VIEW_WIDTH + 40) return;

  if (item.kind === 'star') {
    const hue = Math.floor((time * 240) % 360);
    const color = `hsl(${hue}, 95%, 62%)`;
    px(ctx, x + 9, y + 2, 8, 22, color);
    px(ctx, x + 2, y + 9, 22, 8, color);
    px(ctx, x + 5, y + 5, 16, 16, '#fef08a');
    px(ctx, x + 9, y + 9, 3, 5, '#1e293b');
    px(ctx, x + 15, y + 9, 3, 5, '#1e293b');
  } else {
    // Pixel Heart
    px(ctx, x + 2, y + 5, 9, 8, '#ef4444');
    px(ctx, x + 15, y + 5, 9, 8, '#ef4444');
    px(ctx, x + 4, y + 11, 18, 7, '#ef4444');
    px(ctx, x + 8, y + 18, 10, 5, '#ef4444');
    px(ctx, x + 11, y + 23, 4, 3, '#ef4444');
    px(ctx, x + 5, y + 7, 3, 3, '#fecaca');
  }
}

export function renderSpikes(
  ctx: CanvasRenderingContext2D,
  s: SpikeTrap,
  camX: number
) {
  const x = Math.round(s.x - camX);
  const y = Math.round(s.y);
  if (x + s.width < -30 || x > VIEW_WIDTH + 30) return;

  const count = Math.max(1, Math.floor(s.width / 16));
  const step = s.width / count;
  for (let i = 0; i < count; i++) {
    const sx = x + i * step;
    // Metallic pixel triangle spike
    px(ctx, sx + 2, y + s.height - 6, step - 4, 6, '#64748b');
    px(ctx, sx + 4, y + s.height - 12, step - 8, 6, '#94a3b8');
    px(ctx, sx + 6, y + s.height - 18, step - 12, 6, '#cbd5e1');
    px(ctx, sx + step / 2 - 1, y, 3, 4, '#f8fafc');
  }
}

export function renderEnemy(
  ctx: CanvasRenderingContext2D,
  e: Enemy,
  camX: number
) {
  const x = Math.round(e.x - camX);
  const y = Math.round(e.y);
  if (x + e.width < -40 || x > VIEW_WIDTH + 40) return;

  if (!e.alive) {
    // Squished sprite
    if (e.kind === 'slime') {
      px(ctx, x - 4, y + e.height - 8, e.width + 8, 8, '#22c55e');
    } else if (e.kind === 'mushroom') {
      px(ctx, x - 2, y + e.height - 9, e.width + 4, 9, '#dc2626');
    } else {
      px(ctx, x, y + e.height - 8, e.width, 8, '#cbd5e1');
    }
    return;
  }

  const bob = Math.sin(e.animTimer * 8) * 2;

  if (e.kind === 'slime') {
    const squash = Math.sin(e.animTimer * 7) * 2;
    px(ctx, x - squash, y + 6 + squash, e.width + squash * 2, e.height - 6 - squash, '#16a34a');
    px(ctx, x + 3 - squash, y + 3 + squash, e.width - 6 + squash * 2, e.height - 9 - squash, '#4ade80');
    px(ctx, x + 7, y + 7 + squash, 6, 4, '#bbf7d0');
    // Eyes
    const ex = e.facing === 1 ? x + e.width - 16 : x + 6;
    px(ctx, ex, y + 14 + squash, 4, 5, '#0f172a');
    px(ctx, ex + 7, y + 14 + squash, 4, 5, '#0f172a');
    return;
  }

  if (e.kind === 'mushroom') {
    // Red spotted mushroom creature (inspired by image 1)
    // Stem
    px(ctx, x + 7, y + 18, e.width - 14, e.height - 18, '#fef3c7');
    // Feet
    const step = Math.sin(e.animTimer * 10) * 3;
    px(ctx, x + 6 + step, y + e.height - 6, 8, 6, '#78350f');
    px(ctx, x + e.width - 14 - step, y + e.height - 6, 8, 6, '#78350f');
    // Red cap
    px(ctx, x, y + 4 + bob * 0.4, e.width, 16, '#dc2626');
    px(ctx, x + 4, y + bob * 0.4, e.width - 8, 6, '#ef4444');
    // White spots
    px(ctx, x + 5, y + 6 + bob * 0.4, 6, 5, '#ffffff');
    px(ctx, x + e.width - 12, y + 7 + bob * 0.4, 5, 5, '#ffffff');
    px(ctx, x + 15, y + 2 + bob * 0.4, 5, 4, '#ffffff');
    // Angry eyes
    px(ctx, x + 10, y + 21, 4, 4, '#1e293b');
    px(ctx, x + e.width - 14, y + 21, 4, 4, '#1e293b');
    return;
  }

  // Skeleton sentinel (inspired by image 1)
  const walk = Math.sin(e.animTimer * 10) * 3;
  // Skull
  px(ctx, x + 7, y + bob * 0.3, 18, 16, '#f1f5f9');
  px(ctx, x + 10, y + 6 + bob * 0.3, 4, 4, '#0f172a');
  px(ctx, x + 18, y + 6 + bob * 0.3, 4, 4, '#0f172a');
  // Ribcage
  px(ctx, x + 9, y + 17, 14, 13, '#cbd5e1');
  px(ctx, x + 11, y + 20, 10, 2, '#475569');
  px(ctx, x + 11, y + 24, 10, 2, '#475569');
  // Legs
  px(ctx, x + 9 + walk, y + 30, 5, 10, '#e2e8f0');
  px(ctx, x + 18 - walk, y + 30, 5, 10, '#e2e8f0');
  // Tiny sword & shield
  if (e.facing === 1) {
    px(ctx, x + 25, y + 14, 10, 4, '#94a3b8');
    px(ctx, x + 23, y + 12, 3, 8, '#78350f');
    px(ctx, x + 1, y + 16, 8, 12, '#92400e');
  } else {
    px(ctx, x - 3, y + 14, 10, 4, '#94a3b8');
    px(ctx, x + 6, y + 12, 3, 8, '#78350f');
    px(ctx, x + 23, y + 16, 8, 12, '#92400e');
  }
}

export function renderBoss(
  ctx: CanvasRenderingContext2D,
  boss: Boss,
  camX: number,
  time: number
) {
  if (boss.phase === 'defeated') return;
  const x = Math.round(boss.x - camX);
  const y = Math.round(boss.y);
  if (x + boss.width < -100 || x > VIEW_WIDTH + 100) return;

  const isHurtFlash = boss.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0;
  const wingFlap = Math.sin(time * 28) * 10;

  // Translucent insect wings (inspired by reference image 2!)
  ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
  ctx.fillRect(x + 14, y - 14 + wingFlap * 0.5, 24, 28);
  ctx.fillRect(x + boss.width - 38, y - 14 - wingFlap * 0.5, 24, 28);

  // Segmented amber-orange abdomen
  px(
    ctx,
    x + 16,
    y + 28,
    boss.width - 32,
    boss.height - 32,
    isHurtFlash ? '#ffffff' : '#c2410c'
  );
  px(
    ctx,
    x + 22,
    y + 32,
    boss.width - 44,
    boss.height - 40,
    isHurtFlash ? '#ffffff' : '#ea580c'
  );
  // Stripes
  px(ctx, x + 22, y + 44, boss.width - 44, 5, isHurtFlash ? '#fef08a' : '#7c2d12');
  px(ctx, x + 24, y + 58, boss.width - 48, 5, isHurtFlash ? '#fef08a' : '#7c2d12');
  // Stinger bottom tip
  px(ctx, x + boss.width / 2 - 4, y + boss.height - 6, 8, 10, '#facc15');

  // Armored forest-green head & thorax
  px(
    ctx,
    x + 24,
    y + 4,
    boss.width - 48,
    30,
    isHurtFlash ? '#ffffff' : '#4d7c0f'
  );
  px(
    ctx,
    x + 30,
    y + 8,
    boss.width - 60,
    18,
    isHurtFlash ? '#ffffff' : '#84cc16'
  );

  // Large crimson eyes
  px(ctx, x + 28, y + 14, 12, 12, '#991b1b');
  px(ctx, x + 31, y + 16, 4, 4, '#fca5a5');
  px(ctx, x + boss.width - 40, y + 14, 12, 12, '#991b1b');
  px(ctx, x + boss.width - 37, y + 16, 4, 4, '#fca5a5');

  // Armored legs
  px(ctx, x + 6, y + 36, 14, 6, '#cbd5e1');
  px(ctx, x + 2, y + 42, 6, 16, '#94a3b8');
  px(ctx, x + boss.width - 20, y + 36, 14, 6, '#cbd5e1');
  px(ctx, x + boss.width - 8, y + 42, 6, 16, '#94a3b8');

  // Telegraph glow before firing
  if (boss.phase === 'telegraph') {
    const pulse = 0.4 + 0.4 * Math.sin(time * 22);
    ctx.strokeStyle = `rgba(251, 191, 36, ${pulse.toFixed(2)})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 4, y - 4, boss.width + 8, boss.height + 8);
  }

  // Vulnerability indicator: clear downward arrow / weak-spot ring above head
  if (boss.phase === 'vulnerable') {
    const bob = Math.sin(time * 10) * 5;
    const cx = x + boss.width / 2;
    const cy = y - 24 + bob;
    px(ctx, cx - 4, cy - 10, 8, 10, '#fde047');
    px(ctx, cx - 10, cy, 20, 4, '#fde047');
    px(ctx, cx - 6, cy + 4, 12, 4, '#fde047');
    px(ctx, cx - 2, cy + 8, 4, 4, '#fde047');
  }
}

export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  proj: BossProjectile,
  camX: number
) {
  const x = Math.round(proj.x - camX);
  const y = Math.round(proj.y);
  if (x < -30 || x > VIEW_WIDTH + 30) return;

  px(ctx, x - 7, y - 7, 14, 14, '#7e22ce');
  px(ctx, x - 5, y - 5, 10, 10, '#c084fc');
  px(ctx, x - 2, y - 2, 4, 4, '#fef08a');
}

export function renderPortal(
  ctx: CanvasRenderingContext2D,
  portal: Portal,
  camX: number,
  time: number
) {
  // Render thorny vine barrier first if still blocking
  if (portal.barrierProgress > 0.02) {
    const bx = Math.round(portal.barrierX - camX);
    const h = Math.round(320 * portal.barrierProgress);
    const by = 480 - h;
    if (bx > -80 && bx < VIEW_WIDTH + 80) {
      px(ctx, bx, by, 34, h, '#3f6212');
      px(ctx, bx + 8, by, 16, h, '#65a30d');
      for (let vy = by + 10; vy < 470; vy += 24) {
        px(ctx, bx - 8, vy, 12, 6, '#a16207');
        px(ctx, bx + 30, vy + 10, 12, 6, '#a16207');
      }
    }
  }

  const pxPos = Math.round(portal.x - camX);
  const pyPos = Math.round(portal.y);
  if (pxPos + portal.width < -60 || pxPos > VIEW_WIDTH + 60) return;

  // Stone archway
  px(ctx, pxPos - 10, pyPos - 10, portal.width + 20, portal.height + 10, '#334155');
  px(ctx, pxPos - 4, pyPos - 4, portal.width + 8, portal.height + 4, '#475569');

  if (portal.unlocked) {
    const pulse = Math.sin(time * 6) * 4;
    const grad = ctx.createRadialGradient(
      pxPos + portal.width / 2,
      pyPos + portal.height / 2,
      6,
      pxPos + portal.width / 2,
      pyPos + portal.height / 2,
      44 + pulse
    );
    grad.addColorStop(0, '#ecfeff');
    grad.addColorStop(0.4, '#22d3ee');
    grad.addColorStop(0.8, '#10b981');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(pxPos - 14, pyPos - 14, portal.width + 28, portal.height + 28);

    // Swirling inner energy pixels
    for (let i = 0; i < 6; i++) {
      const ang = time * 4 + i * 1.05;
      const sx = pxPos + portal.width / 2 + Math.cos(ang) * 14;
      const sy = pyPos + portal.height / 2 + Math.sin(ang) * 24;
      px(ctx, sx - 3, sy - 3, 6, 6, '#ffffff');
    }
  } else {
    // Locked dormant portal
    px(ctx, pxPos + 4, pyPos + 4, portal.width - 8, portal.height - 4, '#0f172a');
    px(ctx, pxPos + 14, pyPos + 20, portal.width - 28, portal.height - 36, '#1e293b');
  }
}

export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  camX: number,
  time: number
) {
  // Blink when hurt invulnerable
  if (player.invulnTimer > 0 && Math.floor(time * 18) % 2 === 0) {
    return;
  }

  const x = Math.round(player.x - camX);
  const y = Math.round(player.y);
  const f = player.facing;

  // Star invincibility rainbow aura
  if (player.starTimer > 0) {
    const hue = Math.floor((time * 360) % 360);
    ctx.fillStyle = `hsla(${hue}, 95%, 60%, 0.35)`;
    ctx.beginPath();
    ctx.arc(x + player.width / 2, y + player.height / 2, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  const isRunning = player.animState === 'run';
  const isMoving = player.animState === 'walk' || isRunning;
  const stride = isMoving
    ? Math.sin(player.animTimer * (isRunning ? 18 : 12)) * 5
    : 0;
  const bob = isMoving ? Math.abs(Math.sin(player.animTimer * (isRunning ? 18 : 12))) * -2 : 0;

  // Celebrate arm raise!
  const celebrating = player.animState === 'celebrate';
  const hurt = player.animState === 'hurt';

  // Backpack (behind Italo)
  const packX = f === 1 ? x - 3 : x + player.width - 9;
  px(ctx, packX, y + 14 + bob, 12, 16, '#78350f');
  px(ctx, packX + 2, y + 16 + bob, 8, 6, '#b45309');
  px(ctx, packX + 3, y + 12 + bob, 6, 3, '#451a03');

  // Legs / boots
  if (!player.grounded) {
    // Jump / Fall pose
    px(ctx, x + 5, y + 30, 8, 9, '#1e3a8a');
    px(ctx, x + 17, y + 28, 8, 9, '#1e3a8a');
    px(ctx, x + 5, y + 36, 9, 4, '#451a03');
    px(ctx, x + 17, y + 34, 9, 4, '#451a03');
  } else {
    px(ctx, x + 6 + stride, y + 30, 7, 10, '#1e3a8a');
    px(ctx, x + 17 - stride, y + 30, 7, 10, '#1e3a8a');
    px(ctx, x + 5 + stride, y + 36, 9, 4, '#451a03');
    px(ctx, x + 17 - stride, y + 36, 9, 4, '#451a03');
  }

  // Blue adventurer clothes / tunic
  px(ctx, x + 5, y + 15 + bob, 20, 16, hurt ? '#ef4444' : '#2563eb');
  px(ctx, x + 7, y + 17 + bob, 16, 10, hurt ? '#f87171' : '#3b82f6');
  // Belt
  px(ctx, x + 5, y + 26 + bob, 20, 3, '#78350f');
  px(ctx, x + 13, y + 26 + bob, 4, 3, '#facc15');

  // Arms
  if (celebrating) {
    px(ctx, x + 1, y + 4 + bob, 5, 13, '#3b82f6');
    px(ctx, x + 24, y + 4 + bob, 5, 13, '#3b82f6');
    px(ctx, x + 1, y + 1 + bob, 5, 4, '#fdba74');
    px(ctx, x + 24, y + 1 + bob, 5, 4, '#fdba74');
  } else {
    const armSwing = isMoving ? -stride * 0.8 : 0;
    const armX = f === 1 ? x + 16 + armSwing : x + 8 + armSwing;
    px(ctx, armX, y + 17 + bob, 6, 10, '#1d4ed8');
    px(ctx, armX, y + 25 + bob, 6, 4, '#fdba74');
  }

  // Head
  px(ctx, x + 6, y + 4 + bob, 18, 13, '#fed7aa');
  // Hair tuft
  px(ctx, f === 1 ? x + 6 : x + 19, y + 6 + bob, 5, 6, '#451a03');
  // Eyes
  const eyeX = f === 1 ? x + 17 : x + 9;
  px(ctx, eyeX, y + 9 + bob, 3, 4, '#0f172a');
  px(ctx, eyeX + (f === 1 ? -5 : 5), y + 9 + bob, 3, 4, '#0f172a');

  // Green cap (Boné verde!)
  px(ctx, x + 5, y + bob, 20, 7, '#16a34a');
  px(ctx, x + 7, y - 2 + bob, 16, 4, '#22c55e');
  // Cap brim facing direction
  if (f === 1) {
    px(ctx, x + 13, y + 4 + bob, 16, 3, '#15803d');
  } else {
    px(ctx, x + 1, y + 4 + bob, 16, 3, '#15803d');
  }
}

export function renderParticlesAndTexts(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  texts: FloatingText[],
  camX: number
) {
  for (const pt of particles) {
    const alpha = Math.max(0, pt.life / pt.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pt.color;
    ctx.fillRect(Math.round(pt.x - camX), Math.round(pt.y), pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  ctx.font = 'bold 14px "Silkscreen", monospace';
  ctx.textAlign = 'center';
  for (const ft of texts) {
    const alpha = Math.max(0, Math.min(1, ft.life / (ft.maxLife * 0.6)));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#090d16';
    ctx.fillText(ft.text, Math.round(ft.x - camX) + 1, Math.round(ft.y) + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, Math.round(ft.x - camX), Math.round(ft.y));
  }
  ctx.globalAlpha = 1;
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  world: GameWorld
) {
  ctx.save();
  if (world.cameraShake > 0.2) {
    const sx = (Math.random() - 0.5) * world.cameraShake;
    const sy = (Math.random() - 0.5) * world.cameraShake;
    ctx.translate(sx, sy);
  }

  renderBackground(ctx, world.cameraX, world.time);

  for (const d of world.decorations) {
    renderDecoration(ctx, d, world.cameraX, world.time);
  }

  for (const p of world.platforms) {
    renderPlatform(ctx, p, world.cameraX, world.time);
  }

  for (const s of world.spikes) {
    renderSpikes(ctx, s, world.cameraX);
  }

  for (const sp of world.signposts) {
    const near = Math.abs(world.player.x - sp.x) < 110;
    renderSignpost(ctx, sp, world.cameraX, near);
  }

  for (const cp of world.checkpoints) {
    renderCheckpoint(ctx, cp, world.cameraX, world.time);
  }

  for (const b of world.blocks) {
    renderBlock(ctx, b, world.cameraX, world.time);
  }

  for (const c of world.coins) {
    renderCoin(ctx, c, world.cameraX, world.time);
  }

  for (const item of world.powerUps) {
    renderPowerUp(ctx, item, world.cameraX, world.time);
  }

  renderPortal(ctx, world.portal, world.cameraX, world.time);

  for (const e of world.enemies) {
    renderEnemy(ctx, e, world.cameraX);
  }

  renderBoss(ctx, world.boss, world.cameraX, world.time);

  for (const proj of world.projectiles) {
    renderProjectile(ctx, proj, world.cameraX);
  }

  renderPlayer(ctx, world.player, world.cameraX, world.time);
  renderParticlesAndTexts(ctx, world.particles, world.floatingTexts, world.cameraX);

  ctx.restore();
}
