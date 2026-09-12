/**
 * Sanity checks on the pure matching/grouping logic.
 * Run with `npm run check:logic`. No UI, no browser, no network.
 *
 * This exists so we can prove the constellation has the right SHAPE before
 * spending hackathon time rendering it.
 */

import assert from "node:assert/strict";
import { buildConstellation, explainReasons, scorePair } from "../lib/matching";
import { DEMO_CLASSROOM, SEED_STUDENTS, seedFeatures } from "../lib/seed-data";

const features = seedFeatures();
const names = Object.fromEntries(
  SEED_STUDENTS.map((r) => [r.student.id, r.student.displayName]),
);

const connections = buildConstellation(DEMO_CLASSROOM.id, features);

const degree: Record<string, number> = Object.fromEntries(
  features.map((f) => [f.id, 0]),
);
for (const c of connections) {
  degree[c.studentAId] += 1;
  degree[c.studentBId] += 1;
}

console.log(`\nEdges: ${connections.length} across ${features.length} students\n`);
console.log("Degree distribution");
for (const [id, d] of Object.entries(degree).sort((a, b) => a[1] - b[1])) {
  console.log(`  ${String(names[id]).padEnd(8)} ${"●".repeat(d)} ${d}`);
}

console.log("\nTop 6 edges");
for (const c of connections.slice(0, 6)) {
  const [why] = explainReasons(c.reasons, names, undefined, 1);
  console.log(
    `  ${names[c.studentAId]} ↔ ${names[c.studentBId]}  (${c.score})  ${why}`,
  );
}

console.log("\nAisha's edges (must be exactly 1 before Bridge the Class)");
for (const c of connections.filter(
  (c) => c.studentAId === "stu_aisha" || c.studentBId === "stu_aisha",
)) {
  const other = c.studentAId === "stu_aisha" ? c.studentBId : c.studentAId;
  console.log(`  → ${names[other]} (${c.score})`);
  for (const line of explainReasons(c.reasons, names, "stu_aisha")) {
    console.log(`      ${line}`);
  }
}

// ---- assertions -----------------------------------------------------------

// Determinism: reversing input order must produce an identical graph.
const reversed = buildConstellation(DEMO_CLASSROOM.id, [...features].reverse());
assert.deepEqual(
  connections.map((c) => c.id),
  reversed.map((c) => c.id),
  "buildConstellation must be order-independent",
);

// Every edge must be explainable.
for (const c of connections) {
  assert.ok(c.reasons.length > 0, `edge ${c.id} has no reasons`);
  assert.ok(
    explainReasons(c.reasons, names).every((s) => s.length > 10),
    `edge ${c.id} produced an empty explanation`,
  );
}

// Nobody is stranded: every student must have at least one edge.
for (const [id, d] of Object.entries(degree)) {
  assert.ok(d >= 1, `${names[id]} has no connections at all`);
}

// Exactly one student is sparse, and it is the one we designed to be.
const sparse = Object.entries(degree).filter(([, d]) => d === 1);
assert.equal(sparse.length, 1, `expected exactly one sparse student, got ${sparse.length}`);
assert.equal(sparse[0][0], "stu_aisha", "the sparse student must be Aisha");

// The spec's headline demo match must actually exist.
const abhiMaya = connections.find(
  (c) =>
    [c.studentAId, c.studentBId].includes("stu_abhi") &&
    [c.studentAId, c.studentBId].includes("stu_maya"),
);
assert.ok(abhiMaya, "Abhi ↔ Maya edge missing — the demo script depends on it");
assert.ok(
  abhiMaya.reasons.some((r) => r.category === "complementary_skill"),
  "Abhi ↔ Maya must include a skill exchange",
);
assert.ok(
  abhiMaya.reasons.some((r) => r.label === "Science Fiction"),
  "Abhi ↔ Maya must include the Science Fiction reason from the spec copy",
);

// Scoring symmetry.
const ab = scorePair(features[0], features[1]);
const ba = scorePair(features[1], features[0]);
assert.equal(ab.baseScore, ba.baseScore, "scorePair must be symmetric");

console.log("\n✅ all logic checks passed\n");

// ---- layout ---------------------------------------------------------------

import { layoutConstellation } from "../lib/layout";

const positions = layoutConstellation(
  features.map((f) => ({ id: f.id })),
  connections.map((c) => ({
    source: c.studentAId,
    target: c.studentBId,
    weight: c.score / 6,
  })),
);

assert.equal(Object.keys(positions).length, features.length, "every node needs a position");
for (const [id, p] of Object.entries(positions)) {
  assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), `${id} has a non-finite position`);
}

// Layout must be deterministic and order-independent too.
const positionsAgain = layoutConstellation(
  [...features].reverse().map((f) => ({ id: f.id })),
  connections.map((c) => ({
    source: c.studentAId,
    target: c.studentBId,
    weight: c.score / 6,
  })),
);
assert.deepEqual(positions, positionsAgain, "layout must be deterministic");

// No two students may land on top of each other.
const pts = Object.values(positions);
for (let i = 0; i < pts.length; i += 1) {
  for (let j = i + 1; j < pts.length; j += 1) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    // Threshold tracks NODE_SIZE (52) plus room for the label chip beneath it.
    assert.ok(d > 92, `two nodes are only ${Math.round(d)}px apart — labels will collide`);
  }
}

console.log("✅ layout checks passed\n");


// ---- passport legibility ---------------------------------------------------

import { AVATAR_FILLS, avatarTextColor, buildPassport, contrastRatio } from "../lib/passport";

console.log("\nAvatar initials contrast (must be >= 4.5 on every fill)");
let worstFill = Infinity;
for (const fill of AVATAR_FILLS) {
  const ratio = contrastRatio(fill, avatarTextColor(fill));
  worstFill = Math.min(worstFill, ratio);
  assert.ok(ratio >= 4.5, `fill ${fill}: initials contrast ${ratio.toFixed(2)} below 4.5`);
}
console.log(`  worst ${worstFill.toFixed(2)}:1 across ${AVATAR_FILLS.length} fills`);

// Every seeded student must land on a fill from the fixed palette.
for (const record of SEED_STUDENTS) {
  const pass = buildPassport(record.student, record.answers);
  assert.ok(
    (AVATAR_FILLS as readonly string[]).includes(pass.orbit.fill),
    `${record.student.displayName} got off-palette fill ${pass.orbit.fill}`,
  );
}
console.log(`  all ${SEED_STUDENTS.length} seeded students are on-palette`);

console.log("\n✅ passport legibility checks passed\n");
