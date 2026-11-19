import { soundEngine } from './audio';
import { CHALLENGE_NAMES } from './level1';
import {
  GameWorld,
  HittableBlock,
  HudSnapshot,
  InputState,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  VIEW_WIDTH,
} from './types';

const GRAVITY = 1380;
const JUMP_VEL = -590;
const WALK_SPEED = 235;
const RUN_SPEED = 350;
const GROUND_ACCEL = 1900;
const AIR_ACCEL = 1300;
const GROUND_FRICTION = 1850;
const COYOTE_TIME = 0.095;
const JUMP_BUFFER_TIME = 0.11;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function spawnParticles(
  world: GameWorld,
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 140,
  gravity = 380
) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const spd = speed * (0.4 + Math.random() * 0.8);
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 40,
      size: 3 + Math.floor(Math.random() * 4),
      color,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
      gravity,
    });
  }
}

function spawnSparks(
  world: GameWorld,
  x: number,
  y: number,
  colors: string[],
  count: number,
  speed = 170,
  gravity = 320,
  spread: 'radial' | 'ground' = 'radial'
) {
  for (let i = 0; i < count; i++) {
    let vx: number;
    let vy: number;

    if (spread === 'ground') {
      const side = i % 2 === 0 ? -1 : 1;
      vx = side * speed * (0.45 + Math.random() * 0.75);
      vy = -speed * (0.25 + Math.random() * 0.55);
    } else {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const spd = speed * (0.55 + Math.random() * 0.7);
      vx = Math.cos(angle) * spd;
      vy = Math.sin(angle) * spd - 50;
    }

    const maxLife = 0.25 + Math.random() * 0.28;
    world.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 4,
      vx,
      vy,
      size: 2 + Math.floor(Math.random() * 3),
      color: colors[i % colors.length],
      life: maxLife,
      maxLife,
      gravity,
    });
  }
}

function addFloatingText(
  world: GameWorld,
  x: number,
  y: number,
  text: string,
  color = '#fef08a'
) {
  world.floatingTexts.push({
    x,
    y,
    vy: -42,
    text,
    color,
    life: 1.0,
    maxLife: 1.0,
  });
}

function hurtPlayer(world: GameWorld, fellInPit = false) {
  const p = world.player;
  if (!fellInPit && (p.invulnTimer > 0 || p.starTimer > 0)) return;

  world.lives = Math.max(0, world.lives - 1);
  soundEngine.playHurt();
  world.cameraShake = 9;
  spawnParticles(world, p.x + p.width / 2, p.y + p.height / 2, '#ef4444', 14, 170);

  if (world.lives <= 0) {
    world.gameOverTriggered = true;
    soundEngine.playGameOver();
    return;
  }

  if (fellInPit) {
    p.x = world.respawnX;
    p.y = world.respawnY;
    p.vx = 0;
    p.vy = 0;
    p.invulnTimer = 2.0;
    p.hurtTimer = 0.25;
    addFloatingText(world, p.x + 15, p.y - 12, 'Checkpoint!', '#a7f3d0');
  } else {
    p.invulnTimer = 1.8;
    p.hurtTimer = 0.3;
    p.vy = -340;
    p.vx = -p.facing * 180;
    addFloatingText(world, p.x + 15, p.y - 12, '-1 Vida', '#fca5a5');
  }
}

