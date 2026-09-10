import { useId } from 'react';

export type IconKind = 'message' | 'photo' | 'themed' | 'mixed' | 'cookie' | 'cupcake' | 'cake' | 'donut';

interface Props {
  icon: IconKind;
  className?: string;
}

export default function CategoryIcon({ icon, className = 'w-12 h-12' }: Props) {
  const clipId = useId();
  switch (icon) {
    case 'message':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="32" cy="34" r="25" fill="#F3C989" stroke="#4A2C1D" strokeWidth="2.5" />
          <ellipse cx="24" cy="24" rx="8" ry="4" fill="#FCEBC6" opacity="0.55" />
          <path
            d="M32 50 C22 42 16 35 16 28 C16 22 21 18 26 18 C29 18 32 20 32 24 C32 20 35 18 38 18 C43 18 48 22 48 28 C48 35 42 42 32 50 Z"
            fill="#EC6FA0"
            stroke="#4A2C1D"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <ellipse cx="26" cy="25" rx="3.5" ry="2" fill="#FBD3E4" opacity="0.8" />
          <circle cx="14" cy="42" r="2" fill="#FCD34D" />
          <circle cx="49" cy="20" r="1.6" fill="#A78BFA" />
        </svg>
      );
    case 'photo':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="32" cy="34" r="25" fill="#F3C989" stroke="#4A2C1D" strokeWidth="2.5" />
          <ellipse cx="24" cy="24" rx="8" ry="4" fill="#FCEBC6" opacity="0.55" />
          <rect x="18" y="19" width="28" height="28" rx="4" fill="#FFF8EE" stroke="#A78BFA" strokeWidth="2.5" />
          <clipPath id={`ci-photo-frame-${clipId}`}>
            <rect x="19" y="20" width="26" height="26" rx="3" />
          </clipPath>
          <g clipPath={`url(#ci-photo-frame-${clipId})`}>
            <circle cx="27" cy="27" r="3" fill="#FCD34D" />
            <path d="M18 44 L27 33 L33 40 L38 34 L46 44 Z" fill="#4A2C1D" />
          </g>
        </svg>
      );
    case 'themed':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="30" cy="36" r="23" fill="#F3C989" stroke="#4A2C1D" strokeWidth="2.5" />
          <ellipse cx="23" cy="27" rx="7" ry="3.5" fill="#FCEBC6" opacity="0.5" />
          <circle cx="18" cy="42" r="2" fill="#EC6FA0" />
          <circle cx="38" cy="46" r="1.6" fill="#FCD34D" />
          <circle cx="40" cy="30" r="1.8" fill="#A78BFA" />
          <circle cx="22" cy="46" r="1.4" fill="#A78BFA" />
          <line x1="38" y1="20" x2="46" y2="8" stroke="#4A2C1D" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 8 L58 12 L48 18 Z" fill="#EC6FA0" stroke="#4A2C1D" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'mixed':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <path
            d="M12 30 L52 30 L48 52 C48 54 46 56 44 56 L20 56 C18 56 16 54 16 52 Z"
            fill="#FFF8EE"
            stroke="#4A2C1D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M10 24 L54 24 L52 30 L12 30 Z" fill="#F3C989" stroke="#4A2C1D" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="32" y1="30" x2="32" y2="56" stroke="#4A2C1D" strokeWidth="1.6" opacity="0.35" />
          <circle cx="20" cy="19" r="6.5" fill="#F3C989" stroke="#4A2C1D" strokeWidth="1.8" />
          <circle cx="18" cy="17.5" r="1" fill="#4A2C1D" />
          <circle cx="22" cy="20.5" r="1" fill="#4A2C1D" />
          <path d="M32 24 L38 24 L36 19 Z" fill="#F3C989" stroke="#4A2C1D" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="35" cy="15.5" r="4.6" fill="#DDD6FE" stroke="#4A2C1D" strokeWidth="1.4" />
          <circle cx="35.6" cy="10.5" r="3.4" fill="#DDD6FE" stroke="#4A2C1D" strokeWidth="1.4" />
          <circle cx="36" cy="6.6" r="1.6" fill="#EC6FA0" />
          <line x1="47" y1="21" x2="52" y2="12" stroke="#4A2C1D" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M52 12 L60 15 L51 20 Z" fill="#EC6FA0" stroke="#4A2C1D" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case 'cookie':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="32" cy="32" r="25" fill="#E8B968" stroke="#4A2C1D" strokeWidth="2.5" />
          <ellipse cx="23" cy="22" rx="9" ry="4.5" fill="#F4D493" opacity="0.6" />
          <circle cx="24" cy="22" r="2.3" fill="#6B3F2A" />
          <circle cx="38" cy="18" r="2" fill="#6B3F2A" />
          <circle cx="42" cy="30" r="2.4" fill="#6B3F2A" />
          <circle cx="26" cy="36" r="2" fill="#6B3F2A" />
          <circle cx="36" cy="42" r="2.2" fill="#6B3F2A" />
          <circle cx="20" cy="40" r="1.7" fill="#6B3F2A" />
        </svg>
      );
    case 'cupcake':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <path
            d="M20 34 L44 34 L40 54 C39.6 55.8 38 57 36 57 L28 57 C26 57 24.4 55.8 24 54 Z"
            fill="#EC6FA0"
            stroke="#4A2C1D"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <line x1="23" y1="40" x2="24.5" y2="53" stroke="#4A2C1D" strokeWidth="1" opacity="0.5" />
          <line x1="32" y1="38" x2="32" y2="55" stroke="#4A2C1D" strokeWidth="1" opacity="0.5" />
          <line x1="41" y1="40" x2="39.5" y2="53" stroke="#4A2C1D" strokeWidth="1" opacity="0.5" />
          <path
            d="M18 34 C18 26 24 20 32 20 C40 20 46 26 46 34 C46 36 44 37 42 36 C40 39 36 38 35 35 C33 39 28 38 28 34 C25 38 21 36 22 33 C19 34 17 36 18 34 Z"
            fill="#FFF8EE"
            stroke="#4A2C1D"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="17" r="3.2" fill="#EC6FA0" stroke="#4A2C1D" strokeWidth="1.4" />
        </svg>
      );
    case 'cake':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <path d="M10 54 L54 54 L48 40 L16 40 Z" fill="#DDD6FE" stroke="#4A2C1D" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 40 L48 40 L41 26 L23 26 Z" fill="#E8B968" stroke="#4A2C1D" strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d="M23 26 C23 18 27 13 32 13 C37 13 41 18 41 26 Z"
            fill="#FFFBF4"
            stroke="#4A2C1D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M27 26 C27 21 28.5 17 30 15" stroke="#F3D6AC" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <line x1="16" y1="40" x2="12.5" y2="47" stroke="#4A2C1D" strokeWidth="1" opacity="0.4" />
          <line x1="48" y1="40" x2="51.5" y2="47" stroke="#4A2C1D" strokeWidth="1" opacity="0.4" />
          <circle cx="32" cy="10" r="3.4" fill="#EC6FA0" stroke="#4A2C1D" strokeWidth="1.6" />
        </svg>
      );
    case 'donut':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className}>
          <circle cx="32" cy="30" r="24" fill="#F3C989" stroke="#4A2C1D" strokeWidth="2.5" />
          <circle cx="32" cy="30" r="9" fill="#FFF8EE" stroke="#4A2C1D" strokeWidth="2.5" />
          <path
            d="M12 32 C12 44 20 53 32 53 C44 53 52 44 52 32 C52 33 50 34 48 33 C46 39 40 43 32 43 C24 43 18 39 16 33 C14 34 12 33 12 32 Z"
            fill="#EC6FA0"
            opacity="0.92"
          />
          <ellipse cx="20" cy="46" rx="3" ry="1.6" fill="#EC6FA0" transform="rotate(-20 20 46)" />
          <rect x="26" y="48" width="4" height="2" rx="1" fill="#A78BFA" transform="rotate(10 28 49)" />
          <rect x="36" y="46" width="4" height="2" rx="1" fill="#4A2C1D" transform="rotate(-8 38 47)" />
          <circle cx="44" cy="42" r="1.6" fill="#FCD34D" />
        </svg>
      );
    default:
      return null;
  }
}
