export const recursiveErosionSource = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      --paper: #f7f2ea;
      --line: rgba(232, 222, 210, 0.9);
      --ink: #211f1c;
      --wine: #692b20;
      --blue: #6d8f90;
      --sage: #8ca77d;
      --shadow: rgba(0, 0, 0, 0.42);
    }

    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--paper);
      background:
        radial-gradient(circle at 50% 50%, rgba(120, 72, 34, 0.75), transparent 24%),
        radial-gradient(circle at 62% 34%, rgba(82, 101, 134, 0.54), transparent 22%),
        radial-gradient(circle at 41% 72%, rgba(103, 126, 96, 0.56), transparent 26%),
        #0a0908;
      font-family: "Inter", "Avenir Next", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    #stage {
      position: relative;
      width: min(640px, 85vw);
      aspect-ratio: 1 / 1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--line);
      box-shadow: inset 0 0 30px rgba(255, 245, 235, 0.06), 0 0 50px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      transform: rotate(-8deg);
    }

    #stage::before,
    #stage::after {
      content: "";
      position: absolute;
      inset: -7%;
      border-radius: 50%;
      border: 1px dashed rgba(247, 242, 234, 0.32);
    }

    #stage::after {
      inset: 12%;
      border-style: solid;
      border-color: rgba(247, 242, 234, 0.34);
    }

    .orb {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: blur(0.2px);
    }

    .orb .ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid var(--line);
      transform: rotate(22deg);
    }

    .orb .ring.one {
      inset: 12%;
    }

    .orb .ring.two {
      inset: 23%;
      border-style: dashed;
    }

    .orb .ring.three {
      inset: 34%;
      border-style: solid;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--paper);
      box-shadow: 0 0 8px rgba(247, 242, 234, 0.7);
      left: 50%;
      top: 50%;
      margin: -2px;
    }

    .particle.a { background: var(--wine); box-shadow: 0 0 10px var(--wine); }
    .particle.b { background: var(--blue); box-shadow: 0 0 10px var(--blue); }
    .particle.c { background: var(--sage); box-shadow: 0 0 10px var(--sage); }

    .node {
      position: absolute;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--paper);
      background: var(--wine);
      color: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      box-shadow: 0 0 0 1px rgba(247, 242, 234, 0.5), 0 3px 18px var(--shadow);
    }

    .node.blue { background: var(--blue); }
    .node.sage { background: var(--sage); }

    .node.one { left: calc(50% - 150px); top: calc(50% - 75px); }
    .node.two { left: calc(50% + 96px); top: calc(50% - 110px); }
    .node.three { left: calc(50% + 125px); top: calc(50% + 40px); }
    .node.four { left: calc(50% - 35px); top: calc(50% + 125px); }
    .node.five { left: calc(50% - 160px); top: calc(50% + 80px); }

    .line {
      position: absolute;
      height: 1px;
      width: 160px;
      border-top: 2px solid var(--paper);
      transform-origin: left center;
      opacity: 0.84;
      left: 50%;
      top: 50%;
    }

    .line.a { transform: rotate(30deg); }
    .line.b { transform: rotate(-55deg); width: 140px; border-top-color: var(--blue); }
    .line.c { transform: rotate(80deg); width: 140px; border-top-color: var(--sage); }
    .line.d { transform: rotate(-30deg); width: 115px; border-top-color: var(--wine); }

    .label {
      position: absolute;
      top: 45px;
      left: 50%;
      transform: translateX(-50%);
      font-family: "Courier New", monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--paper);
      border-bottom: 1px solid var(--paper);
      padding-bottom: 8px;
      white-space: nowrap;
      opacity: 0.9;
    }

    @media (max-width: 640px) {
      #stage { width: min(420px, 96vw); }
    }
  </style>
</head>
<body>
  <div id="stage">
    <div class="label">RECURRENT FIELD</div>
    <section class="orb">
      <span class="ring one"></span>
      <span class="ring two"></span>
      <span class="ring three"></span>

      <span class="particle a" style="transform: rotate(10deg) translateX(150px) translateY(-120px);"></span>
      <span class="particle b" style="transform: rotate(25deg) translateX(180px) translateY(120px);"></span>
      <span class="particle c" style="transform: rotate(40deg) translateX(-150px) translateY(110px);"></span>
      <span class="particle a" style="transform: rotate(58deg) translateX(-150px) translateY(-110px);"></span>
      <span class="particle b" style="transform: rotate(70deg) translateX(-30px) translateY(160px);"></span>

      <span class="line a" style="left: 48%; top: 50%;"></span>
      <span class="line b" style="left: 43%; top: 50%;"></span>
      <span class="line c" style="left: 49%; top: 56%;"></span>
      <span class="line d" style="left: 51%; top: 51%;"></span>

      <span class="node one">A</span>
      <span class="node blue two">M</span>
      <span class="node three">J</span>
      <span class="node blue four">E</span>
      <span class="node sage five">L</span>
    </section>
  </div>
</body>
</html>`;