function hitBlock(world: GameWorld, b: HittableBlock) {
  if (b.broken) return;

  if (b.kind === 'brick') {
    b.broken = true;
    soundEngine.playBlockBreak();
    world.score += 50;
    spawnParticles(world, b.x + 20, b.y + 20, '#b45309', 12, 190, 520);
    return;
  }

  if (b.used) {
    soundEngine.playBlockBump();
    b.bounceY = -5;
    return;
  }

  b.bounceY = -10;

  if (b.kind === 'coin') {
    b.coinsRemaining--;
    world.coinsCollected++;
    world.score += 100;
    soundEngine.playCoin();
    spawnSparks(world, b.x + 20, b.y - 6, ['#fef9c3', '#facc15', '#f59e0b'], 10, 150, 240);
    addFloatingText(world, b.x + 20, b.y - 14, '+100', '#fde047');
    if (b.coinsRemaining <= 0) {
      b.used = true;
    }
  } else if (b.kind === 'star' || b.kind === 'heart') {
    b.used = true;
    soundEngine.playPowerUp();
    world.powerUps.push({
      id: `pu_${b.id}_${Date.now()}`,
      x: b.x + 7,
      y: b.y - 28,
      vx: b.kind === 'star' ? 90 : 0,
      vy: -160,
      width: 26,
      height: 26,
      kind: b.kind,
      collected: false,
      emergeTimer: 0.2,
    });
  }
}

