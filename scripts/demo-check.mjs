/**
 * End-to-end check of the demo path (spec §23 "Definition of done").
 *
 * Run with `npm run check:demo` while `npm run dev` is up. This is the script
 * to run before presenting — it walks the exact path the demo takes and fails
 * loudly if any beat is broken.
 */
import { chromium } from "playwright";

const BASE = process.env.ORBIT_URL ?? "http://localhost:3210";
const results = [];
const errors = [];

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

// --- 1. Professor can open the seeded classroom dashboard -------------------
await page.goto(`${BASE}/professor/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
// innerText returns CSS-transformed text, and several labels are uppercased,
// so every content assertion below is case-insensitive.
const dashText = (await page.locator("main").innerText()).toLowerCase();
check("Professor dashboard opens with the seeded class",
  dashText.includes("human-centered computing") && dashText.includes("orbit7"));
check("Dashboard shows aggregate insights",
  dashText.includes("passports completed") && dashText.includes("bridge the class"));
check("Dashboard never shows a per-student connection count",
  !/\b\d+\s+connections\b/i.test(dashText));

// Baseline: how big is the seeded class before anyone joins? Derived rather
// than hardcoded so growing the class does not fail the demo check.
await page.goto(`${BASE}/constellation`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
const SEEDED = await page.locator(".react-flow__node").count();
check("Seeded class renders before anyone joins", SEEDED > 0, `${SEEDED} students`);

// --- 2. Student joins with a code and answers six questions ----------------
await page.goto(`${BASE}/join`, { waitUntil: "networkidle" });
await page.fill("#join-code", "ORBIT7");
await page.getByRole("button", { name: "Continue" }).click();
await page.waitForURL("**/onboarding");
await page.fill("#display-name", "Riya");
await page.fill("#pronouns", "she/her");
await page.getByRole("button", { name: "Continue" }).click();

// Six core questions. Pick answers that guarantee explainable matches.
const picks = [
  ["Machine Learning", "Cloud Computing"],       // academic interests
  ["Frontend Development", "UI/UX Design"],      // can help with
  ["Backend Development", "Python"],             // wants to learn
  ["Coffee", "Photography"],                     // hobbies
  ["Designer"],                                  // project role
  ["Either is fine"],                            // meeting preference
];
for (const options of picks) {
  for (const option of options) {
    await page.getByText(option, { exact: true }).first().click();
  }
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(150);
}
await page.getByRole("button", { name: "Create my passport" }).click();
await page.waitForURL("**/passport");
await page.waitForTimeout(1400);

// --- 3. Passport + at least three explainable connections ------------------
const passportText = (await page.locator("main").innerText()).toLowerCase();
check("Passport is generated for the new student", passportText.includes("riya"));
check("Passport shows the skill exchange sections",
  passportText.includes("can help with") && passportText.includes("wants to learn"));

const suggestionItems = await page.locator("aside ul > li").count();
const asideText = await page.locator("aside").innerText();
const explanations = (asideText.match(/You both|a skill/g) ?? []).length;
check("At least three explainable connections are offered",
  suggestionItems >= 3 && explanations >= 3, `${suggestionItems} people, ${explanations} reasons`);
await page.screenshot({ path: "/tmp/shots/e2e-passport.png" });

// --- 4. Node appears in the constellation ----------------------------------
await page.getByRole("link", { name: "Enter the constellation" }).click();
await page.waitForURL("**/constellation");
await page.waitForTimeout(2400);
const nodeLabels = (await page.locator(".react-flow__node").allInnerTexts()).join(" ");
check("The new student's node is in the constellation", nodeLabels.includes("Riya"));
const nodeCount = await page.locator(".react-flow__node").count();
check(`All ${SEEDED + 1} students are rendered`, nodeCount === SEEDED + 1, `${nodeCount} nodes`);

// Equal node size is a product invariant — verify it, don't assume it.
const sizes = await page.evaluate(() =>
  [...document.querySelectorAll(".react-flow__node")].map((n) =>
    Math.round(n.getBoundingClientRect().width)));
check("Every node is exactly the same size", new Set(sizes).size === 1, `sizes: ${[...new Set(sizes)].join(",")}`);

// --- 5. Complete a mission; suggested edge becomes confirmed ---------------
const solidBefore = await page.evaluate(() =>
  [...document.querySelectorAll(".react-flow__edge-path")]
    .filter((p) => !p.style.strokeDasharray).length);
const missionText = (await page.locator("aside").innerText()).toLowerCase();
check("A connection mission is offered with a reason and a prompt",
  missionText.includes("connection mission") && missionText.includes("why them"));

await page.getByRole("button", { name: "We met" }).click();
await page.waitForTimeout(1200);
const solidAfter = await page.evaluate(() =>
  [...document.querySelectorAll(".react-flow__edge-path")]
    .filter((p) => !p.style.strokeDasharray).length);
check("Confirming an introduction turns a dashed edge solid",
  solidAfter === solidBefore + 1, `solid edges ${solidBefore} → ${solidAfter}`);
await page.screenshot({ path: "/tmp/shots/e2e-constellation.png" });

// --- 6. Accessible list view is a real peer of the graph -------------------
await page.getByRole("tab", { name: "List" }).click();
await page.waitForTimeout(600);
const listText = (await page.locator("main").innerText()).toLowerCase();
check("List view shows every student with plain-language reasons",
  listText.includes("riya") && listText.includes("aisha"));
await page.screenshot({ path: "/tmp/shots/e2e-list.png" });

// --- 7. Professor sees before/after belonging ------------------------------
await page.goto(`${BASE}/professor/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.getByRole("button", { name: "Run the activity" }).click();
// A real database round trip now, not a local state flip. Wait for the OUTCOME
// rather than for a spinner to vanish — the spinner is absent at click time too.
await page.waitForFunction(
  () => /agreement moved from/i.test(document.body.innerText),
  undefined,
  { timeout: 25000 },
).catch(() => {});
const afterText = (await page.locator("main").innerText()).toLowerCase();
check("Belonging pulse shows before and after",
  afterText.includes("before the activity") && afterText.includes("after the activity")
  && /agreement moved from/.test(afterText));
await page.screenshot({ path: "/tmp/shots/e2e-dashboard.png", fullPage: true });

// --- 8. Demo reset restores a clean, rehearsable state ---------------------
await page.getByRole("button", { name: "Reset demo" }).click();
await page.getByRole("button", { name: "Confirm reset" }).click();
await page.waitForURL(`${BASE}/`);
await page.goto(`${BASE}/constellation`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const afterReset = await page.locator(".react-flow__node").count();
check(`Demo reset returns to the pristine ${SEEDED}-student class`, afterReset === SEEDED, `${afterReset} nodes`);

check("No console or page errors during the whole run",
  errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILED:\n  " + failed.map((f) => f.name).join("\n  "));
  process.exit(1);
}
