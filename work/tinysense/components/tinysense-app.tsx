"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BrainCircuit,
  Check,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Gauge,
  RadioTower,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";

import { Slider } from "@/components/ui/slider";

type ScenarioKey = "healthy" | "drift" | "noise" | "process";

type Scenario = {
  label: string;
  shortLabel: string;
  health: number;
  anomaly: number;
  confidence: number;
  diagnosis: string;
  detail: string;
  domain: "Nominal" | "Sensor fault" | "Process anomaly";
  tone: "good" | "sensor" | "process";
};

const scenarios: Record<ScenarioKey, Scenario> = {
  healthy: {
    label: "Healthy",
    shortLabel: "NOMINAL",
    health: 96,
    anomaly: 4,
    confidence: 98,
    diagnosis: "Signal stable",
    detail: "Sensor and physical process are both within the learned envelope.",
    domain: "Nominal",
    tone: "good",
  },
  drift: {
    label: "Sensor Drift",
    shortLabel: "OFFSET DRIFT",
    health: 43,
    anomaly: 76,
    confidence: 93,
    diagnosis: "Sensor bias increasing",
    detail: "Slow baseline shift with unchanged process dynamics indicates a sensor fault.",
    domain: "Sensor fault",
    tone: "sensor",
  },
  noise: {
    label: "Sensor Noise",
    shortLabel: "EXCESS NOISE",
    health: 38,
    anomaly: 84,
    confidence: 95,
    diagnosis: "Signal noise elevated",
    detail: "High-frequency variance exceeds the sensor noise floor; process remains stable.",
    domain: "Sensor fault",
    tone: "sensor",
  },
  process: {
    label: "Process Anomaly",
    shortLabel: "PROCESS EVENT",
    health: 91,
    anomaly: 89,
    confidence: 91,
    diagnosis: "Process excursion detected",
    detail: "Sensor response is coherent and healthy; the measured physical process has changed.",
    domain: "Process anomaly",
    tone: "process",
  },
};

const models = [
  { key: "threshold", name: "Threshold Method", note: "Fixed rules", detection: 71, ram: 0.8, flash: 4, inference: 0.08, power: 0.2 },
  { key: "anomaly", name: "Lightweight Anomaly Model", note: "Feature distance", detection: 89, ram: 8, flash: 28, inference: 0.9, power: 1.1 },
  { key: "tiny-nn", name: "Tiny Neural Network", note: "2-layer classifier", detection: 95, ram: 32, flash: 116, inference: 3.8, power: 2.8 },
] as const;

const budget = { ram: 64, flash: 128, inference: 5, power: 4 };

function makeSeries(kind: ScenarioKey, phase: number) {
  return Array.from({ length: 72 }, (_, index) => {
    const x = index / 71;
    const baseline = 50 + Math.sin(index * 0.27 + phase) * 7 + Math.sin(index * 0.09) * 2;
    let value = baseline;
    if (kind === "drift") value += x * 26;
    if (kind === "noise") value += Math.sin(index * 2.8 + phase) * 11 + Math.sin(index * 4.7) * 4;
    if (kind === "process" && index > 43) value += Math.sin(((index - 43) / 28) * Math.PI) * 27;
    return Math.max(8, Math.min(92, value));
  });
}

function makePath(values: number[]) {
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * 600;
    const y = 172 - (value / 100) * 142;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function SignalChart({ scenario }: { scenario: ScenarioKey }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setPhase((value) => value + 0.12), 550);
    return () => window.clearInterval(timer);
  }, []);

  const values = useMemo(() => makeSeries(scenario, phase), [scenario, phase]);
  const path = makePath(values);
  const area = `${path} L600,172 L0,172 Z`;
  const current = values[values.length - 1];

  return (
    <div className="signal-chart" aria-label={`Animated synthetic signal: ${scenarios[scenario].label}`}>
      <div className="chart-meta">
        <div><span className="eyebrow">LIVE SYNTHETIC STREAM</span><strong>Temperature · CH-01</strong></div>
        <div className="current-reading"><span>{current.toFixed(1)}</span><small>°C</small></div>
      </div>
      <div className="chart-stage">
        <div className="chart-y-axis" aria-hidden="true"><span>90</span><span>50</span><span>10</span></div>
        <svg viewBox="0 0 600 180" role="img" aria-label="Synthetic time-series plot" preserveAspectRatio="none">
          <defs>
            <linearGradient id="signal-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--signal)" stopOpacity="0.3" /><stop offset="1" stopColor="var(--signal)" stopOpacity="0" /></linearGradient>
            <filter id="signal-glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <g className="grid-lines" aria-hidden="true">
            <line x1="0" y1="30" x2="600" y2="30" /><line x1="0" y1="101" x2="600" y2="101" /><line x1="0" y1="172" x2="600" y2="172" />
            {[100, 200, 300, 400, 500].map((x) => <line key={x} x1={x} y1="20" x2={x} y2="172" />)}
          </g>
          <path className="signal-area" d={area} /><path className="signal-line" d={path} pathLength="1" />
          <line className="scan-line" x1="585" y1="22" x2="585" y2="172" /><circle className="signal-dot" cx="600" cy={172 - (current / 100) * 142} r="4" />
        </svg>
        <div className="chart-time" aria-hidden="true"><span>−60s</span><span>−30s</span><span>NOW</span></div>
      </div>
    </div>
  );
}