export function stepWorld(
  world: GameWorld,
  input: InputState,
  dtRaw: number
) {
  const dt = Math.min(dtRaw, 0.033); // Cap dt for collision stability
  world.time += dt;

  if (world.cameraShake > 0) {
    world.cameraShake = Math.max(0, world.cameraShake - dt * 28);
  }

  // Victory celebration sequence
  if (world.victoryTriggered) {
    world.victoryTimer += dt;
    world.player.animState = 'celebrate';
    world.player.vx = 0;
    world.player.vy = 0;
    updateParticlesAndTexts(world, dt);
    return;
  }

  if (world.gameOverTriggered) {
    updateParticlesAndTexts(world, dt);
    return;
  }

  world.elapsedSeconds += dt;

  // 1. Update moving platforms
  for (const plat of world.platforms) {
    if (plat.kind === 'moving' && plat.originX !== undefined && plat.originY !== undefined) {
      const prevX = plat.x;
      const prevY = plat.y;
      const t = (Math.sin(world.time * (plat.moveSpeed ?? 1.5) + (plat.movePhase ?? 0)) + 1) * 0.5;
      if (plat.moveAxis === 'x') {
        plat.x = plat.originX + t * (plat.moveRange ?? 100);
      } else if (plat.moveAxis === 'y') {
        plat.y = plat.originY + t * (plat.moveRange ?? 80);
      }
      plat.dx = plat.x - prevX;
      plat.dy = plat.y - prevY;
    }
  }

  // Bounce recovery on blocks
  for (const b of world.blocks) {
    if (b.bounceY < 0) {
      b.bounceY = Math.min(0, b.bounceY + dt * 65);
    }
  }

  const p = world.player;

  // Carry player with moving platform
  if (p.grounded && p.standingPlatformId) {
    const plat = world.platforms.find((pl) => pl.id === p.standingPlatformId);
    if (plat) {
      p.x += plat.dx ?? 0;
      p.y += plat.dy ?? 0;
    }
  }

  // Timers
  if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  if (p.starTimer > 0) p.starTimer = Math.max(0, p.starTimer - dt);
  if (p.hurtTimer > 0) p.hurtTimer = Math.max(0, p.hurtTimer - dt);
  if (p.grounded) {
    p.coyoteTimer = COYOTE_TIME;
  } else {
    p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
  }

  if (input.jumpJustPressed) {
    p.jumpBufferTimer = JUMP_BUFFER_TIME;
  } else {
    p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
  }

  // Horizontal movement
  const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const maxSpeed = input.run ? RUN_SPEED : WALK_SPEED;
  const accel = p.grounded ? GROUND_ACCEL : AIR_ACCEL;

  if (moveDir !== 0) {
    p.facing = moveDir as 1 | -1;
    p.vx += moveDir * accel * dt;
    if (Math.abs(p.vx) > maxSpeed) {
      // Smoothly clamp toward maxSpeed
      const sign = Math.sign(p.vx);
      p.vx = sign * Math.max(maxSpeed, Math.abs(p.vx) - GROUND_FRICTION * dt);
    }
  } else {
    const decel = (p.grounded ? GROUND_FRICTION : GROUND_FRICTION * 0.45) * dt;
    if (Math.abs(p.vx) <= decel) {
      p.vx = 0;
    } else {
      p.vx -= Math.sign(p.vx) * decel;
    }
  }

  // Execute buffered/coyote jump
  if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
    p.vy = JUMP_VEL;
    p.grounded = false;
    p.coyoteTimer = 0;
    p.jumpBufferTimer = 0;
    p.standingPlatformId = null;
    soundEngine.playJump();
    spawnParticles(world, p.x + p.width / 2, p.y + p.height, '#d9f99d', 6, 80, 120);
  }

  // Variable jump height (cut upward velocity if jump button released early)
  if (!input.jump && p.vy < -210) {
    p.vy += GRAVITY * 1.9 * dt;
  }

  // Gravity
  p.vy = Math.min(820, p.vy + GRAVITY * dt);

  // --- Horizontal Move & Solid Collision ---
  p.x += p.vx * dt;
  if (p.x < 0) {
    p.x = 0;
    p.vx = 0;
  }
  if (p.x + p.width > LEVEL_WIDTH) {
    p.x = LEVEL_WIDTH - p.width;
    p.vx = 0;
  }

  // Thorny vine barrier blocks entry to portal before boss defeat
  if (!world.portal.unlocked && world.portal.barrierProgress > 0.1) {
    if (p.x + p.width > world.portal.barrierX) {
      p.x = world.portal.barrierX - p.width;
      p.vx = 0;
    }
  }

  // Solid side collisions (ground, pillar, bridge, secret_floor, blocks)
  for (const plat of world.platforms) {
    if (plat.kind === 'floating' || plat.kind === 'moving') continue;
    if (rectsOverlap(p, plat)) {
      if (p.vx > 0) {
        p.x = plat.x - p.width;
        p.vx = 0;
      } else if (p.vx < 0) {
        p.x = plat.x + plat.width;
        p.vx = 0;
      }
    }
  }

  for (const b of world.blocks) {
    if (b.broken) continue;
    if (rectsOverlap(p, b)) {
      if (p.vx > 0) {
        p.x = b.x - p.width;
        p.vx = 0;
      } else if (p.vx < 0) {
        p.x = b.x + b.width;
        p.vx = 0;
      }
    }
  }

  // --- Vertical Move & Collision ---
  const wasGrounded = p.grounded;
  const impactVy = p.vy;
  const prevBottom = p.y + p.height;
  p.y += p.vy * dt;
  p.grounded = false;
  p.standingPlatformId = null;

  for (const plat of world.platforms) {
    const isOneWay = plat.kind === 'floating' || plat.kind === 'moving';
    if (isOneWay) {
      if (
        p.vy >= 0 &&
        prevBottom <= plat.y + 12 + Math.max(0, plat.dy ?? 0) &&
        rectsOverlap(p, plat)
      ) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.grounded = true;
        p.standingPlatformId = plat.id;
      }
    } else if (rectsOverlap(p, plat)) {
      if (p.vy >= 0) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.grounded = true;
        p.standingPlatformId = plat.id;
      } else if (p.vy < 0) {
        p.y = plat.y + plat.height;
        p.vy = 0;
      }
    }
  }

  for (const b of world.blocks) {
    if (b.broken) continue;
    if (rectsOverlap(p, b)) {
      if (p.vy >= 0 && prevBottom <= b.y + 14) {
        p.y = b.y - p.height;
        p.vy = 0;
        p.grounded = true;
      } else if (p.vy < 0) {
        p.y = b.y + b.height;
        p.vy = 10;
        hitBlock(world, b);
      }
    }
  }

  // Ground impact sparks when Italo lands after jumping or falling
  if (!wasGrounded && p.grounded && impactVy > 150) {
    const heavyLanding = impactVy > 430;
    spawnSparks(
      world,
      p.x + p.width / 2,
      p.y + p.height - 2,
      heavyLanding
        ? ['#fef9c3', '#bbf7d0', '#a7f3d0', '#d6d3d1']
        : ['#ecfccb', '#bbf7d0', '#e7e5e4'],
      heavyLanding ? 10 : 6,
      heavyLanding ? 155 : 105,
      260,
      'ground'
    );
  }

  // Pit fall check
  if (p.y > LEVEL_HEIGHT + 40) {
    hurtPlayer(world, true);
  }

  // Animation State
  p.animTimer += dt;
  if (p.hurtTimer > 0) {
    p.animState = 'hurt';
  } else if (!p.grounded) {
    p.animState = p.vy < 0 ? 'jump' : 'fall';
  } else if (Math.abs(p.vx) > 25) {
    p.animState = Math.abs(p.vx) > WALK_SPEED + 25 ? 'run' : 'walk';
  } else {
    p.animState = 'idle';
  }

  // Update current challenge index based on player X
  if (p.x >= 7680) world.currentChallenge = 4;
  else if (p.x >= 5920) world.currentChallenge = 3;
  else if (p.x >= 3810) world.currentChallenge = 2;
  else if (p.x >= 1940) world.currentChallenge = 1;
  else world.currentChallenge = 0;

  // Coins collection
  for (const c of world.coins) {
    if (c.collected) continue;
    const dx = p.x + p.width / 2 - c.x;
    const dy = p.y + p.height / 2 - c.y;
    if (dx * dx + dy * dy <= (c.radius + 18) * (c.radius + 18)) {
      c.collected = true;
      world.coinsCollected++;
      world.score += 100;
      soundEngine.playCoin();
      spawnSparks(world, c.x, c.y, ['#ffffff', '#fef08a', '#facc15', '#f59e0b'], 10, 145, 210);
      addFloatingText(world, c.x, c.y - 10, '+100', '#fde047');
    }
  }

  // PowerUp items update & collection
  for (const item of world.powerUps) {
    if (item.collected) continue;
    if (item.emergeTimer > 0) {
      item.emergeTimer -= dt;
    }
    item.vy = Math.min(500, item.vy + GRAVITY * 0.7 * dt);
    item.x += item.vx * dt;
    item.y += item.vy * dt;

    for (const plat of world.platforms) {
      if (rectsOverlap(item, plat) && item.vy >= 0) {
        item.y = plat.y - item.height;
        item.vy = item.kind === 'star' ? -240 : 0;
      }
    }

    if (rectsOverlap(p, item)) {
      item.collected = true;
      soundEngine.playPowerUp();
      if (item.kind === 'star') {
        p.starTimer = 10.0;
        world.score += 300;
        spawnParticles(world, item.x + 13, item.y + 13, '#fde047', 18, 200, 120);
        addFloatingText(world, p.x + 15, p.y - 18, 'INVENCÍVEL!', '#fde047');
      } else {
        if (world.lives < world.maxLives) {
          world.lives++;
          addFloatingText(world, p.x + 15, p.y - 18, '+1 Vida!', '#fb7185');
        } else {
          world.score += 250;
          addFloatingText(world, p.x + 15, p.y - 18, '+250', '#fb7185');
        }
        spawnParticles(world, item.x + 13, item.y + 13, '#fb7185', 14, 150, 160);
      }
    }
  }

  // Spikes collision
  for (const sp of world.spikes) {
    // Slightly forgiving hitbox inside spike graphic
    const spikeBox = {
      x: sp.x + 4,
      y: sp.y + 4,
      width: sp.width - 8,
      height: sp.height - 4,
    };
    if (rectsOverlap(p, spikeBox)) {
      hurtPlayer(world, false);
    }
  }

  // Checkpoints
  for (const cp of world.checkpoints) {
    if (!cp.activated && p.x + p.width >= cp.x - 16) {
      cp.activated = true;
      world.respawnX = cp.x;
      world.respawnY = cp.y - p.height - 8;
      soundEngine.playCheckpoint();
      spawnParticles(world, cp.x + 4, cp.y - 40, '#34d399', 16, 170, 180);
      addFloatingText(world, cp.x + 4, cp.y - 68, 'Checkpoint!', '#6ee7b7');
    }
  }

  // Enemies update & collision
  for (const e of world.enemies) {
    if (!e.alive) {
      e.squishTimer -= dt;
      continue;
    }
    e.animTimer += dt;
    e.x += e.vx * dt;
    if (e.x <= e.minX) {
      e.x = e.minX;
      e.vx = Math.abs(e.speed);
      e.facing = 1;
    } else if (e.x + e.width >= e.maxX) {
      e.x = e.maxX - e.width;
      e.vx = -Math.abs(e.speed);
      e.facing = -1;
    }

    if (rectsOverlap(p, e)) {
      if (p.starTimer > 0) {
        e.alive = false;
        e.squishTimer = 0.5;
        world.enemiesDefeated++;
        world.score += 200;
        soundEngine.playStomp();
        spawnSparks(world, e.x + e.width / 2, e.y + e.height / 2, ['#ffffff', '#fde047', '#f59e0b'], 14, 190);
        addFloatingText(world, e.x + e.width / 2, e.y - 10, '+200', '#fde047');
      } else {
        const playerPrevBottom = prevBottom;
        const stompThreshold = e.y + e.height * 0.62;
        if (p.vy > 0 && playerPrevBottom <= stompThreshold) {
          e.alive = false;
          e.squishTimer = 0.5;
          world.enemiesDefeated++;
          world.score += 200;
          p.vy = input.jump ? -510 : -390;
          soundEngine.playStomp();
          const enemyColor =
            e.kind === 'slime' ? '#4ade80' : e.kind === 'mushroom' ? '#ef4444' : '#cbd5e1';
          spawnSparks(
            world,
            e.x + e.width / 2,
            e.y + e.height / 2,
            ['#ffffff', '#fde047', enemyColor],
            14,
            175
          );
          addFloatingText(world, e.x + e.width / 2, e.y - 10, '+200', '#fef08a');
        } else {
          hurtPlayer(world, false);
        }
      }
    }
  }

  // Boss AI (Guardião da Floresta)
  updateBoss(world, input, prevBottom, dt);

  // Portal & Barrier Dissolve
  if (world.portal.unlocked && world.portal.barrierProgress > 0) {
    world.portal.barrierProgress = Math.max(0, world.portal.barrierProgress - dt * 1.4);
  }
  if (world.portal.unlocked && rectsOverlap(p, world.portal)) {
    world.victoryTriggered = true;
    world.victoryTimer = 0;
    soundEngine.setBossMode(false);
    soundEngine.playVictory();
    spawnParticles(
      world,
      world.portal.x + world.portal.width / 2,
      world.portal.y + world.portal.height / 2,
      '#6ee7b7',
      28,
      220,
      90
    );
  }

  // Camera smooth follow
  const targetCamX = Math.max(
    0,
    Math.min(LEVEL_WIDTH - VIEW_WIDTH, p.x - VIEW_WIDTH * 0.36)
  );
  world.cameraX += (targetCamX - world.cameraX) * Math.min(1, dt * 8.5);

  updateParticlesAndTexts(world, dt);
}

