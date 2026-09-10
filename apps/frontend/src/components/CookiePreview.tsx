'use client';

import { useId } from 'react';

export type CookieSize = 'Small' | 'Medium' | 'Large';

interface CookiePreviewProps {
  sizeLabel: CookieSize;
  color?: string;
  message?: string;
  photoUrl?: string | null;
  selection?: string;
}

const SIZE_PX: Record<CookieSize, number> = {
  Small: 150,
  Medium: 200,
  Large: 250,
};

const SPRINKLE_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#ec4899', '#a855f7'];

function isLightColor(hex?: string): boolean {
  if (!hex) return true;
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return true;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

function wrapMessage(message: string): string[] {
  if (message.length <= 11) return [message];
  const words = message.split(' ');
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');
  return line2 ? [line1, line2] : [line1];
}

function sprinkles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2 + (i % 2 === 0 ? 0.18 : -0.12);
    const radius = 58 + (i % 3) * 6;
    return {
      x: 100 + Math.cos(angle) * radius,
      y: 100 + Math.sin(angle) * radius,
      rotate: (angle * 180) / Math.PI + 90 + (i % 2 === 0 ? 20 : -15),
      color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
    };
  });
}

export default function CookiePreview({ sizeLabel, color, message, photoUrl, selection }: CookiePreviewProps) {
  const uid = useId();
  const doughGradientId = `cp-dough-${uid}`;
  const icingGradientId = `cp-icing-${uid}`;
  const photoClipId = `cp-photo-${uid}`;

  const px = SIZE_PX[sizeLabel];
  const icingColor = color || '#FDEBD3';
  const textColor = isLightColor(icingColor) ? '#B23A6B' : '#FFFFFF';
  const lines = message ? wrapMessage(message) : [];
  const dots = sprinkles(9);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full py-6">
      <div className="relative transition-all duration-300 ease-out" style={{ width: px, height: px }}>
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="absolute inset-0" aria-hidden>
          <ellipse cx="100" cy="192" rx="66" ry="9" fill="#4A2C1D" opacity="0.12" />
        </svg>
        <svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          className="relative drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 10px 12px rgba(74,44,29,0.22))' }}
        >
          <defs>
            <radialGradient id={doughGradientId} cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#F0C989" />
              <stop offset="100%" stopColor="#D89B52" />
            </radialGradient>
            <radialGradient id={icingGradientId} cx="36%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#FFFBF3" />
              <stop offset="55%" stopColor={icingColor} />
              <stop offset="100%" stopColor={icingColor} />
            </radialGradient>
            <clipPath id={photoClipId}>
              <circle cx="100" cy="100" r="66" />
            </clipPath>
          </defs>

          {/* Base dough */}
          <circle cx="100" cy="100" r="92" fill={`url(#${doughGradientId})`} stroke="#C9924A" strokeWidth="3" />

          {/* Icing layer */}
          <circle cx="100" cy="100" r="80" fill={`url(#${icingGradientId})`} />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#00000012" strokeWidth="1" />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#E9C68F"
            strokeWidth="2.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
            opacity="0.7"
          />
          <ellipse cx="76" cy="68" rx="30" ry="16" fill="#FFFFFF" opacity="0.35" />

          {photoUrl ? (
            <>
              <g clipPath={`url(#${photoClipId})`}>
                <image href={photoUrl} x="34" y="34" width="132" height="132" preserveAspectRatio="xMidYMid slice" />
              </g>
              <circle cx="100" cy="100" r="66" fill="none" stroke="#FFFFFF" strokeWidth="5" />
            </>
          ) : lines.length > 0 ? (
            <text
              x="100"
              y={lines.length > 1 ? 94 : 108}
              textAnchor="middle"
              fill={textColor}
              fontSize="24"
              fontFamily="'Caveat', 'Brush Script MT', cursive"
              fontWeight="700"
            >
              {lines.map((line, i) => (
                <tspan key={i} x="100" dy={i === 0 ? 0 : 28}>
                  {line}
                </tspan>
              ))}
            </text>
          ) : (
            dots.map((d, i) => (
              <rect
                key={i}
                x={-4.5}
                y={-2}
                width="9"
                height="4"
                rx="2"
                fill={d.color}
                transform={`translate(${d.x} ${d.y}) rotate(${d.rotate})`}
              />
            ))
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold bg-white/80 border border-chocolate/10 text-chocolate px-3 py-1 rounded-full">
          Size: {sizeLabel}
        </span>
        {selection && (
          <span className="text-xs font-semibold bg-white/80 border border-chocolate/10 text-chocolate px-3 py-1 rounded-full">
            {selection}
          </span>
        )}
      </div>
    </div>
  );
}
