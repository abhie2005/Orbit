/**
 * Decorative hero graphic: a miniature constellation.
 *
 * Static SVG on purpose — it renders on the server, costs no JavaScript, and
 * cannot violate the "no constantly moving background" rule. Every node is the
 * same size here too, because that invariant holds even in marketing art.
 */

const NODES = [
  { x: 120, y: 60, label: "A" },
  { x: 250, y: 34, label: "M" },
  { x: 340, y: 120, label: "J" },
  { x: 286, y: 216, label: "E" },
  { x: 160, y: 200, label: "L" },
  { x: 46, y: 140, label: "N" },
  { x: 214, y: 128, label: "S" },
];

const EDGES: { from: number; to: number; color: string; dash?: string }[] = [
  { from: 0, to: 1, color: "var(--orbit-violet)" },
  { from: 1, to: 2, color: "var(--orbit-blue)" },
  { from: 2, to: 3, color: "var(--orbit-amber)", dash: "1 6" },
  { from: 3, to: 4, color: "var(--orbit-violet)" },
  { from: 4, to: 5, color: "var(--orbit-green)", dash: "2 4 8 4" },
  { from: 5, to: 0, color: "var(--orbit-blue)" },
  { from: 6, to: 0, color: "var(--orbit-amber)", dash: "1 6" },
  { from: 6, to: 3, color: "var(--orbit-violet)", dash: "10 5" },
  { from: 6, to: 1, color: "var(--orbit-blue)" },
];

export function HeroConstellation() {
  return (
    <svg
      viewBox="0 0 386 260"
      role="img"
      aria-label="A small constellation of seven equally sized student nodes joined by coloured connection lines."
      className="h-auto w-full max-w-md"
    >
      <defs>
        <radialGradient id="orbit-node-fill" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#6d5ce0" />
        </radialGradient>
      </defs>

      {EDGES.map((edge, i) => {
        const a = NODES[edge.from];
        const b = NODES[edge.to];
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={edge.color}
            strokeWidth={1.75}
            strokeDasharray={edge.dash}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}

      {NODES.map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r={19} fill="var(--orbit-bg)" />
          <circle
            cx={node.x}
            cy={node.y}
            r={16}
            fill="url(#orbit-node-fill)"
            stroke="rgba(248,250,252,0.35)"
            strokeWidth={1}
          />
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="#0b0f1c"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