function updateBoss(
  world: GameWorld,
  input: InputState,
  playerPrevBottom: number,
  dt: number
) {
  const b = world.boss;
  const p = world.player;

  if (b.phase === 'defeated') {
    soundEngine.setBossMode(false);
    return;
  }

  // Activate boss once player steps into the clearing
  if (b.phase === 'dormant') {
    if (p.x >= 7740) {
      b.phase = 'hover';
      b.phaseTimer = 2.2;
      soundEngine.setBossMode(true);
      addFloatingText(world, b.x + b.width / 2, b.y - 24, 'Guardião da Floresta!', '#fbbf24');
    }
    return;
  }

  b.animTimer += dt;
  if (b.invulnTimer > 0) b.invulnTimer = Math.max(0, b.invulnTimer - dt);
  b.phaseTimer -= dt;

  const centerP = p.x + p.width / 2;
  const centerB = b.x + b.width / 2;
  b.facing = centerP >= centerB ? 1 : -1;

  const speedMult = b.hp === 1 ? 1.38 : b.hp === 2 ? 1.18 : 1.0;

  if (b.phase === 'hover') {
    const midX = (b.arenaMinX + b.arenaMaxX) * 0.5 - b.width / 2;
    const span = (b.arenaMaxX - b.arenaMinX) * 0.42;
    const targetX = midX + Math.sin(b.animTimer * 1.45 * speedMult) * span;
    const targetY = b.homeY + Math.sin(b.animTimer * 3.1) * 26;
    b.x += (targetX - b.x) * Math.min(1, dt * 3.5);
    b.y += (targetY - b.y) * Math.min(1, dt * 4.0);

    if (b.phaseTimer <= 0) {
      b.phase = 'telegraph';
      b.phaseTimer = 0.72;
    }
  } else if (b.phase === 'telegraph') {
    // Subtle hover tremor before firing projectiles
    b.y += Math.sin(b.animTimer * 24) * 0.7;
    if (b.phaseTimer <= 0) {
      b.phase = 'swoop';
      b.phaseTimer = 1.45;
      b.attackCount++;

      // Fire 2 or 3 venom/thorn projectiles toward player
      soundEngine.playBossAttack();
      const dx = centerP - centerB;
      const dy = p.y + p.height / 2 - (b.y + b.height * 0.6);
      const baseAngle = Math.atan2(dy, dx);
      const angles =
        b.hp <= 1 ? [baseAngle - 0.24, baseAngle, baseAngle + 0.24] : [baseAngle - 0.16, baseAngle + 0.16];

      angles.forEach((ang, idx) => {
        const spd = 250 * speedMult;
        world.projectiles.push({
          id: `proj_${Date.now()}_${idx}`,
          x: centerB,
          y: b.y + b.height * 0.6,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 7,
          life: 4.0,
        });
      });

      b.vx = b.facing * 210 * speedMult;
    }
  } else if (b.phase === 'swoop') {
    b.x += b.vx * dt;
    b.y += (b.homeY + 35 - b.y) * dt * 2.5;
    if (b.x < b.arenaMinX) {
      b.x = b.arenaMinX;
      b.vx = Math.abs(b.vx);
    } else if (b.x + b.width > b.arenaMaxX) {
      b.x = b.arenaMaxX - b.width;
      b.vx = -Math.abs(b.vx);
    }

    if (b.phaseTimer <= 0) {
      b.phase = 'vulnerable';
      b.phaseTimer = 2.65;
      b.vx = 0;
    }
  } else if (b.phase === 'vulnerable') {
    // Descend low enough for easy stomp from arena floor (ground y = 460; boss bottom ~ 405, top ~ 320!)
    const vulnY = 322;
    b.y += (vulnY - b.y) * Math.min(1, dt * 4.5);
    b.x += Math.sin(b.animTimer * 2.2) * 28 * dt;
    b.x = Math.max(b.arenaMinX, Math.min(b.arenaMaxX - b.width, b.x));

    if (b.phaseTimer <= 0) {
      b.phase = 'hover';
      b.phaseTimer = 2.0;
    }
  } else if (b.phase === 'hurt') {
    b.y += (b.homeY - b.y) * Math.min(1, dt * 5);
    if (b.phaseTimer <= 0) {
      b.phase = 'hover';
      b.phaseTimer = 1.6;
    }
  }

  // Projectiles update & player collision
  for (let i = world.projectiles.length - 1; i >= 0; i--) {
    const proj = world.projectiles[i];
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.life -= dt;

    const projBox = {
      x: proj.x - proj.radius,
      y: proj.y - proj.radius,
      width: proj.radius * 2,
      height: proj.radius * 2,
    };
    if (rectsOverlap(p, projBox)) {
      world.projectiles.splice(i, 1);
      hurtPlayer(world, false);
      continue;
    }
    if (proj.life <= 0 || proj.y > LEVEL_HEIGHT) {
      world.projectiles.splice(i, 1);
    }
  }

  // Boss vs Player Collision
  const bossHitbox = {
    x: b.x + 10,
    y: b.y + 6,
    width: b.width - 20,
    height: b.height - 12,
  };
  if (rectsOverlap(p, bossHitbox)) {
    const stompHit =
      p.starTimer > 0 || (p.vy > 0 && playerPrevBottom <= b.y + b.height * 0.56);

    if (stompHit && b.invulnTimer <= 0) {
      b.hp -= 1;
      b.invulnTimer = 1.05;
      p.vy = input.jump ? -540 : -440;
      world.cameraShake = 10;
      spawnParticles(world, centerB, b.y + 20, '#facc15', 18, 220);

      if (b.hp <= 0) {
        b.phase = 'defeated';
        world.score += 1000;
        world.projectiles = [];
        world.portal.unlocked = true;
        soundEngine.playBossDefeat();
        spawnParticles(world, centerB, b.y + b.height / 2, '#4ade80', 36, 260, 220);
        spawnParticles(world, centerB, b.y + b.height / 2, '#fb923c', 26, 220, 260);
        addFloatingText(world, centerB, b.y - 16, '+1000 GUARDIÃO DERROTADO!', '#fde047');
      } else {
        b.phase = 'hurt';
        b.phaseTimer = 0.85;
        world.score += 250;
        soundEngine.playBossHit();
        addFloatingText(world, centerB, b.y - 16, `Acerto! (${b.hp}/3)`, '#fef08a');
      }
    } else if (b.invulnTimer <= 0) {
      hurtPlayer(world, false);
    }
  }
}

