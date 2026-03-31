// Fresh Breeze palette:
// #82C6C8 teal | #C1E2DE light teal | #FFD95D yellow
// #FFB97C peach | #FFFDF3 cream | #2A7A7C dark teal

const P0 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#82C6C8" />
    <path d="M-20,50 Q60,20 140,50 Q220,80 300,50 Q380,20 440,50" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
    <path d="M-20,80 Q80,50 160,80 Q240,110 320,80 Q380,55 440,80" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="4" />
    <path d="M-20,115 Q70,85 150,115 Q230,145 310,115 Q370,90 440,115" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="5" />
  </svg>
);

const P1 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#FFD95D" />
    <circle cx="200" cy="220" r="28" fill="rgba(255,255,255,0.55)" />
    {/* Radiating spokes fanning upward */}
    <line x1="200" y1="220" x2="60"  y2="10"  stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
    <line x1="200" y1="220" x2="100" y2="-5"  stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="200" y1="220" x2="145" y2="-10" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
    <line x1="200" y1="220" x2="175" y2="-12" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round" />
    <line x1="200" y1="220" x2="200" y2="-15" stroke="rgba(255,255,255,0.6)"  strokeWidth="3.5" strokeLinecap="round" />
    <line x1="200" y1="220" x2="225" y2="-12" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round" />
    <line x1="200" y1="220" x2="255" y2="-10" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
    <line x1="200" y1="220" x2="300" y2="-5"  stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="200" y1="220" x2="340" y2="10"  stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const P2 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#FFB97C" />
    <circle cx="80"  cy="100" r="75"  fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
    <circle cx="200" cy="70"  r="90"  fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
    <circle cx="320" cy="110" r="80"  fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
    <circle cx="150" cy="140" r="55"  fill="rgba(255,255,255,0.1)"  stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
    <circle cx="290" cy="30"  r="50"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
  </svg>
);

const P3 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#C1E2DE" />
    {/* Diamond grid: vertical lines */}
    {[-40, -10, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320, 350, 380, 410].map((x, i) => (
      <line key={`v${i}`} x1={x} y1="0" x2={x + 80} y2="160" stroke="#2A7A7C" strokeWidth="1.2" strokeOpacity="0.35" />
    ))}
    {/* Diamond grid: anti-diagonal lines */}
    {[-40, -10, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320, 350, 380, 410].map((x, i) => (
      <line key={`d${i}`} x1={x + 80} y1="0" x2={x} y2="160" stroke="#2A7A7C" strokeWidth="1.2" strokeOpacity="0.35" />
    ))}
  </svg>
);

const P4 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#2A7A7C" />
    <path d="M20,180 Q100,120 200,140 Q300,160 380,100" fill="none" stroke="#C1E2DE" strokeWidth="3"   strokeOpacity="0.55" />
    <path d="M20,155 Q110,95  200,115 Q290,135 380,75"  fill="none" stroke="#C1E2DE" strokeWidth="2.5" strokeOpacity="0.45" />
    <path d="M20,130 Q120,70  200,90  Q280,110 380,50"  fill="none" stroke="#82C6C8" strokeWidth="3"   strokeOpacity="0.5" />
    <path d="M20,105 Q130,45  200,65  Q270,85  380,25"  fill="none" stroke="#82C6C8" strokeWidth="2"   strokeOpacity="0.35" />
  </svg>
);

const P5 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#FFD95D" />
    <line x1="-10" y1="0" x2="170" y2="160" stroke="rgba(255,255,255,0.65)" strokeWidth="28" />
    <line x1="50"  y1="0" x2="230" y2="160" stroke="rgba(255,255,255,0.45)" strokeWidth="20" />
    <line x1="120" y1="0" x2="300" y2="160" stroke="rgba(255,255,255,0.6)"  strokeWidth="24" />
    <line x1="200" y1="0" x2="380" y2="160" stroke="rgba(255,255,255,0.4)"  strokeWidth="18" />
    <line x1="280" y1="0" x2="460" y2="160" stroke="rgba(255,255,255,0.55)" strokeWidth="22" />
    <line x1="360" y1="0" x2="540" y2="160" stroke="rgba(255,255,255,0.35)" strokeWidth="16" />
  </svg>
);

const P6 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#FFB97C" />
    {/* Large teardrop / leaf shapes */}
    <path d="M100,170 Q-30,100 60,20 Q120,-20 160,80 Q190,150 100,170Z"
      fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <path d="M300,180 Q160,110 240,10 Q300,-30 350,80 Q390,160 300,180Z"
      fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
    <path d="M200,160 Q100,90  180,-10 Q230,-40 260,70 Q280,140 200,160Z"
      fill="rgba(255,255,255,0.1)"  stroke="rgba(255,255,255,0.2)"  strokeWidth="1" />
  </svg>
);

const P7 = () => {
  // Hex grid: two rows offset
  // Row 1: y-center 41, hexes at x-offsets 0, 62, 124, 186, 248, 310, 372
  // Row 2: offset (31, 54) from row 1 start
  const hexPoints = (cx, cy) => {
    const rx = 31, ry = 36;
    return [
      `${cx},${cy - ry}`,
      `${cx + rx},${cy - ry / 2}`,
      `${cx + rx},${cy + ry / 2}`,
      `${cx},${cy + ry}`,
      `${cx - rx},${cy + ry / 2}`,
      `${cx - rx},${cy - ry / 2}`,
    ].join(' ');
  };
  const row1Centers = [50, 112, 174, 236, 298, 360].map(x => ({ x, y: 41 }));
  const row2Centers = [81, 143, 205, 267, 329, 391].map(x => ({ x, y: 95 }));
  return (
    <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="160" fill="#82C6C8" />
      {[...row1Centers, ...row2Centers].map(({ x, y }, i) => (
        <polygon
          key={i}
          points={hexPoints(x, y)}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.8"
        />
      ))}
    </svg>
  );
};

const P8 = () => (
  <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="160" fill="#FFFDF3" />
    {/* Overlapping translucent circles */}
    <circle cx="110" cy="70"  r="100" fill="rgba(130,198,200,0.22)" />
    <circle cx="240" cy="90"  r="110" fill="rgba(255,217,93,0.2)" />
    <circle cx="320" cy="50"  r="85"  fill="rgba(255,185,124,0.2)" />
    {/* Gentle wave */}
    <path d="M-10,130 Q80,110 160,130 Q240,150 320,130 Q380,115 420,130"
      fill="none" stroke="rgba(130,198,200,0.5)" strokeWidth="2.5" />
  </svg>
);

export const PATTERNS = [
  { id: 0, label: 'Ocean',     Component: P0 },
  { id: 1, label: 'Sunrise',   Component: P1 },
  { id: 2, label: 'Bubbles',   Component: P2 },
  { id: 3, label: 'Lattice',   Component: P3 },
  { id: 4, label: 'Deep Tide', Component: P4 },
  { id: 5, label: 'Stripes',   Component: P5 },
  { id: 6, label: 'Bloom',     Component: P6 },
  { id: 7, label: 'Hex',       Component: P7 },
  { id: 8, label: 'Breeze',    Component: P8 },
];
