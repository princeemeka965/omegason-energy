import { useId } from 'react'

const palettes = {
  panels: ['#1d4aa8', '#0a1230'],
  inverters: ['#2a3f86', '#0a1230'],
  batteries: ['#0f5560', '#0a1230'],
  lighting: ['#46297a', '#0a1230'],
  kits: ['#8a4128', '#0a1230'],
}

// Built-in illustrations so products look good before real photos exist.
export default function ProductArt({ category, className = '' }) {
  const id = useId().replace(/:/g, '')
  const [a, b] = palettes[category] || palettes.panels
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`cell${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b78e0" />
          <stop offset="1" stopColor="#0d2b6e" />
        </linearGradient>
        <linearGradient id={`cone${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd56b" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffd56b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#bg${id})`} />
      <circle cx="338" cy="62" r="26" fill="#FFB21A" />
      <circle cx="338" cy="62" r="44" fill="#FFB21A" opacity=".18" />

      {category === 'panels' && (
        <g>
          <g transform="translate(70 70) skewX(-12)">
            {[0, 1].map((r) =>
              [0, 1, 2].map((c) => (
                <g key={`${r}${c}`}>
                  <rect x={c * 86} y={r * 70} width="80" height="64" rx="3" fill={`url(#cell${id})`} stroke="#9ec0ff" strokeOpacity=".7" />
                  {[1, 2].map((k) => <line key={`v${k}`} x1={c * 86 + k * 26.7} y1={r * 70} x2={c * 86 + k * 26.7} y2={r * 70 + 64} stroke="#9ec0ff" strokeOpacity=".28" />)}
                  {[1, 2].map((k) => <line key={`h${k}`} x1={c * 86} y1={r * 70 + k * 21.3} x2={c * 86 + 80} y2={r * 70 + k * 21.3} stroke="#9ec0ff" strokeOpacity=".28" />)}
                </g>
              )),
            )}
          </g>
          <path d="M118 212l-18 48M300 212l18 48M80 262h260" stroke="#9fb2d9" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}

      {category === 'inverters' && (
        <g>
          <rect x="130" y="50" width="140" height="190" rx="14" fill="#e8eefc" />
          <rect x="146" y="68" width="108" height="56" rx="6" fill="#0a1230" />
          <path d="M156 106l14-18 12 10 16-22 14 14 16-12" stroke="#FFB21A" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="160" cy="148" r="5" fill="#36d27a" /><circle cx="180" cy="148" r="5" fill="#FFB21A" /><circle cx="200" cy="148" r="5" fill="#8aa0d6" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="146" y={168 + i * 12} width="108" height="5" rx="2.5" fill="#b5c3ea" />)}
          <path d="M160 240v36M200 240v36M240 240v36" stroke="#9fb2d9" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}

      {category === 'batteries' && (
        <g>
          <rect x="110" y="60" width="180" height="190" rx="14" fill="#dff3f1" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="128" y={76 + i * 42} width="144" height="32" rx="6" fill="#0a3f48" />
              <rect x="136" y={84 + i * 42} width={96 - i * 14} height="16" rx="3" fill="#36d27a" />
              <circle cx="254" cy={92 + i * 42} r="4" fill="#9fe8c2" />
            </g>
          ))}
          <rect x="190" y="48" width="20" height="12" rx="3" fill="#9fb2d9" />
        </g>
      )}

      {category === 'lighting' && (
        <g>
          <path d="M150 270V90q0-30 40-30h40" stroke="#b9c6ea" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="128" y="40" width="64" height="12" rx="3" fill={`url(#cell${id})`} stroke="#9ec0ff" transform="rotate(-8 160 46)" />
          <rect x="216" y="58" width="52" height="16" rx="8" fill="#ffe9a8" />
          <path d="M222 74L196 262h108L262 74z" fill={`url(#cone${id})`} />
          <path d="M120 270h60" stroke="#b9c6ea" strokeWidth="8" strokeLinecap="round" />
        </g>
      )}

      {category === 'kits' && (
        <g>
          <path d="M80 150L200 60l120 90v110H80z" fill="#f2e4d3" />
          <path d="M70 156L200 54l130 102" stroke="#0a1230" strokeWidth="10" fill="none" strokeLinejoin="round" />
          <g transform="translate(150 86) rotate(-38 40 20)">
            {[0, 1].map((c) => <rect key={c} x={c * 46} y="0" width="42" height="30" rx="2" fill={`url(#cell${id})`} stroke="#9ec0ff" />)}
          </g>
          <rect x="180" y="190" width="40" height="70" rx="4" fill="#8a4128" />
          <rect x="110" y="180" width="40" height="36" rx="3" fill="#ffd56b" />
          <rect x="250" y="180" width="40" height="36" rx="3" fill="#ffd56b" />
        </g>
      )}
    </svg>
  )
}
