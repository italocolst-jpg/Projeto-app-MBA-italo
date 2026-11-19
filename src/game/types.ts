export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;
export const TILE_SIZE = 40;
export const LEVEL_WIDTH = 9400;
export const LEVEL_HEIGHT = 580;

export type GameScreenState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export type PlayerAnimState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'hurt'
  | 'celebrate';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  run: boolean;
  jumpJustPressed: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  grounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  invulnTimer: number;
  starTimer: number;
  hurtTimer: number;
  animState: PlayerAnimState;
  animTimer: number;
  standingPlatformId: string | null;
}

export type PlatformKind =
  | 'ground'
  | 'bridge'
  | 'floating'
  | 'pillar'
  | 'moving'
  | 'secret_floor';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: PlatformKind;
  // Moving platform properties
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  moveSpeed?: number;
  movePhase?: number;
  originX?: number;
  originY?: number;
  dx?: number;
  dy?: number;
  hasLantern?: boolean;
}

export type BlockKind = 'coin' | 'star' | 'heart' | 'brick';

export interface HittableBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: BlockKind;
  used: boolean;
  broken: boolean;
  bounceY: number;
  coinsRemaining: number;
  secret?: boolean;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  bobOffset: number;
  secret?: boolean;
}

export type PowerUpKind = 'star' | 'heart';

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  kind: PowerUpKind;
  collected: boolean;
  emergeTimer: number;
}

export interface SpikeTrap {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  challengeIndex: number;
  label: string;
  activated: boolean;
}

export interface Signpost {
  id: string;
  x: number;
  y: number;
  title: string;
  subtitle: string;
}

export interface Decoration {
  kind: 'lantern' | 'pot' | 'crate' | 'bush' | 'flower' | 'canopy_arch' | 'torch';
  x: number;
  y: number;
  scale?: number;
}

export type EnemyKind = 'slime' | 'mushroom' | 'skeleton';

export interface Enemy {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  minX: number;
  maxX: number;
  speed: number;
  facing: 1 | -1;
  alive: boolean;
  squishTimer: number;
  animTimer: number;
}

export type BossPhase =
  | 'dormant'
  | 'hover'
  | 'telegraph'
  | 'swoop'
  | 'vulnerable'
  | 'hurt'
  | 'defeated';

export interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  phase: BossPhase;
  phaseTimer: number;
  invulnTimer: number;
  facing: 1 | -1;
  animTimer: number;
  arenaMinX: number;
  arenaMaxX: number;
  homeY: number;
  attackCount: number;
}

export interface BossProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
}

export interface Portal {
  x: number;
  y: number;
  width: number;
  height: number;
  unlocked: boolean;
  barrierX: number;
  barrierProgress: number; // 1 = closed thorny wall, 0 = dissolved
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface HudSnapshot {
  lives: number;
  maxLives: number;
  coins: number;
  totalCoins: number;
  score: number;
  enemiesDefeated: number;
  elapsedSeconds: number;
  challengeIndex: number;
  challengeName: string;
  starActive: boolean;
  starTimeLeft: number;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossVulnerable: boolean;
  bossDefeated: boolean;
  speedBonus: number;
  finalScore: number;
  activeHint: { title: string; subtitle: string } | null;
}

export interface GameWorld {
  player: Player;
  platforms: Platform[];
  blocks: HittableBlock[];
  coins: Coin[];
  powerUps: PowerUpItem[];
  spikes: SpikeTrap[];
  checkpoints: Checkpoint[];
  signposts: Signpost[];
  decorations: Decoration[];
  enemies: Enemy[];
  boss: Boss;
  projectiles: BossProjectile[];
  portal: Portal;
  particles: Particle[];
  floatingTexts: FloatingText[];
  cameraX: number;
  cameraShake: number;
  lives: number;
  maxLives: number;
  score: number;
  coinsCollected: number;
  totalCoins: number;
  enemiesDefeated: number;
  elapsedSeconds: number;
  respawnX: number;
  respawnY: number;
  currentChallenge: number;
  victoryTriggered: boolean;
  victoryTimer: number;
  gameOverTriggered: boolean;
  time: number;
}
