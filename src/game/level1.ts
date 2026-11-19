import {
  Checkpoint,
  Coin,
  Decoration,
  Enemy,
  GameWorld,
  HittableBlock,
  Platform,
  Signpost,
  SpikeTrap,
} from './types';

export const CHALLENGE_NAMES = [
  'Desafio 1: Aprendizado',
  'Desafio 2: Primeiros Inimigos',
  'Desafio 3: Saltos Perigosos',
  'Desafio 4: Caminho Secreto',
  'Desafio 5: Guardião da Floresta',
];

export function createLevel1World(): GameWorld {
  const platforms: Platform[] = [
    // ================= DESAFIO 1: APRENDIZADO (0 -> 1900) =================
    // Wooden bridge start with lantern (like reference art!)
    { id: 'p_start_bridge', x: 0, y: 440, width: 520, height: 140, kind: 'bridge' },
    { id: 'p_g1', x: 520, y: 440, width: 420, height: 140, kind: 'ground' },
    // Gentle elevated floating island
    { id: 'p_f1', x: 640, y: 340, width: 160, height: 28, kind: 'floating' },
    // Small gap (90px) -> mossy cliff
    { id: 'p_g2', x: 1030, y: 420, width: 340, height: 160, kind: 'ground' },
    { id: 'p_f2', x: 1120, y: 310, width: 140, height: 28, kind: 'floating' },
    // Gap 110px -> landing before Challenge 2
    { id: 'p_g3', x: 1480, y: 440, width: 460, height: 140, kind: 'ground' },
    { id: 'p_f3', x: 1620, y: 335, width: 160, height: 28, kind: 'floating' },

    // ================= DESAFIO 2: PRIMEIROS INIMIGOS (1940 -> 3820) =================
    { id: 'p_g4', x: 1940, y: 440, width: 540, height: 140, kind: 'ground' },
    { id: 'p_f4', x: 2120, y: 330, width: 180, height: 28, kind: 'floating' },
    // Gap 100px
    { id: 'p_g5', x: 2580, y: 410, width: 420, height: 170, kind: 'ground' },
    { id: 'p_f5', x: 2680, y: 295, width: 200, height: 28, kind: 'floating' },
    // Gap 110px
    { id: 'p_g6', x: 3110, y: 440, width: 700, height: 140, kind: 'ground' },
    { id: 'p_f6', x: 3320, y: 340, width: 160, height: 28, kind: 'floating' },
    { id: 'p_f7', x: 3560, y: 270, width: 140, height: 28, kind: 'floating' },

    // ================= DESAFIO 3: SALTOS PERIGOSOS (3810 -> 5920) =================
    { id: 'p_g7', x: 3810, y: 440, width: 320, height: 140, kind: 'ground' },
    // First chasm + moving horizontal island
    {
      id: 'p_m1',
      x: 4210,
      y: 390,
      width: 130,
      height: 28,
      kind: 'moving',
      moveAxis: 'x',
      moveRange: 130,
      moveSpeed: 1.5,
      movePhase: 0,
      originX: 4210,
      originY: 390,
    },
    // Tall mossy stone pillars (like reference image 2)
    { id: 'p_pil1', x: 4520, y: 360, width: 130, height: 220, kind: 'pillar' },
    { id: 'p_pil2', x: 4760, y: 300, width: 130, height: 280, kind: 'pillar' },
    // Vertical moving elevator platform
    {
      id: 'p_m2',
      x: 5000,
      y: 270,
      width: 130,
      height: 28,
      kind: 'moving',
      moveAxis: 'y',
      moveRange: 95,
      moveSpeed: 1.6,
      movePhase: 0.7,
      originX: 5000,
      originY: 270,
    },
    // Spike ledge island
    { id: 'p_g8', x: 5230, y: 410, width: 360, height: 170, kind: 'ground' },
    // Horizontal moving ferry over spike pit
    {
      id: 'p_m3',
      x: 5670,
      y: 360,
      width: 130,
      height: 28,
      kind: 'moving',
      moveAxis: 'x',
      moveRange: 85,
      moveSpeed: 1.6,
      movePhase: 1.2,
      originX: 5670,
      originY: 360,
    },

    // ================= DESAFIO 4: CAMINHO SECRETO (5920 -> 7620) =================
    { id: 'p_g9', x: 5920, y: 440, width: 520, height: 140, kind: 'ground' },
    // High canopy platforms leading to the Secret Chamber!
    { id: 'p_sec_step1', x: 6180, y: 340, width: 120, height: 28, kind: 'floating' },
    { id: 'p_sec_step2', x: 6360, y: 250, width: 130, height: 28, kind: 'floating' },
    // Secret Golden Canopy Chamber (high sky sanctuary!)
    { id: 'p_secret_chamber', x: 6560, y: 185, width: 520, height: 34, kind: 'secret_floor' },
    // Main lower route (with skeleton guards & spikes)
    { id: 'p_g10', x: 6540, y: 440, width: 640, height: 140, kind: 'ground' },
    { id: 'p_f8', x: 6760, y: 335, width: 160, height: 28, kind: 'floating' },
    // Exit bridge to Boss Sanctuary
    { id: 'p_g11', x: 7280, y: 440, width: 420, height: 140, kind: 'ground' },

    // ================= DESAFIO 5: GUARDIÃO DA FLORESTA (7700 -> 9400) =================
    // Wide Boss Arena with side mossy pillars (reference image 2!) & Portal Shrine
    { id: 'p_boss_arena', x: 7700, y: 460, width: 1700, height: 140, kind: 'ground' },
    // Left arena pillar (two-tier step so Italo can stomp high!)
    { id: 'p_arena_left_low', x: 7870, y: 380, width: 120, height: 26, kind: 'floating' },
    { id: 'p_arena_left_high', x: 7910, y: 295, width: 120, height: 26, kind: 'floating' },
    // Right arena pillar
    { id: 'p_arena_right_low', x: 8510, y: 380, width: 120, height: 26, kind: 'floating' },
    { id: 'p_arena_right_high', x: 8470, y: 295, width: 120, height: 26, kind: 'floating' },
  ];

  const blocks: HittableBlock[] = [
    // Desafio 1
    { id: 'b1', x: 400, y: 315, width: 40, height: 40, kind: 'coin', used: false, broken: false, bounceY: 0, coinsRemaining: 1 },
    { id: 'b2', x: 680, y: 220, width: 40, height: 40, kind: 'coin', used: false, broken: false, bounceY: 0, coinsRemaining: 3 },
    { id: 'b3', x: 720, y: 220, width: 40, height: 40, kind: 'brick', used: false, broken: false, bounceY: 0, coinsRemaining: 0 },
    { id: 'b4', x: 1170, y: 195, width: 40, height: 40, kind: 'coin', used: false, broken: false, bounceY: 0, coinsRemaining: 1 },

    // Desafio 2
    { id: 'b5', x: 2180, y: 210, width: 40, height: 40, kind: 'heart', used: false, broken: false, bounceY: 0, coinsRemaining: 1 },
    { id: 'b6', x: 2760, y: 175, width: 40, height: 40, kind: 'coin', used: false, broken: false, bounceY: 0, coinsRemaining: 3 },
    { id: 'b7', x: 3380, y: 220, width: 40, height: 40, kind: 'brick', used: false, broken: false, bounceY: 0, coinsRemaining: 0 },

    // Desafio 3
    { id: 'b8', x: 5390, y: 280, width: 40, height: 40, kind: 'heart', used: false, broken: false, bounceY: 0, coinsRemaining: 1 },

    // Desafio 4 - Secret path trigger & Star of Invincibility!
    { id: 'b9_sec', x: 6220, y: 225, width: 40, height: 40, kind: 'brick', used: false, broken: false, bounceY: 0, coinsRemaining: 0, secret: true },
    { id: 'b10_star', x: 6800, y: 80, width: 40, height: 40, kind: 'star', used: false, broken: false, bounceY: 0, coinsRemaining: 1, secret: true },
    { id: 'b11_sec', x: 6840, y: 80, width: 40, height: 40, kind: 'coin', used: false, broken: false, bounceY: 0, coinsRemaining: 5, secret: true },
    // Main route fallback heart before boss
    { id: 'b12_boss_prep', x: 7520, y: 315, width: 40, height: 40, kind: 'heart', used: false, broken: false, bounceY: 0, coinsRemaining: 1 },
  ];

  const coinCoords: Array<{ x: number; y: number; secret?: boolean }> = [
    // Desafio 1
    { x: 250, y: 400 }, { x: 295, y: 400 }, { x: 340, y: 400 },
    { x: 670, y: 300 }, { x: 715, y: 300 }, { x: 760, y: 300 },
    { x: 985, y: 345 }, // arc over gap
    { x: 1160, y: 270 }, { x: 1210, y: 270 },
    { x: 1425, y: 335 }, // arc over gap
    { x: 1660, y: 295 }, { x: 1710, y: 295 },

    // Desafio 2
    { x: 2050, y: 400 }, { x: 2150, y: 290 }, { x: 2200, y: 290 }, { x: 2250, y: 290 },
    { x: 2530, y: 335 },
    { x: 2720, y: 255 }, { x: 2770, y: 255 }, { x: 2820, y: 255 },
    { x: 3055, y: 330 },
    { x: 3360, y: 300 }, { x: 3410, y: 300 },
    { x: 3600, y: 230 }, { x: 3650, y: 230 },

    // Desafio 3
    { x: 4250, y: 340 }, { x: 4300, y: 340 },
    { x: 4565, y: 320 }, { x: 4605, y: 320 },
    { x: 4805, y: 260 }, { x: 4845, y: 260 },
    { x: 5050, y: 245 },
    { x: 5300, y: 370 }, { x: 5510, y: 370 },
    { x: 5720, y: 310 },

    // Desafio 4: Secret Path Coins!
    { x: 6240, y: 300 }, { x: 6420, y: 210 },
    { x: 6600, y: 145, secret: true },
    { x: 6640, y: 145, secret: true },
    { x: 6680, y: 145, secret: true },
    { x: 6720, y: 145, secret: true },
    { x: 6760, y: 145, secret: true },
    { x: 6880, y: 145, secret: true },
    { x: 6920, y: 145, secret: true },
    { x: 6960, y: 145, secret: true },
    { x: 7000, y: 145, secret: true },
    { x: 7040, y: 145, secret: true },

    // Lower path coins
    { x: 6810, y: 295 }, { x: 6860, y: 295 },
    { x: 7360, y: 400 }, { x: 7410, y: 400 },
  ];

  const coins: Coin[] = coinCoords.map((c, idx) => ({
    id: `c_${idx}`,
    x: c.x,
    y: c.y,
    radius: 11,
    collected: false,
    bobOffset: idx * 0.45,
    secret: c.secret,
  }));

  const spikes: SpikeTrap[] = [
    { id: 'sp1', x: 5380, y: 392, width: 64, height: 18 },
    { id: 'sp2', x: 6940, y: 422, width: 64, height: 18 },
  ];

  const checkpoints: Checkpoint[] = [
    { id: 'cp1', x: 1970, y: 440, challengeIndex: 1, label: 'Checkpoint 1 — Primeiros Inimigos', activated: false },
    { id: 'cp2', x: 3860, y: 440, challengeIndex: 2, label: 'Checkpoint 2 — Saltos Perigosos', activated: false },
    { id: 'cp3', x: 5970, y: 440, challengeIndex: 3, label: 'Checkpoint 3 — Caminho Secreto', activated: false },
    { id: 'cp4', x: 7600, y: 440, challengeIndex: 4, label: 'Checkpoint 4 — Arena do Guardião', activated: false },
  ];

  const signposts: Signpost[] = [
    {
      id: 'sig1',
      x: 170,
      y: 440,
      title: 'Bem-vindo, Italo!',
      subtitle: 'Use A / D ou ← / → para andar. Segure SHIFT para correr!',
    },
    {
      id: 'sig2',
      x: 560,
      y: 440,
      title: 'Pulo Variável',
      subtitle: 'Aperte ESPAÇO / W / ↑ para pular. Segure para alcançar blocos altos!',
    },
    {
      id: 'sig3',
      x: 2010,
      y: 440,
      title: 'Desafio 2: Inimigos',
      subtitle: 'Pule na cabeça das criaturas para derrotá-las (+200 pts)!',
    },
    {
      id: 'sig4',
      x: 6050,
      y: 440,
      title: 'Segredo nas Copas',
      subtitle: 'Há um caminho secreto lá em cima com moedas e a Estrela de Invencibilidade!',
    },
    {
      id: 'sig5',
      x: 7650,
      y: 460,
      title: 'Guardião da Floresta',
      subtitle: 'Desvie dos espinhos e pule na cabeça do Guardião quando ele baixar!',
    },
  ];

  const decorations: Decoration[] = [
    { kind: 'lantern', x: 60, y: 440 },
    { kind: 'crate', x: 740, y: 340 },
    { kind: 'pot', x: 1310, y: 420 },
    { kind: 'bush', x: 830, y: 440 },
    { kind: 'flower', x: 1520, y: 440 },
    { kind: 'lantern', x: 1940, y: 440 },
    { kind: 'bush', x: 2350, y: 440 },
    { kind: 'pot', x: 2940, y: 410 },
    { kind: 'crate', x: 3330, y: 340 },
    { kind: 'torch', x: 3820, y: 440 },
    { kind: 'flower', x: 5260, y: 410 },
    { kind: 'lantern', x: 5930, y: 440 },
    { kind: 'bush', x: 6620, y: 440 },
    { kind: 'torch', x: 7560, y: 440 },
    { kind: 'torch', x: 7780, y: 460 },
    { kind: 'torch', x: 8740, y: 460 },
    { kind: 'lantern', x: 8960, y: 460 },
  ];

  const enemies: Enemy[] = [
    // Desafio 2
    {
      id: 'e_slime1',
      kind: 'slime',
      x: 2220,
      y: 412,
      vx: -65,
      vy: 0,
      width: 32,
      height: 28,
      minX: 2050,
      maxX: 2430,
      speed: 65,
      facing: -1,
      alive: true,
      squishTimer: 0,
      animTimer: 0,
    },
    {
      id: 'e_mush1',
      kind: 'mushroom',
      x: 2740,
      y: 376,
      vx: 75,
      vy: 0,
      width: 34,
      height: 34,
      minX: 2600,
      maxX: 2960,
      speed: 75,
      facing: 1,
      alive: true,
      squishTimer: 0,
      animTimer: 0.5,
    },
    {
      id: 'e_slime2',
      kind: 'slime',
      x: 3280,
      y: 412,
      vx: -70,
      vy: 0,
      width: 32,
      height: 28,
      minX: 3140,
      maxX: 3500,
      speed: 70,
      facing: -1,
      alive: true,
      squishTimer: 0,
      animTimer: 1.1,
    },
    {
      id: 'e_mush2',
      kind: 'mushroom',
      x: 3620,
      y: 406,
      vx: -85,
      vy: 0,
      width: 34,
      height: 34,
      minX: 3490,
      maxX: 3780,
      speed: 85,
      facing: -1,
      alive: true,
      squishTimer: 0,
      animTimer: 0.2,
    },

    // Desafio 3
    {
      id: 'e_skel1',
      kind: 'skeleton',
      x: 3980,
      y: 400,
      vx: 95,
      vy: 0,
      width: 32,
      height: 40,
      minX: 3890,
      maxX: 4100,
      speed: 95,
      facing: 1,
      alive: true,
      squishTimer: 0,
      animTimer: 0,
    },
    {
      id: 'e_slime3',
      kind: 'slime',
      x: 5280,
      y: 382,
      vx: 70,
      vy: 0,
      width: 32,
      height: 28,
      minX: 5240,
      maxX: 5365,
      speed: 70,
      facing: 1,
      alive: true,
      squishTimer: 0,
      animTimer: 0.7,
    },

    // Desafio 4 (lower path & exit)
    {
      id: 'e_skel2',
      kind: 'skeleton',
      x: 6700,
      y: 400,
      vx: -105,
      vy: 0,
      width: 32,
      height: 40,
      minX: 6560,
      maxX: 6910,
      speed: 105,
      facing: -1,
      alive: true,
      squishTimer: 0,
      animTimer: 0.3,
    },
    {
      id: 'e_mush3',
      kind: 'mushroom',
      x: 7080,
      y: 406,
      vx: -90,
      vy: 0,
      width: 34,
      height: 34,
      minX: 7015,
      maxX: 7160,
      speed: 90,
      facing: -1,
      alive: true,
      squishTimer: 0,
      animTimer: 0.9,
    },
    {
      id: 'e_skel3',
      kind: 'skeleton',
      x: 7400,
      y: 400,
      vx: 95,
      vy: 0,
      width: 32,
      height: 40,
      minX: 7300,
      maxX: 7560,
      speed: 95,
      facing: 1,
      alive: true,
      squishTimer: 0,
      animTimer: 0.4,
    },
  ];

  return {
    player: {
      x: 90,
      y: 380,
      vx: 0,
      vy: 0,
      width: 30,
      height: 40,
      facing: 1,
      grounded: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      invulnTimer: 0,
      starTimer: 0,
      hurtTimer: 0,
      animState: 'idle',
      animTimer: 0,
      standingPlatformId: null,
    },
    platforms,
    blocks,
    coins,
    powerUps: [],
    spikes,
    checkpoints,
    signposts,
    decorations,
    enemies,
    boss: {
      x: 8450,
      y: 230,
      width: 92,
      height: 86,
      vx: 0,
      vy: 0,
      hp: 3,
      maxHp: 3,
      phase: 'dormant',
      phaseTimer: 0,
      invulnTimer: 0,
      facing: -1,
      animTimer: 0,
      arenaMinX: 7850,
      arenaMaxX: 8620,
      homeY: 215,
      attackCount: 0,
    },
    projectiles: [],
    portal: {
      x: 9060,
      y: 364,
      width: 68,
      height: 96,
      unlocked: false,
      barrierX: 8820,
      barrierProgress: 1,
    },
    particles: [],
    floatingTexts: [],
    cameraX: 0,
    cameraShake: 0,
    lives: 3,
    maxLives: 3,
    score: 0,
    coinsCollected: 0,
    totalCoins: coins.length,
    enemiesDefeated: 0,
    elapsedSeconds: 0,
    respawnX: 90,
    respawnY: 380,
    currentChallenge: 0,
    victoryTriggered: false,
    victoryTimer: 0,
    gameOverTriggered: false,
    time: 0,
  };
}
