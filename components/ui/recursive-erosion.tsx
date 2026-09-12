"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";

type EffectMode = "light" | "dark";
type Particle = { x: number; y: number; z: number; seed: number };

export type RecursiveErosionBackgroundProps = {
  mode?: EffectMode;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
};

export const RECURSIVE_EROSION_DEFAULTS = {
  mode: "dark",
  hue: 0,
  saturation: 1,
  brightness: 1,
} as const;

const PARTICLE_COUNT = 1_460;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function buildSphere(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const y = 1 - (index / (PARTICLE_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * index;
    return {
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
      seed: ((index * 73) % 101) / 101,
    };
  });
}

function rotateParticle(particle: Particle, time: number) {
  const yaw = time * 0.105;
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const x1 = particle.x * cosYaw - particle.z * sinYaw;
  const z1 = particle.x * sinYaw + particle.z * cosYaw;
  const tilt = -0.22;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  return {
    x: x1,
    y: particle.y * cosTilt - z1 * sinTilt,
    z: particle.y * sinTilt + z1 * cosTilt,
  };
}

function erosionStrength(x: number, y: number, z: number, time: number, seed: number) {
  const ribbon =
    Math.sin(x * 7.2 + y * 3.1 + time * 0.7) +
    Math.sin(y * 9.4 - z * 4.3 - time * 0.42) +
    Math.sin((x + z) * 11.1 + time * 0.28);
  const pulse = 0.78 + Math.sin(time * 1.1 + seed * 12) * 0.22;
  return Math.max(0, (ribbon - 1.28) / 1.55) * pulse;
}

function drawFrame(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  particles: readonly Particle[],
  time: number,
  mode: EffectMode,
) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const scale = Math.min(width, height) * 0.42;
  const centerX = width / 2;
  const centerY = height / 2;
  const points = particles
    .map((particle) => ({ particle, rotated: rotateParticle(particle, time) }))
    .sort((a, b) => a.rotated.z - b.rotated.z);

  for (const { particle, rotated } of points) {
    const depth = (rotated.z + 1) / 2;
    const perspective = 0.9 + depth * 0.13;
    const x = centerX + rotated.x * scale * perspective;
    const y = centerY + rotated.y * scale * perspective;
    const erosion = erosionStrength(rotated.x, rotated.y, rotated.z, time, particle.seed);
    const flicker = 0.72 + Math.sin(time * 2.4 + particle.seed * 31) * 0.28;
    const hot = erosion > 0.2;

    context.beginPath();
    context.arc(x, y, hot ? 1.4 + erosion * 2.8 : 0.82 + depth * 0.54, 0, Math.PI * 2);
    if (mode === "dark") {
      const alpha = hot
        ? Math.min(0.98, (0.42 + erosion * 0.74) * flicker)
        : (0.3 + depth * 0.5) * (0.78 + particle.seed * 0.22);
      const lightness = hot ? 54 + erosion * 30 : 42 + depth * 10;
      context.fillStyle = `hsla(${hot ? 36 + erosion * 8 : 22 + particle.seed * 14}, 96%, ${lightness}%, ${alpha})`;
      context.shadowColor = hot ? "rgba(255, 174, 62, 0.9)" : "rgba(221, 74, 10, 0.26)";
      context.shadowBlur = hot ? 10 + erosion * 20 : 2.5;
    } else {
      context.fillStyle = `rgba(109, 42, 59, ${0.2 + depth * 0.62})`;
      context.shadowColor = "transparent";
      context.shadowBlur = 0;
    }
    context.fill();
  }

  context.shadowBlur = 0;
}

export default function RecursiveErosionBackground({
  mode = RECURSIVE_EROSION_DEFAULTS.mode,
  hue = RECURSIVE_EROSION_DEFAULTS.hue,
  saturation = RECURSIVE_EROSION_DEFAULTS.saturation,
  brightness = RECURSIVE_EROSION_DEFAULTS.brightness,
  className,
  style,
}: RecursiveErosionBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo(() => buildSphere(), []);
  const safeMode: EffectMode = mode === "light" ? "light" : "dark";
  const filter = `hue-rotate(${clamp(hue, -180, 180)}deg) saturate(${clamp(saturation, 0, 2)}) brightness(${clamp(brightness, 0.35, 1.65)})`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let startTime = performance.now();

    const render = (now: number) => {
      const time = reducedMotion.matches ? 5.5 : (now - startTime) / 1000;
      drawFrame(canvas, context, particles, time, safeMode);
      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(render);
    };
    const restart = () => {
      cancelAnimationFrame(animationFrame);
      startTime = performance.now();
      animationFrame = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(restart);
    resizeObserver.observe(canvas);
    reducedMotion.addEventListener("change", restart);
    restart();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", restart);
    };
  }, [particles, safeMode]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="A slowly rotating sphere formed from glowing amber particles."
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        background: "transparent",
        filter,
        ...style,
      }}
    />
  );
}