function Shell({ children, page }: { children: React.ReactNode; page: "health" | "benchmark" }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="TinySense home"><span className="brand-mark"><Waves size={18} strokeWidth={2.4} /></span><span>TinySense</span><small>LAB / 01</small></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className={page === "health" ? "active" : ""} href="/"><Activity size={16} /> Sensor Health</Link>
          <Link className={page === "benchmark" ? "active" : ""} href="/benchmark"><Gauge size={16} /> TinyML Benchmark</Link>
        </nav>
        <div className="live-pill"><span /> SYNTHETIC MODE</div>
      </header>
      {children}
      <footer className="prototype-footer"><span>Independent Research Prototype — Synthetic Sensor Data &amp; Benchmark Results</span><span>No hardware · No deployment · No proprietary data</span></footer>
    </div>
  );
}

function MetricCard({ label, value, suffix = "%", barTone = "cyan" }: { label: string; value: number; suffix?: string; barTone?: string }) {
  return <div className="metric-card"><span>{label}</span><strong>{value}<small>{suffix}</small></strong><div className={`metric-bar ${barTone}`}><i style={{ width: `${value}%` }} /></div></div>;
}

function HealthPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("healthy");
  const current = scenarios[scenario];

  return (
    <Shell page="health">
      <main className={`workspace health-page tone-${current.tone}`}>
        <section className="page-intro"><div><span className="section-index">01 / SENSOR HEALTH</span><h1>Separate bad sensors from bad processes.</h1></div><p>Explore how a tiny edge classifier responds to four generated signal conditions.</p></section>
        <div className="scenario-row" role="group" aria-label="Choose signal scenario">
          {(Object.keys(scenarios) as ScenarioKey[]).map((key, index) => <button key={key} className={scenario === key ? "active" : ""} onClick={() => setScenario(key)} aria-pressed={scenario === key}><span>0{index + 1}</span>{scenarios[key].label}</button>)}
        </div>
        <section className="health-grid">
          <SignalChart scenario={scenario} />
          <aside className="diagnosis-panel">
            <div className="panel-kicker"><Sparkles size={15} /> EDGE INFERENCE</div>
            <div className={`classification-chip ${current.tone}`}><span />{current.shortLabel}</div>
            <h2>{current.diagnosis}</h2><p>{current.detail}</p>
            <div className="fault-split">
              <div className={current.domain === "Sensor fault" ? "active sensor" : ""}><RadioTower size={18} /><span>Sensor</span><strong>{current.domain === "Sensor fault" ? "FAULT" : "HEALTHY"}</strong></div>
              <ChevronRight size={16} className="split-arrow" />
              <div className={current.domain === "Process anomaly" ? "active process" : ""}><CircuitBoard size={18} /><span>Process</span><strong>{current.domain === "Process anomaly" ? "ANOMALY" : "NOMINAL"}</strong></div>
            </div>
            <div className="confidence-row"><span>Classification confidence</span><strong>{current.confidence}%</strong></div>
          </aside>
        </section>
        <section className="metric-grid" aria-label="Scenario metrics">
          <MetricCard label="Health Score" value={current.health} barTone={current.health > 70 ? "green" : "red"} />
          <MetricCard label="Anomaly Score" value={current.anomaly} barTone={current.anomaly > 60 ? (current.tone === "process" ? "amber" : "red") : "cyan"} />
          <div className="metric-card text-metric"><span>Diagnosis</span><strong>{current.domain}</strong><small>CLASSIFICATION</small></div>
          <MetricCard label="Confidence" value={current.confidence} barTone="purple" />
        </section>
        <section className="pipeline-card">
          <div className="pipeline-heading"><span className="eyebrow">ON-DEVICE PIPELINE</span><small>4-stage simulated inference</small></div>
          <div className="pipeline">
            <div><span><RadioTower size={20} /></span><small>01</small><strong>Sensor</strong><em>64 Hz stream</em></div><i><ChevronRight /></i>
            <div><span><SlidersHorizontal size={20} /></span><small>02</small><strong>Features</strong><em>RMS · slope · variance</em></div><i><ChevronRight /></i>
            <div><span><BrainCircuit size={20} /></span><small>03</small><strong>TinyML</strong><em>Edge inference</em></div><i><ChevronRight /></i>
            <div className="pipeline-result"><span><ShieldCheck size={20} /></span><small>04</small><strong>Health Classification</strong><em>{current.shortLabel}</em></div>
          </div>
        </section>
      </main>
    </Shell>
  );
}

