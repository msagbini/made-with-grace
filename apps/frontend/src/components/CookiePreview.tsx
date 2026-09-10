'use client';

export type CookieSize = 'Pequeña' | 'Mediana' | 'Grande';

interface CookiePreviewProps {
  sizeLabel: CookieSize;
  color?: string;
  message?: string;
  photoUrl?: string | null;
  selection?: string;
}

const SIZE_PX: Record<CookieSize, number> = {
  Pequeña: 140,
  Mediana: 190,
  Grande: 240,
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

function sprinklePositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: 100 + Math.cos(angle) * 70,
      y: 100 + Math.sin(angle) * 70,
      rotate: (angle * 180) / Math.PI + 90,
    };
  });
}

export default function CookiePreview({ sizeLabel, color, message, photoUrl, selection }: CookiePreviewProps) {
  const px = SIZE_PX[sizeLabel];
  const icingColor = color || '#FDEBD3';
  const textColor = isLightColor(icingColor) ? '#4A2C1D' : '#FFFFFF';
  const lines = message ? wrapMessage(message) : [];
  const dots = sprinklePositions(8);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full py-6">
      <div
        className="relative transition-all duration-300 ease-out drop-shadow-lg"
        style={{ width: px, height: px }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <clipPath id="photoClip">
              <circle cx="100" cy="100" r="66" />
            </clipPath>
          </defs>

          {/* Base dough */}
          <circle cx="100" cy="100" r="92" fill="#E7B978" stroke="#C9924A" strokeWidth="3" />

          {/* Icing layer */}
          <circle cx="100" cy="100" r="80" fill={icingColor} stroke="#00000015" strokeWidth="1" />

          {!photoUrl &&
            dots.map((d, i) => (
              <ellipse
                key={i}
                cx={d.x}
                cy={d.y}
                rx="4"
                ry="2.2"
                fill={SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]}
                transform={`rotate(${d.rotate} ${d.x} ${d.y})`}
              />
            ))}

          {photoUrl ? (
            <>
              <image
                href={photoUrl}
                x="34"
                y="34"
                width="132"
                height="132"
                clipPath="url(#photoClip)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle cx="100" cy="100" r="66" fill="none" stroke="#FFFFFF" strokeWidth="3" />
            </>
          ) : lines.length > 0 ? (
            <text
              x="100"
              y={lines.length > 1 ? 92 : 106}
              textAnchor="middle"
              fill={textColor}
              fontSize="20"
              fontFamily="'Brush Script MT', 'Segoe Script', cursive"
              fontWeight="700"
            >
              {lines.map((line, i) => (
                <tspan key={i} x="100" dy={i === 0 ? 0 : 24}>
                  {line}
                </tspan>
              ))}
            </text>
          ) : (
            <text x="100" y="112" textAnchor="middle" fontSize="34">
              🍪
            </text>
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold bg-white/80 border border-chocolate/10 text-chocolate px-3 py-1 rounded-full">
          Tamaño: {sizeLabel}
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
