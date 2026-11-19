import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react';
import { GameHud } from './components/GameHud';
import { TouchControls } from './components/TouchControls';
import { soundEngine } from './game/audio';
import { buildHudSnapshot, stepWorld } from './game/engine';
import { createLevel1World } from './game/level1';
import { renderWorld } from './game/sprites';
import {
  GameScreenState,
  GameWorld,
  HudSnapshot,
  InputState,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './game/types';

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<GameWorld>(createLevel1World());
  const screenRef = useRef<GameScreenState>('TITLE_MENU');

  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    run: false,
    jumpJustPressed: false,
  });

  const [screen, setScreen] = useState<GameScreenState>('TITLE_MENU');
  const [hud, setHud] = useState<HudSnapshot>(() => buildHudSnapshot(worldRef.current));
  const [muted, setMuted] = useState<boolean>(false);
  const [touchRunActive, setTouchRunActive] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  });

  const setGameScreen = useCallback((next: GameScreenState) => {
    screenRef.current = next;
    setScreen(next);
  }, []);

  const resetInputs = useCallback(() => {
    inputRef.current = {
      left: false,
      right: false,
      jump: false,
      run: false,
      jumpJustPressed: false,
    };
    setTouchRunActive(false);
  }, []);

  const startGame = useCallback(() => {
    soundEngine.unlock();
    soundEngine.setBossMode(false);
    worldRef.current = createLevel1World();
    resetInputs();
    setHud(buildHudSnapshot(worldRef.current));
    setGameScreen('PLAYING');
    soundEngine.startMusic();
  }, [resetInputs, setGameScreen]);

  const togglePause = useCallback(() => {
    if (screenRef.current === 'PLAYING') {
      soundEngine.stopMusic();
      resetInputs();
      setGameScreen('PAUSED');
    } else if (screenRef.current === 'PAUSED') {
      setGameScreen('PLAYING');
      soundEngine.startMusic();
    }
  }, [resetInputs, setGameScreen]);

  const returnToTitle = useCallback(() => {
    soundEngine.stopMusic();
    soundEngine.setBossMode(false);
    worldRef.current = createLevel1World();
    resetInputs();
    setHud(buildHudSnapshot(worldRef.current));
    setGameScreen('TITLE_MENU');
  }, [resetInputs, setGameScreen]);

  const handleToggleMute = useCallback(() => {
    soundEngine.unlock();
    const nextMuted = soundEngine.toggleMute();
    setMuted(nextMuted);
  }, []);

  const handleTouchInput = useCallback(
    (key: 'left' | 'right' | 'jump' | 'run', active: boolean) => {
      if (key === 'jump') {
        if (active && !inputRef.current.jump) {
          inputRef.current.jumpJustPressed = true;
        }
        inputRef.current.jump = active;
      } else if (key === 'run') {
        inputRef.current.run = active;
        setTouchRunActive(active);
      } else {
        inputRef.current[key] = active;
      }
    },
    []
  );

  // Keyboard Controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (
        code === 'Space' ||
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight'
      ) {
        e.preventDefault();
      }

      if (code === 'KeyP' || code === 'Escape') {
        if (screenRef.current === 'PLAYING' || screenRef.current === 'PAUSED') {
          togglePause();
        }
        return;
      }

      if (screenRef.current !== 'PLAYING') return;

      if (code === 'ArrowLeft' || code === 'KeyA') {
        inputRef.current.left = true;
      } else if (code === 'ArrowRight' || code === 'KeyD') {
        inputRef.current.right = true;
      } else if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
        if (!inputRef.current.jump) {
          inputRef.current.jumpJustPressed = true;
        }
        inputRef.current.jump = true;
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        inputRef.current.run = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'ArrowLeft' || code === 'KeyA') {
        inputRef.current.left = false;
      } else if (code === 'ArrowRight' || code === 'KeyD') {
        inputRef.current.right = false;
      } else if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
        inputRef.current.jump = false;
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        inputRef.current.run = false;
      }
    };

    const onBlur = () => {
      resetInputs();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [resetInputs, togglePause]);

  // Main requestAnimationFrame 60 FPS Game Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let hudTimer = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const world = worldRef.current;

      if (screenRef.current === 'TITLE_MENU') {
        // Gentle scenic background pan on title screen
        world.time += dt;
        world.cameraX = (Math.sin(world.time * 0.12) + 1) * 0.5 * 600;
      } else if (screenRef.current === 'PLAYING') {
        stepWorld(world, inputRef.current, dt);
        inputRef.current.jumpJustPressed = false;

        if (world.gameOverTriggered) {
          setHud(buildHudSnapshot(world));
          setGameScreen('GAME_OVER');
        } else if (world.victoryTriggered && world.victoryTimer >= 1.15) {
          setHud(buildHudSnapshot(world));
          setGameScreen('VICTORY');
        } else {
          hudTimer += dt;
          if (hudTimer >= 0.08) {
            hudTimer = 0;
            setHud(buildHudSnapshot(world));
          }
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          renderWorld(ctx, world);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      soundEngine.stopMusic();
    };
  }, [setGameScreen]);

  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#081410]">
      {/* Responsive 16:9 Pixel Canvas Container */}
      <div className="relative flex h-full w-full items-center justify-center">
        <canvas
          ref={canvasRef}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          className="pixel-canvas max-h-full max-w-full aspect-video w-full object-contain shadow-2xl"
        />
      </div>

      {/* Active HUD */}
      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <GameHud
          hud={hud}
          muted={muted}
          showTouchControls={showTouchControls}
          onToggleMute={handleToggleMute}
          onToggleTouch={() => setShowTouchControls((prev) => !prev)}
          onPause={togglePause}
        />
      )}

      {/* Touch Controls for Mobile / Tablets */}
      {screen === 'PLAYING' && showTouchControls && (
        <TouchControls
          onInputChange={handleTouchInput}
          runActive={touchRunActive}
        />
      )}

      {/* ================= TITLE SCREEN ================= */}
      {screen === 'TITLE_MENU' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl rounded-2xl border border-emerald-400/25 bg-slate-950/90 p-6 text-center shadow-2xl sm:p-8">
            <p className="text-xs font-semibold tracking-wider text-emerald-300">
              Plataforma 2D · Floresta Encantada
            </p>
            <h1 className="mt-2 font-pixel text-2xl leading-tight text-white sm:text-4xl" style={{ textWrap: 'balance' }}>
              Aventura Pixel
            </h1>
            <p className="mt-1 font-pixel text-sm text-amber-300 sm:text-base">
              O Reino Perdido
            </p>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Guie <strong className="text-white">Italo</strong>, o jovem aventureiro de boné verde e mochila, pelas cinco provações da Floresta Encantada até derrotar o Guardião e abrir o portal mágico.
            </p>

            {/* Controls Overview */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-slate-900/75 p-4 text-left text-xs text-slate-300 sm:grid-cols-4">
              <div>
                <p className="font-semibold text-white">Mover</p>
                <p className="mt-0.5 text-slate-400">A / D ou ← / →</p>
              </div>
              <div>
                <p className="font-semibold text-white">Pular</p>
                <p className="mt-0.5 text-slate-400">Espaço / W / ↑</p>
              </div>
              <div>
                <p className="font-semibold text-white">Correr</p>
                <p className="mt-0.5 text-slate-400">Shift</p>
              </div>
              <div>
                <p className="font-semibold text-white">Pausar</p>
                <p className="mt-0.5 text-slate-400">P ou ESC</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={startGame}
                className="flex min-h-[48px] items-center gap-2.5 rounded-xl bg-emerald-500 px-8 py-3 font-pixel text-base font-bold text-slate-950 shadow-lg transition-transform hover:bg-emerald-400 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="h-5 w-5 fill-slate-950" />
                <span>JOGAR</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
                className="flex min-h-[48px] items-center gap-2 rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-300" />}
                <span>{muted ? 'Som Desligado' : 'Som Ligado'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAUSE MODAL ================= */}
      {screen === 'PAUSED' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-950/95 p-6 text-center shadow-2xl">
            <h2 className="font-pixel text-2xl text-white">Jogo Pausado</h2>
            <p className="mt-1.5 text-sm text-slate-400">{hud.challengeName}</p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={togglePause}
                className="min-h-[44px] w-full rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap cursor-pointer"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={startGame}
                className="min-h-[44px] w-full rounded-xl border border-white/15 bg-slate-900 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap cursor-pointer"
              >
                Reiniciar Fase
              </button>
              <button
                type="button"
                onClick={returnToTitle}
                className="min-h-[44px] w-full rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 whitespace-nowrap cursor-pointer"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VICTORY MODAL ================= */}
      {screen === 'VICTORY' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-emerald-400/35 bg-slate-950/95 p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="mt-3 font-pixel text-2xl text-emerald-300 sm:text-3xl">
              Vitória!
            </h2>
            <p className="mt-1.5 text-sm text-slate-300">
              Italo derrotou o Guardião da Floresta e atravessou o portal mágico!
            </p>

            <div className="mt-5 space-y-2.5 rounded-xl border border-white/10 bg-slate-900/75 p-4 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>Moedas coletadas</span>
                <span className="font-semibold text-amber-300 tabular-nums">
                  {hud.coins} / {hud.totalCoins}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Inimigos derrotados</span>
                <span className="font-semibold text-white tabular-nums">
                  {hud.enemiesDefeated}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Tempo de fase</span>
                <span className="font-semibold text-white tabular-nums">
                  {formatTime(hud.elapsedSeconds)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Bônus de velocidade</span>
                <span className="font-semibold text-emerald-300 tabular-nums">
                  +{hud.speedBonus.toLocaleString('pt-BR')} pts
                </span>
              </div>
              <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
                <span className="font-semibold text-white">Pontuação Final</span>
                <span className="font-pixel text-lg font-bold text-amber-300 tabular-nums">
                  {hud.finalScore.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={startGame}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={returnToTitle}
                className="min-h-[44px] rounded-xl border border-white/15 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Menu Inicial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= GAME OVER MODAL ================= */}
      {screen === 'GAME_OVER' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/35 bg-slate-950/95 p-6 text-center shadow-2xl sm:p-8">
            <h2 className="font-pixel text-2xl text-rose-400 sm:text-3xl">
              Game Over
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Italo perdeu todas as vidas em {hud.challengeName}.
            </p>

            <div className="mt-5 flex items-center justify-center gap-6 rounded-xl border border-white/10 bg-slate-900/75 px-4 py-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Pontuação</p>
                <p className="font-pixel text-base text-white tabular-nums">
                  {hud.score.toLocaleString('pt-BR')}
                </p>
              </div>
              <span className="text-slate-700" aria-hidden="true">|</span>
              <div>
                <p className="text-xs text-slate-400">Moedas</p>
                <p className="font-pixel text-base text-amber-300 tabular-nums">
                  {hud.coins}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={startGame}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={returnToTitle}
                className="min-h-[44px] rounded-xl border border-white/15 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Menu Inicial
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
