/**
 * Generates the game's historical-style price series.
 *
 * These are synthetic series shaped from publicly known drawdown/recovery
 * magnitudes for each period (e.g. "S&P-style index fell ~57% peak-to-trough
 * in 2008"), NOT scraped or licensed market data. This keeps the project
 * original / IP-clean while still giving each scenario a recognizable shape.
 *
 * Run: npm run gen:scenarios (writes JSON into src/scenarios/)
 */
import fs from "fs";
import path from "path";
import type { Scenario, ScenarioTick, Asset } from "../src/types";

function mulberry32(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

interface ControlPoint {
  day: number;
  value: number;
}

function interpolateTrend(controlPoints: ControlPoint[], totalTicks: number): number[] {
  const values: number[] = [];
  for (let day = 0; day < totalTicks; day++) {
    let seg = controlPoints.length - 2;
    for (let i = 0; i < controlPoints.length - 1; i++) {
      if (day >= controlPoints[i].day && day <= controlPoints[i + 1].day) {
        seg = i;
        break;
      }
    }
    const a = controlPoints[seg];
    const b = controlPoints[seg + 1];
    const span = b.day - a.day || 1;
    let t = (day - a.day) / span;
    t = Math.max(0, Math.min(1, t));
    const smooth = t * t * (3 - 2 * t);
    values.push(a.value + (b.value - a.value) * smooth);
  }
  return values;
}

interface AssetDef extends Asset {
  startPrice: number;
  beta: number;
}

interface ScenarioDef {
  id: string;
  name: string;
  description: string;
  peakToTroughPct: number;
  totalTicks: number;
  labelPrefix: string;
  controlPoints: ControlPoint[];
  assets: AssetDef[];
  noiseAmplitude: number;
}

const scenarioDefs: ScenarioDef[] = [
  {
    id: "2008-financial-crisis",
    name: "2008 Financial Crisis",
    description:
      "A market path shaped after the 2007-2009 financial crisis: a slow top, a sharp collapse, a grinding bottom, then the first signs of recovery. Illustrative simulation, not sourced market data.",
    peakToTroughPct: -57,
    totalTicks: 26,
    labelPrefix: "Week",
    noiseAmplitude: 0.02,
    controlPoints: [
      { day: 0, value: 1.0 },
      { day: 4, value: 1.05 },
      { day: 10, value: 0.75 },
      { day: 18, value: 0.43 },
      { day: 22, value: 0.5 },
      { day: 25, value: 0.58 },
    ],
    assets: [
      { symbol: "OMX", name: "Oracle Market Index", startPrice: 1400, beta: 1.0 },
      { symbol: "NVTK", name: "Nova Tech Corp", startPrice: 85, beta: 1.3 },
      { symbol: "CNBK", name: "Continental Bank", startPrice: 52, beta: 1.85 },
      { symbol: "GLDH", name: "Golden Hedge Fund", startPrice: 120, beta: -0.3 },
    ],
  },
  {
    id: "dotcom-bubble",
    name: "Dot-com Bubble Crash",
    description:
      "A market path shaped after the 2000-2002 dot-com crash: a final euphoric run-up followed by a long, steep decline. Illustrative simulation, not sourced market data.",
    peakToTroughPct: -78,
    totalTicks: 28,
    labelPrefix: "Month",
    noiseAmplitude: 0.025,
    controlPoints: [
      { day: 0, value: 1.0 },
      { day: 3, value: 1.15 },
      { day: 12, value: 0.55 },
      { day: 22, value: 0.22 },
      { day: 27, value: 0.26 },
    ],
    assets: [
      { symbol: "OMX", name: "Oracle Market Index", startPrice: 2100, beta: 1.0 },
      { symbol: "CLKV", name: "ClickVerse Inc", startPrice: 64, beta: 2.1 },
      { symbol: "NVTK", name: "Nova Tech Corp", startPrice: 40, beta: 1.5 },
      { symbol: "STBD", name: "Steady Bond Trust", startPrice: 100, beta: -0.15 },
    ],
  },
  {
    id: "covid-crash",
    name: "COVID-19 Crash & Recovery",
    description:
      "A market path shaped after the Feb-Aug 2020 COVID crash: a fast ~34% drop over a few weeks followed by a sharp V-shaped recovery. Illustrative simulation, not sourced market data.",
    peakToTroughPct: -34,
    totalTicks: 24,
    labelPrefix: "Week",
    noiseAmplitude: 0.02,
    controlPoints: [
      { day: 0, value: 1.0 },
      { day: 2, value: 1.02 },
      { day: 6, value: 0.66 },
      { day: 10, value: 0.72 },
      { day: 16, value: 0.92 },
      { day: 23, value: 1.06 },
    ],
    assets: [
      { symbol: "OMX", name: "Oracle Market Index", startPrice: 3200, beta: 1.0 },
      { symbol: "SKYF", name: "SkyFleet Airlines", startPrice: 45, beta: 2.2 },
      { symbol: "CLKV", name: "ClickVerse Inc", startPrice: 210, beta: 1.6 },
      { symbol: "GLDH", name: "Golden Hedge Fund", startPrice: 135, beta: -0.2 },
    ],
  },
];

function buildScenario(def: ScenarioDef): Scenario {
  const trend = interpolateTrend(def.controlPoints, def.totalTicks);
  const ticks: ScenarioTick[] = [];

  const noiseState: Record<string, number> = {};
  const rng = mulberry32(hashSeed(def.id));
  for (const asset of def.assets) noiseState[asset.symbol] = 0;

  for (let day = 0; day < def.totalTicks; day++) {
    const trendFrac = trend[day];
    const deltaFromStart = trendFrac - 1;
    const prices: Record<string, number> = {};

    for (const asset of def.assets) {
      noiseState[asset.symbol] =
        noiseState[asset.symbol] * 0.7 + (rng() - 0.5) * def.noiseAmplitude;
      const assetFrac = 1 + asset.beta * deltaFromStart;
      const rawPrice = asset.startPrice * assetFrac * (1 + noiseState[asset.symbol]);
      const price = Math.max(rawPrice, asset.startPrice * 0.05);
      prices[asset.symbol] = Math.round(price * 100) / 100;
    }

    ticks.push({
      day,
      label: day === 0 ? "Start" : `${def.labelPrefix} ${day}`,
      prices,
    });
  }

  return {
    id: def.id,
    name: def.name,
    description: def.description,
    peakToTroughPct: def.peakToTroughPct,
    assets: def.assets.map(({ symbol, name }) => ({ symbol, name })),
    ticks,
  };
}

const outDir = path.join(__dirname, "..", "src", "scenarios");
fs.mkdirSync(outDir, { recursive: true });

for (const def of scenarioDefs) {
  const scenario = buildScenario(def);
  const outPath = path.join(outDir, `${def.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(scenario, null, 2));
  console.log(`Wrote ${outPath}`);
}