function ResourceGauge({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const percent = Math.min(100, (value / max) * 100);
  return <div className="resource-gauge"><div><span>{label}</span><strong>{value}{unit}</strong></div><div className="resource-track"><i style={{ width: `${percent}%` }} /></div></div>;
}

function BenchmarkPage() {
  const [preference, setPreference] = useState([56]);
  const value = preference[0];
  const recommended = value < 30 ? "threshold" : value > 76 ? "tiny-nn" : "anomaly";
  const recommendedModel = models.find((model) => model.key === recommended)!;

  return (
    <Shell page="benchmark">
      <main className="workspace benchmark-page">
        <section className="page-intro benchmark-intro"><div><span className="section-index">02 / TINYML BENCHMARK</span><h1>Find the smallest model that does enough.</h1></div><p>Compare three fictional approaches against a constrained Cortex-M target.</p></section>
        <section className="preference-card">
          <div className="preference-copy"><span className="eyebrow"><SlidersHorizontal size={14} /> DESIGN PRIORITY</span><h2>Accuracy <span>↔</span> Efficiency</h2></div>
          <div className="slider-wrap"><div className="slider-labels"><span>MAX EFFICIENCY</span><strong>{value}% accuracy bias</strong><span>MAX ACCURACY</span></div><Slider value={preference} onValueChange={setPreference} max={100} step={1} aria-label="Accuracy to efficiency preference" /></div>
          <div className="recommendation"><span>RECOMMENDED</span><strong>{recommendedModel.name}</strong></div>
        </section>
        <section className="benchmark-table-wrap">
          <div className="benchmark-table-head"><div><span className="eyebrow">SYNTHETIC COMPARISON</span><h2>Model performance</h2></div><span className="sample-note">N = 10,000 generated windows</span></div>
          <div className="benchmark-table" role="table" aria-label="Synthetic TinyML benchmark comparison">
            <div className="table-row table-header" role="row"><span role="columnheader">METHOD</span><span role="columnheader">DETECTION</span><span role="columnheader">RAM</span><span role="columnheader">FLASH</span><span role="columnheader">INFERENCE</span><span role="columnheader">POWER</span><span role="columnheader">BUDGET</span></div>
            {models.map((model, index) => {
              const fits = model.ram <= budget.ram && model.flash <= budget.flash && model.inference <= budget.inference && model.power <= budget.power;
              return <div className={`table-row ${recommended === model.key ? "recommended-row" : ""}`} role="row" key={model.key}>
                <div className="method-cell" role="cell"><i>0{index + 1}</i><span><strong>{model.name}</strong><small>{model.note}</small></span>{recommended === model.key && <em>BEST MATCH</em>}</div>
                <div className="detection-cell" role="cell"><strong>{model.detection}%</strong><div><i style={{ width: `${model.detection}%` }} /></div></div>
                <span role="cell">{model.ram} KB</span><span role="cell">{model.flash} KB</span><span role="cell">{model.inference} ms</span><span role="cell">{model.power} mW</span>
                <span className={`fit-badge ${fits ? "fits" : "over"}`} role="cell">{fits && <Check size={13} />}{fits ? "FITS" : "OVER"}</span>
              </div>;
            })}
          </div>
        </section>
        <section className="budget-section">
          <div className="budget-copy"><span className="budget-icon"><Cpu size={22} /></span><div><span className="eyebrow">FICTIONAL RESOURCE BUDGET</span><h2>ARM Cortex-M class target</h2></div><p>Resource ceilings used only for this synthetic lab comparison.</p></div>
          <div className="budget-gauges"><ResourceGauge label="RAM" value={budget.ram} max={budget.ram} unit=" KB" /><ResourceGauge label="FLASH" value={budget.flash} max={budget.flash} unit=" KB" /><ResourceGauge label="LATENCY" value={budget.inference} max={budget.inference} unit=" ms" /><ResourceGauge label="POWER" value={budget.power} max={budget.power} unit=" mW" /></div>
        </section>
        <div className="synthetic-notice"><Zap size={17} /><p><strong>Simulation only.</strong> No real MCU deployment, TensorFlow Lite runtime, hardware measurement, or Syntronic data is used.</p></div>
      </main>
    </Shell>
  );
}

export default function TinySenseApp({ page }: { page: "health" | "benchmark" }) {
  return page === "health" ? <HealthPage /> : <BenchmarkPage />;
}
