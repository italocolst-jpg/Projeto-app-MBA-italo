import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap } from 'lucide-react';

interface TouchControlsProps {
  onInputChange: (key: 'left' | 'right' | 'jump' | 'run', active: boolean) => void;
  runActive: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputChange,
  runActive,
}) => {
  const bindButton = (key: 'left' | 'right' | 'jump' | 'run') => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onInputChange(key, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      onInputChange(key, false);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onInputChange(key, false);
    },
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex items-end justify-between px-4 sm:px-6">
      {/* Left / Right D-Pad */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Mover para esquerda"
          {...bindButton('left')}
          className="flex h-14 w-14 touch-none items-center justify-center rounded-xl border border-white/25 bg-slate-950/75 text-white shadow-lg active:scale-95 active:bg-emerald-600/85 sm:h-16 sm:w-16"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="Mover para direita"
          {...bindButton('right')}
          className="flex h-14 w-14 touch-none items-center justify-center rounded-xl border border-white/25 bg-slate-950/75 text-white shadow-lg active:scale-95 active:bg-emerald-600/85 sm:h-16 sm:w-16"
        >
          <ArrowRight className="h-7 w-7" />
        </button>
      </div>

      {/* Run + Jump Action Buttons */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Correr"
          {...bindButton('run')}
          className={`flex h-14 w-14 touch-none flex-col items-center justify-center rounded-xl border text-xs font-bold shadow-lg active:scale-95 sm:h-16 sm:w-16 ${
            runActive
              ? 'border-amber-300 bg-amber-500/85 text-slate-950'
              : 'border-white/25 bg-slate-950/75 text-amber-300'
          }`}
        >
          <Zap className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] tracking-wide">CORRER</span>
        </button>

        <button
          type="button"
          aria-label="Pular"
          {...bindButton('jump')}
          className="flex h-16 w-16 touch-none flex-col items-center justify-center rounded-xl border border-emerald-300/60 bg-emerald-600/85 text-white shadow-lg active:scale-95 active:bg-emerald-500 sm:h-18 sm:w-18"
        >
          <ArrowUp className="h-7 w-7" />
          <span className="text-[10px] font-bold tracking-wide">PULAR</span>
        </button>
      </div>
    </div>
  );
};
