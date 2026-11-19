import React from 'react';
import { Gamepad2, Heart, Pause, Star, Volume2, VolumeX } from 'lucide-react';
import { HudSnapshot } from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  showTouchControls: boolean;
  onToggleMute: () => void;
  onToggleTouch: () => void;
  onPause: () => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  muted,
  showTouchControls,
  onToggleMute,
  onToggleTouch,
  onPause,
}) => {
  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-3 py-2.5 sm:px-5 sm:py-3">
        {/* Top-Left: Lives, Coins, Score */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-white/15 bg-slate-950/80 px-3 py-2 text-slate-100 backdrop-blur-sm">
          <div className="flex items-center gap-1" aria-label={`Vidas: ${hud.lives} de ${hud.maxLives}`}>
            {Array.from({ length: hud.maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  i < hud.lives
                    ? 'fill-rose-500 text-rose-400'
                    : 'fill-slate-800 text-slate-600'
                }`}
              />
            ))}
          </div>

          <span className="text-slate-600" aria-hidden="true">|</span>

          <div className="flex items-center gap-1.5 text-xs font-semibold tabular-nums sm:text-sm">
            <span className="inline-block h-3.5 w-3.5 rounded-sm border border-amber-700 bg-amber-400" aria-hidden="true" />
            <span className="font-pixel text-amber-300">{hud.coins}</span>
            <span className="text-slate-400 text-xs">/ {hud.totalCoins}</span>
          </div>

          <span className="text-slate-600" aria-hidden="true">|</span>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span className="text-slate-400">Pts</span>
            <span className="font-pixel font-bold text-white tabular-nums">
              {hud.score.toLocaleString('pt-BR')}
            </span>
          </div>

          {hud.starActive && (
            <>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-300 tabular-nums">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                <span>Invencível {hud.starTimeLeft}s</span>
              </div>
            </>
          )}
        </div>

        {/* Top-Center: Challenge Name or Boss Health Bar */}
        <div className="hidden md:flex flex-col items-center">
          {hud.bossActive ? (
            <div className="rounded-lg border border-amber-400/35 bg-slate-950/85 px-4 py-2 text-center backdrop-blur-sm">
              <div className="flex items-center justify-between gap-6 text-xs font-semibold text-amber-200">
                <span className="font-pixel text-amber-300">Guardião da Floresta</span>
                <span className="tabular-nums">
                  {hud.bossHp} / {hud.bossMaxHp} HP
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-56 overflow-hidden rounded-sm bg-slate-800">
                <div
                  className="h-full bg-amber-500 transition-all duration-200"
                  style={{ width: `${(hud.bossHp / hud.bossMaxHp) * 100}%` }}
                />
              </div>
              {hud.bossVulnerable && (
                <p className="mt-1 text-[11px] font-semibold text-emerald-300">
                  Vulnerável — pule na cabeça!
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-white/15 bg-slate-950/75 px-3.5 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur-sm">
              {hud.challengeName}
            </div>
          )}
        </div>

        {/* Top-Right: Timer & Utility Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/15 bg-slate-950/80 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="px-1.5 font-pixel text-xs text-slate-200 tabular-nums sm:text-sm">
            {formatTime(hud.elapsedSeconds)}
          </span>

          <button
            type="button"
            onClick={onToggleTouch}
            title="Alternar controles na tela"
            aria-label="Alternar controles na tela"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              showTouchControls
                ? 'bg-emerald-600/80 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={muted ? 'Ativar som' : 'Silenciar som'}
            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            title="Pausar (P ou ESC)"
            aria-label="Pausar jogo"
            className="flex h-8 items-center gap-1.5 rounded-md bg-slate-800 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 whitespace-nowrap shrink-0"
          >
            <Pause className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pausar</span>
          </button>
        </div>
      </header>

      {/* Mobile Boss Bar / Challenge line */}
      <div className="pointer-events-none fixed inset-x-0 top-14 z-20 flex justify-center px-3 md:hidden">
        {hud.bossActive ? (
          <div className="rounded-lg border border-amber-400/35 bg-slate-950/85 px-3 py-1.5 text-center backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 text-[11px] font-semibold text-amber-200">
              <span>Guardião da Floresta</span>
              <span className="tabular-nums">{hud.bossHp}/{hud.bossMaxHp} HP</span>
            </div>
            <div className="mt-1 h-2 w-44 overflow-hidden rounded-sm bg-slate-800">
              <div
                className="h-full bg-amber-500 transition-all duration-200"
                style={{ width: `${(hud.bossHp / hud.bossMaxHp) * 100}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Discrete Signpost Hint Toast */}
      {hud.activeHint && (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-20 flex justify-center px-4 md:top-16">
          <div className="max-w-md rounded-lg border border-amber-300/30 bg-slate-950/85 px-4 py-2.5 text-center shadow-lg backdrop-blur-sm">
            <p className="font-pixel text-xs text-amber-300 sm:text-sm">
              {hud.activeHint.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-200 sm:text-sm">
              {hud.activeHint.subtitle}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