function updateParticlesAndTexts(world: GameWorld, dt: number) {
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const pt = world.particles[i];
    pt.vy += (pt.gravity ?? 350) * dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.life -= dt;
    if (pt.life <= 0) {
      world.particles.splice(i, 1);
    }
  }

  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) {
      world.floatingTexts.splice(i, 1);
    }
  }
}

export function buildHudSnapshot(world: GameWorld): HudSnapshot {
  const p = world.player;
  const speedBonus = world.victoryTriggered
    ? Math.max(0, Math.round((240 - world.elapsedSeconds) * 15))
    : 0;
  const finalScore = world.score + speedBonus;

  let activeHint: { title: string; subtitle: string } | null = null;
  for (const sp of world.signposts) {
    if (Math.abs(p.x - sp.x) < 120 && Math.abs(p.y + p.height - sp.y) < 120) {
      activeHint = { title: sp.title, subtitle: sp.subtitle };
      break;
    }
  }

  return {
    lives: world.lives,
    maxLives: world.maxLives,
    coins: world.coinsCollected,
    totalCoins: world.totalCoins,
    score: world.score,
    enemiesDefeated: world.enemiesDefeated,
    elapsedSeconds: Math.floor(world.elapsedSeconds),
    challengeIndex: world.currentChallenge,
    challengeName: CHALLENGE_NAMES[world.currentChallenge] ?? CHALLENGE_NAMES[0],
    starActive: p.starTimer > 0,
    starTimeLeft: Math.ceil(p.starTimer),
    bossActive: world.boss.phase !== 'dormant' && world.boss.phase !== 'defeated',
    bossHp: world.boss.hp,
    bossMaxHp: world.boss.maxHp,
    bossVulnerable: world.boss.phase === 'vulnerable',
    bossDefeated: world.boss.phase === 'defeated',
    speedBonus,
    finalScore,
    activeHint,
  };
}
