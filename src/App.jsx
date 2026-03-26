import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, ComposedChart, Scatter, Treemap } from "recharts";
import * as d3 from "d3";

// ─── DESIGN TOKENS ───
const T = {
  bg: "#0a0e17", bgCard: "#111827", bgCardHover: "#1a2332",
  bgElevated: "#151d2e", border: "#1e293b", borderActive: "#334155",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b",
  accent: "#06d6a0", accentDim: "#06d6a033", accentGlow: "#06d6a066",
  blue: "#3b82f6", blueDim: "#3b82f633",
  purple: "#a78bfa", purpleDim: "#a78bfa33",
  amber: "#f59e0b", amberDim: "#f59e0b33",
  rose: "#f43f5e", roseDim: "#f43f5e33",
  cyan: "#22d3ee", cyanDim: "#22d3ee33",
  teal: "#14b8a6", lime: "#84cc16", pink: "#ec4899",
  emerald: "#10b981", indigo: "#6366f1", orange: "#f97316",
};
const glow = (color, spread = 20) => `0 0 ${spread}px ${color}33, 0 0 ${spread * 2}px ${color}11`;

// ─── PATENT CLAIM REFERENCES (Expanded v2.0) ───
const PATENT_CLAIMS = {
  CBFE: { claim: "Claim 4", title: "Cross-Device Identity Resolution", desc: "Behavioral fingerprinting via Siamese neural network using scroll velocity, click-to-dwell ratios, navigation topology, and temporal usage patterns for probabilistic identity linkage." },
  PPIE: { claim: "Claim 1 (partial)", title: "Temporal Intent Decay Modeling", desc: "Transformer-based sequence model with learned category-specific decay curves and contextual gating for next-purchase prediction." },
  IACE: { claim: "Claim 2", title: "AR Commerce with Bidirectional Telemetry", desc: "Closed-loop behavioral telemetry capturing dwell time, rotation, micro-expressions, and screenshot events during AR sessions." },
  SSDFE: { claim: "Claim 3", title: "Preemptive Inventory via Sentiment Analysis", desc: "Viral Velocity Prediction Model detecting demand signals 72 hours before peak via multi-modal sentiment analysis." },
  ASCOE: { claim: "Claim 5", title: "Multi-Horizon RL Supply Chain Orchestration", desc: "Reinforcement learning agent simultaneously optimizing immediate fulfillment, tactical rebalancing, and strategic procurement." },
  UCIG: { claim: "Claim 1", title: "Unified Consumer Intent Graph", desc: "Temporal heterogeneous knowledge graph integrating all subsystem signals with confidence scores and temporal decay weights." },
  AGENTIC: { claim: "Claim 13", title: "Autonomous Shopping Agent Orchestration", desc: "Proactive AI agents that anticipate needs, execute transactions, recover carts, and manage subscriptions via UCIG traversal." },
  MEMORY: { claim: "Claim 14", title: "Long-Term Memory & Reflection Layer", desc: "Three-stage memory system (retain, recall, reflect) enabling persistent context across sessions with episodic and semantic memory stores." },
  VOICE: { claim: "Claim 15", title: "Voice & Conversational Commerce Engine", desc: "Ambient voice-enabled shopping with tone sentiment analysis, natural language UCIG traversal, and multi-modal intent fusion." },
  SUSTAIN: { claim: "Claim 16", title: "Sustainability Intelligence Engine", desc: "Eco-metric node types in UCIG with carbon-aware supply chain optimization and green decay curve weighting." },
  IOT: { claim: "Claim 17", title: "Physical Store IoT Fusion", desc: "Digital-physical signal blending via beacons, smart cameras, and in-store dwell sensors feeding real-time UCIG updates." },
  PRIVACY: { claim: "Claim 18", title: "AI-Driven Adaptive Consent Management", desc: "Dynamic epsilon adjustment, predictive consent preferences, and explainable data flow visualization for regulatory compliance." },
  MULTIMODAL: { claim: "Claim 19", title: "Multimodal Visual Commerce Engine", desc: "Combined image-text-video processing for visual search, 3D body modeling, and wardrobe-aware virtual try-on." },
};

// ─── SEEDED RANDOM ───
function seededRandom(seed) {
  let s = Math.max(1, Math.abs(seed || 1));
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ─── VALIDATED DATA GENERATORS ───
const genTimeSeries = (points, base, variance, trend = 0, seed = null) => {
  const safePoints = Math.max(1, Math.min(Math.round(points), 1000));
  const safeBase = Number.isFinite(base) ? base : 0;
  const safeVariance = Number.isFinite(variance) ? Math.abs(variance) : 0;
  const safeTrend = Number.isFinite(trend) ? trend : 0;
  const rng = seed !== null ? seededRandom(seed) : Math.random;
  return Array.from({ length: safePoints }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    value: Math.max(0, safeBase + safeTrend * i + (rng() - 0.4) * safeVariance),
  }));
};

const genDeviceData = () => [
  { device: "Mobile", sessions: 4280, conversion: 3.8, revenue: 162400, share: 0.48 },
  { device: "Desktop", sessions: 2940, conversion: 5.2, revenue: 228300, share: 0.33 },
  { device: "Tablet", sessions: 890, conversion: 4.1, revenue: 54700, share: 0.10 },
  { device: "Smart TV", sessions: 420, conversion: 2.3, revenue: 18900, share: 0.05 },
  { device: "Smart Speaker", sessions: 360, conversion: 1.9, revenue: 12800, share: 0.04 },
];

const genProducts = () => [
  { id: 1, name: "Arc'teryx Beta LT Jacket", category: "Outerwear", price: 399, predicted: 92, sentiment: 0.87, stock: 342, demand: 480, arTryOns: 1840, ecoScore: 78, carbonKg: 12.4, img: "🧥" },
  { id: 2, name: "Nike Air Max DN", category: "Footwear", price: 160, predicted: 88, sentiment: 0.91, stock: 1200, demand: 1680, arTryOns: 4200, ecoScore: 64, carbonKg: 8.2, img: "👟" },
  { id: 3, name: "Dyson Airwrap Complete", category: "Beauty Tech", price: 599, predicted: 85, sentiment: 0.79, stock: 890, demand: 720, arTryOns: 960, ecoScore: 52, carbonKg: 22.1, img: "💇" },
  { id: 4, name: "Sony WH-1000XM6", category: "Electronics", price: 349, predicted: 94, sentiment: 0.93, stock: 560, demand: 1120, arTryOns: 320, ecoScore: 71, carbonKg: 5.8, img: "🎧" },
  { id: 5, name: "Lululemon Align Leggings", category: "Athleisure", price: 98, predicted: 90, sentiment: 0.88, stock: 2400, demand: 3100, arTryOns: 5600, ecoScore: 82, carbonKg: 3.1, img: "👖" },
  { id: 6, name: "Apple Watch Ultra 3", category: "Wearables", price: 799, predicted: 82, sentiment: 0.84, stock: 180, demand: 640, arTryOns: 1100, ecoScore: 58, carbonKg: 18.9, img: "⌚" },
  { id: 7, name: "Patagonia Nano Puff", category: "Outerwear", price: 229, predicted: 86, sentiment: 0.82, stock: 750, demand: 890, arTryOns: 2300, ecoScore: 94, carbonKg: 4.2, img: "🧥" },
  { id: 8, name: "Oura Ring Gen 4", category: "Wearables", price: 349, predicted: 79, sentiment: 0.76, stock: 420, demand: 380, arTryOns: 680, ecoScore: 68, carbonKg: 2.8, img: "💍" },
];

const genSentimentData = () => [
  { platform: "TikTok", mentions: 48200, sentiment: 0.82, velocity: 94, trend: "up" },
  { platform: "Instagram", mentions: 31400, sentiment: 0.78, velocity: 67, trend: "up" },
  { platform: "X/Twitter", mentions: 22800, sentiment: 0.61, velocity: 45, trend: "stable" },
  { platform: "Reddit", mentions: 18600, sentiment: 0.73, velocity: 72, trend: "up" },
  { platform: "YouTube", mentions: 12400, sentiment: 0.85, velocity: 58, trend: "stable" },
  { platform: "Pinterest", mentions: 9800, sentiment: 0.89, velocity: 38, trend: "down" },
];

const genSupplyChainNodes = () => [
  { id: "WH-East", name: "East Coast Hub", type: "warehouse", capacity: 85, throughput: 12400, lat: 40.7, lng: -74 },
  { id: "WH-West", name: "West Coast Hub", type: "warehouse", capacity: 72, throughput: 9800, lat: 34.05, lng: -118.2 },
  { id: "WH-Central", name: "Central Hub", type: "warehouse", capacity: 91, throughput: 8200, lat: 41.8, lng: -87.6 },
  { id: "FF-SE", name: "Southeast Micro", type: "fulfillment", capacity: 68, throughput: 3400, lat: 33.7, lng: -84.4 },
  { id: "FF-NW", name: "Northwest Micro", type: "fulfillment", capacity: 54, throughput: 2100, lat: 47.6, lng: -122.3 },
  { id: "FF-SW", name: "Southwest Micro", type: "fulfillment", capacity: 79, throughput: 4600, lat: 33.4, lng: -112 },
];

const genConsumerProfiles = () => [
  { id: "USR-7829", name: "Consumer A", devices: 4, intentScore: 0.92, ltv: 2840, segment: "High-Value Explorer", topCategories: ["Outerwear", "Footwear", "Electronics"], memoryDepth: 142, voiceInteractions: 38 },
  { id: "USR-3041", name: "Consumer B", devices: 3, intentScore: 0.78, ltv: 1260, segment: "Trend Follower", topCategories: ["Athleisure", "Beauty Tech", "Wearables"], memoryDepth: 87, voiceInteractions: 12 },
  { id: "USR-5518", name: "Consumer C", devices: 5, intentScore: 0.85, ltv: 4120, segment: "Premium Loyalist", topCategories: ["Electronics", "Wearables", "Outerwear"], memoryDepth: 234, voiceInteractions: 56 },
  { id: "USR-9203", name: "Consumer D", devices: 2, intentScore: 0.64, ltv: 680, segment: "Casual Browser", topCategories: ["Footwear", "Athleisure"], memoryDepth: 31, voiceInteractions: 4 },
];

// ─── INPUT SANITIZER ───
const sanitize = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[<>"'&]/g, c => ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" }[c]));
};

// ─── RESPONSIVE HOOK ───
const useResponsive = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return { isMobile: width < 768, isTablet: width < 1024, width };
};

// ─── SHARED COMPONENTS ───
const StatCard = ({ label, value, change, icon, color = T.accent, sub }) => (
  <div role="region" aria-label={`${label}: ${value}`} style={{
    background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
    padding: "20px 24px", flex: 1, minWidth: 180, transition: "all 0.3s", cursor: "default",
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = glow(color, 15); }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</span>
      <span role="img" aria-hidden="true" style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -1 }}>{value}</div>
    {change !== undefined && (
      <div style={{ fontSize: 12, marginTop: 6, color: change >= 0 ? T.accent : T.rose, fontWeight: 600 }}>
        {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% {sub || "vs last period"}
      </div>
    )}
  </div>
);

const MiniBar = ({ value, max = 100, color = T.accent, height = 6 }) => {
  const safeVal = Math.max(0, Math.min(Number(value) || 0, max));
  return (
    <div role="progressbar" aria-valuenow={safeVal} aria-valuemin={0} aria-valuemax={max} style={{ width: "100%", height, background: `${color}15`, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${(safeVal / max) * 100}%`, height: "100%", borderRadius: height / 2, background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 1s ease" }} />
    </div>
  );
};

const Badge = ({ children, color = T.accent }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: `${color}18`, color, fontSize: 11, fontWeight: 600, letterSpacing: 0.4 }}>{children}</span>
);

const PatentBadge = ({ subsystem }) => {
  const [show, setShow] = useState(false);
  const info = PATENT_CLAIMS[subsystem];
  if (!info) return null;
  return (
    <span style={{ position: "relative", display: "inline-block" }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: `${T.accent}12`, color: T.accent, fontSize: 10, fontWeight: 600, cursor: "help", border: `1px solid ${T.accent}25`, letterSpacing: 0.3 }}>
        <span style={{ fontSize: 11 }}>📜</span> {info.claim}
      </span>
      {show && (
        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", width: 320, padding: "14px 18px", borderRadius: 10, zIndex: 100, background: T.bgElevated, border: `1px solid ${T.accent}30`, boxShadow: `0 8px 32px rgba(0,0,0,0.5)`, animation: "fadeIn 0.2s ease" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 4 }}>{info.title}</div>
          <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{info.desc}</div>
          <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 10, height: 10, background: T.bgElevated, borderRight: `1px solid ${T.accent}30`, borderBottom: `1px solid ${T.accent}30` }} />
        </div>
      )}
    </span>
  );
};

const SectionHeader = ({ title, subtitle, action, subsystem }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", gap: 8 }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0, letterSpacing: -0.5 }}>{title}</h2>
        {subsystem && <PatentBadge subsystem={subsystem} />}
      </div>
      {subtitle && <p style={{ fontSize: 13, color: T.textMuted, margin: "6px 0 0", letterSpacing: 0.2 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Skeleton = ({ height = 200, text = "Loading data..." }) => (
  <div style={{ height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, animation: "skeletonPulse 1.5s ease infinite" }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
    <div style={{ fontSize: 12, color: T.textDim }}>{text}</div>
  </div>
);

const ChartCard = ({ title, children, span = 1, height = 280, info }) => (
  <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 24px", gridColumn: `span ${span}` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, letterSpacing: 0.3, textTransform: "uppercase" }}>{title}</div>
      {info && <span title={info} style={{ fontSize: 14, cursor: "help", opacity: 0.5 }}>ℹ️</span>}
    </div>
    <div style={{ height }}>{children}</div>
  </div>
);

const Pulse = ({ color = T.accent, size = 8 }) => (
  <span aria-hidden="true" style={{ position: "relative", display: "inline-block", width: size, height: size, marginRight: 8 }}>
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "pulse 2s infinite" }} />
    <span style={{ position: "absolute", inset: -2, borderRadius: "50%", border: `1px solid ${color}`, opacity: 0.4, animation: "pulse 2s infinite 0.3s" }} />
  </span>
);

const NavSection = ({ label }) => (
  <div style={{ padding: "12px 14px 4px", fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
);

// ─── SUBSYSTEM VIEWS ───

const DashboardOverview = ({ setActiveView, isMobile }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 4000); return () => clearInterval(iv); }, []);
  const revenueData = useMemo(() => genTimeSeries(24, 42000, 12000, 800, tick + 42), [tick]);
  const conversionData = useMemo(() => genTimeSeries(24, 3.8, 1.2, 0.05, tick + 99), [tick]);
  const [chartsReady, setChartsReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setChartsReady(true), 400); return () => clearTimeout(t); }, []);

  const coreSubsystems = [
    { key: "cbfe", name: "Cross-Device Fusion", accuracy: "97.3%", color: T.blue, icon: "📱", patent: "CBFE" },
    { key: "ppie", name: "Predictive Purchase", accuracy: "94.1%", color: T.accent, icon: "🎯", patent: "PPIE" },
    { key: "iace", name: "AR Commerce", accuracy: "89.7%", color: T.purple, icon: "👓", patent: "IACE" },
    { key: "ssdfe", name: "Social Sentiment", accuracy: "91.2%", color: T.amber, icon: "📊", patent: "SSDFE" },
    { key: "ascoe", name: "Supply Chain AI", accuracy: "96.8%", color: T.cyan, icon: "🔗", patent: "ASCOE" },
    { key: "ucig", name: "Intent Graph", accuracy: "98.1%", color: T.rose, icon: "🧠", patent: "UCIG" },
  ];
  const v2Subsystems = [
    { key: "agentic", name: "Agentic AI", accuracy: "91.4%", color: T.lime, icon: "🤖", patent: "AGENTIC" },
    { key: "memory", name: "Memory Layer", accuracy: "96.2%", color: T.indigo, icon: "💾", patent: "MEMORY" },
    { key: "voice", name: "Voice Commerce", accuracy: "88.9%", color: T.pink, icon: "🎙️", patent: "VOICE" },
    { key: "sustain", name: "Sustainability", accuracy: "93.5%", color: T.emerald, icon: "🌱", patent: "SUSTAIN" },
    { key: "iot", name: "IoT Omnichannel", accuracy: "90.1%", color: T.orange, icon: "📡", patent: "IOT" },
    { key: "privacy", name: "Privacy Console", accuracy: "99.2%", color: T.teal, icon: "🛡️", patent: "PRIVACY" },
    { key: "multimodal", name: "Multimodal AR", accuracy: "87.6%", color: T.rose, icon: "🔍", patent: "MULTIMODAL" },
  ];

  const SubCard = ({ s }) => (
    <div role="button" tabIndex={0} aria-label={`${s.name}: accuracy ${s.accuracy}. Click to view.`}
      onClick={() => setActiveView(s.key)} onKeyDown={e => e.key === "Enter" && setActiveView(s.key)}
      style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", cursor: "pointer", transition: "all 0.3s", outline: "none" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = glow(s.color); }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
      onFocus={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = glow(s.color); }}
      onBlur={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span aria-hidden="true" style={{ fontSize: 20 }}>{s.icon}</span>
        <div style={{ display: "flex", alignItems: "center" }}><Pulse color={T.accent} /><span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>Active</span></div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{s.name}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: T.textMuted }}>Accuracy: {s.accuracy}</span>
        <PatentBadge subsystem={s.patent} />
      </div>
      <MiniBar value={parseFloat(s.accuracy)} color={s.color} />
    </div>
  );

  return (
    <div>
      <SectionHeader title="Platform Command Center" subtitle="Real-time overview of all 13 OmniSense AI subsystems — data refreshes every 4s" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Hourly Revenue" value="$487.2K" change={12.4} icon="💰" color={T.accent} />
        <StatCard label="Active Users" value="284,910" change={8.7} icon="👥" color={T.blue} />
        <StatCard label="Conversion Rate" value="4.82%" change={0.34} icon="📈" color={T.purple} sub="pts vs baseline" />
        <StatCard label="AI Agents Active" value="12,840" change={34.2} icon="🤖" color={T.lime} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {chartsReady ? (<>
          <ChartCard title="Revenue Stream — Last 24h" height={220} info="Live revenue data. Powered by PPIE + Agentic AI.">
            <ResponsiveContainer><AreaChart data={revenueData}>
              <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.3} /><stop offset="100%" stopColor={T.accent} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} />
              <YAxis stroke={T.textDim} fontSize={10} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={v => [`$${v.toFixed(0)}`, "Revenue"]} />
              <Area type="monotone" dataKey="value" stroke={T.accent} fill="url(#revGrad)" strokeWidth={2} animationDuration={800} />
            </AreaChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Conversion Trend — Last 24h" height={220}>
            <ResponsiveContainer><AreaChart data={conversionData}>
              <defs><linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.blue} stopOpacity={0.3} /><stop offset="100%" stopColor={T.blue} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} />
              <YAxis stroke={T.textDim} fontSize={10} tickFormatter={v => `${v.toFixed(1)}%`} />
              <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={v => [`${v.toFixed(2)}%`, "CVR"]} />
              <Area type="monotone" dataKey="value" stroke={T.blue} fill="url(#convGrad)" strokeWidth={2} animationDuration={800} />
            </AreaChart></ResponsiveContainer>
          </ChartCard>
        </>) : (<><Skeleton height={272} text="Loading revenue chart..." /><Skeleton height={272} text="Loading conversion chart..." /></>)}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, marginBottom: 14, letterSpacing: 0.3, textTransform: "uppercase" }}>Core Subsystems</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {coreSubsystems.map(s => <SubCard key={s.key} s={s} />)}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.lime, marginBottom: 14, letterSpacing: 0.3, textTransform: "uppercase" }}>v2 Innovations</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
        {v2Subsystems.map(s => <SubCard key={s.key} s={s} />)}
      </div>
    </div>
  );
};

const CrossDeviceView = ({ isMobile }) => {
  const devices = genDeviceData();
  const identityData = useMemo(() => genTimeSeries(24, 94, 4, 0.12), []);
  const radarData = [{ metric: "Scroll Velocity", A: 88, B: 72 }, { metric: "Click Patterns", A: 92, B: 85 }, { metric: "Dwell Time", A: 78, B: 91 }, { metric: "Nav Topology", A: 95, B: 68 }, { metric: "Search Syntax", A: 84, B: 77 }, { metric: "Temporal", A: 90, B: 82 }];
  return (
    <div>
      <SectionHeader title="Cross-Device Behavioral Fusion Engine" subtitle="Subsystem A — Probabilistic identity resolution across 5 device categories" subsystem="CBFE" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Resolved Identities" value="1.84M" change={4.2} icon="🔗" color={T.blue} />
        <StatCard label="Resolution Accuracy" value="97.3%" change={0.8} icon="🎯" color={T.accent} />
        <StatCard label="Cross-Device Sessions" value="8,890" change={11.3} icon="📱" color={T.purple} />
        <StatCard label="Avg Devices/User" value="3.4" change={0.2} icon="🔢" color={T.cyan} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Identity Resolution Confidence — 24h" height={240} info="Siamese neural network confidence score (Claim 4).">
          <ResponsiveContainer><AreaChart data={identityData}>
            <defs><linearGradient id="idGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.blue} stopOpacity={0.3} /><stop offset="100%" stopColor={T.blue} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} domain={[85, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={v => [`${v.toFixed(1)}%`, "Confidence"]} />
            <Area type="monotone" dataKey="value" stroke={T.blue} fill="url(#idGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Behavioral Fingerprint Comparison" height={240}>
          <ResponsiveContainer><RadarChart data={radarData}>
            <PolarGrid stroke={T.border} /><PolarAngleAxis dataKey="metric" tick={{ fill: T.textMuted, fontSize: 10 }} /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Profile A" dataKey="A" stroke={T.blue} fill={T.blue} fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Profile B" dataKey="B" stroke={T.purple} fill={T.purple} fillOpacity={0.15} strokeWidth={2} />
            <Legend wrapperStyle={{ fontSize: 11, color: T.textMuted }} />
          </RadarChart></ResponsiveContainer>
        </ChartCard>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>Device Breakdown</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Device", "Sessions", "Conv. Rate", "Revenue", "Share"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>))}</tr></thead>
            <tbody>{devices.map((d, i) => (
              <tr key={d.device} style={{ borderBottom: i < devices.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px", color: T.text, fontWeight: 600, fontSize: 14 }}>{d.device}</td>
                <td style={{ padding: "14px 22px", color: T.textMuted, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{d.sessions.toLocaleString()}</td>
                <td style={{ padding: "14px 22px" }}><Badge color={d.conversion > 4 ? T.accent : T.amber}>{d.conversion}%</Badge></td>
                <td style={{ padding: "14px 22px", color: T.text, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>${d.revenue.toLocaleString()}</td>
                <td style={{ padding: "14px 22px", width: 180 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><MiniBar value={d.share * 100} color={T.blue} /><span style={{ fontSize: 11, color: T.textMuted, minWidth: 30 }}>{(d.share * 100).toFixed(0)}%</span></div></td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PredictiveView = ({ isMobile }) => {
  const products = genProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const decayData = useMemo(() => ["Outerwear", "Footwear", "Electronics"].map(cat => ({ name: cat, data: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, probability: cat === "Outerwear" ? 90 * Math.exp(-i * 0.08) : cat === "Footwear" ? 85 * Math.exp(-i * 0.12) : 95 * Math.exp(-i * 0.05) })) })), []);
  return (
    <div>
      <SectionHeader title="Predictive Purchase Intelligence Engine" subtitle="Subsystem B — Temporal intent decay modeling with transformer ensemble" subsystem="PPIE" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Next-Purchase Accuracy" value="94.1%" change={2.1} icon="🎯" color={T.accent} />
        <StatCard label="Predictions/Hour" value="342K" change={14.6} icon="⚡" color={T.amber} />
        <StatCard label="Avg Lead Time" value="4.2 days" change={-8.3} icon="⏱️" color={T.blue} sub="faster prediction" />
        <StatCard label="Revenue Lift" value="+34%" change={34} icon="📈" color={T.accent} sub="vs baseline" />
      </div>
      <ChartCard title="Category-Specific Intent Decay Curves" height={280} info="Claim 6: Learned category-specific intent decay functions.">
        <ResponsiveContainer><LineChart>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
          <XAxis dataKey="day" type="number" domain={[1, 30]} stroke={T.textDim} fontSize={10} label={{ value: "Days Since Intent Signal", position: "insideBottom", offset: -5, fill: T.textDim, fontSize: 10 }} />
          <YAxis stroke={T.textDim} fontSize={10} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={v => [`${v.toFixed(1)}%`]} />
          {decayData.map((cat, i) => (<Line key={cat.name} data={cat.data} dataKey="probability" name={cat.name} stroke={[T.accent, T.blue, T.purple][i]} strokeWidth={2} dot={false} />))}
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </LineChart></ResponsiveContainer>
      </ChartCard>
      <div style={{ marginTop: 24, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Top Predicted Purchases — Next 48h</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Product", "Category", "Price", "Prediction Score", "Current Demand"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{[...products].sort((a, b) => b.predicted - a.predicted).map((p, i) => (
              <tr key={p.id} onClick={() => setSelectedProduct(p.id === selectedProduct ? null : p.id)} style={{ borderBottom: i < products.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer", background: selectedProduct === p.id ? `${T.accent}08` : "transparent", transition: "background 0.2s" }}>
                <td style={{ padding: "14px 22px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span aria-hidden="true" style={{ fontSize: 20 }}>{p.img}</span><span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{p.name}</span></div></td>
                <td style={{ padding: "14px 22px" }}><Badge color={T.blue}>{p.category}</Badge></td>
                <td style={{ padding: "14px 22px", color: T.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>${p.price}</td>
                <td style={{ padding: "14px 22px", width: 200 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><MiniBar value={p.predicted} color={p.predicted > 90 ? T.accent : p.predicted > 85 ? T.blue : T.amber} /><span style={{ fontSize: 13, fontWeight: 700, color: p.predicted > 90 ? T.accent : T.text, fontFamily: "'JetBrains Mono', monospace" }}>{p.predicted}%</span></div></td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: p.demand > p.stock ? T.rose : T.accent }}>{p.demand.toLocaleString()} {p.demand > p.stock ? "⚠️" : "✓"}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ARCommerceView = ({ isMobile }) => {
  const products = genProducts();
  const telemetryData = [
    { metric: "Avg Dwell Time", value: "34.2s", change: 12, info: "Duration viewing product in AR" },
    { metric: "Rotation Events/Session", value: "8.4", change: 6, info: "How users rotate AR models" },
    { metric: "Positive Expression Rate", value: "73%", change: 4, info: "CNN micro-expression detection" },
    { metric: "Screenshot Rate", value: "18.2%", change: 22, info: "4.2x conversion vs non-screenshot" },
  ];
  const arFunnelData = [
    { stage: "AR Launch", users: 100000, color: T.blue }, { stage: "Product Load", users: 87000, color: T.blue },
    { stage: "Try-On Start", users: 64000, color: T.purple }, { stage: "Color Switch", users: 48000, color: T.purple },
    { stage: "Screenshot", users: 18200, color: T.accent }, { stage: "Add to Cart", users: 14800, color: T.accent },
    { stage: "Purchase", users: 8900, color: T.amber },
  ];
  return (
    <div>
      <SectionHeader title="Immersive AR Commerce Engine" subtitle="Subsystem C — Bidirectional telemetry loop with behavioral preference encoding" subsystem="IACE" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="AR Sessions Today" value="64,200" change={18.4} icon="👓" color={T.purple} />
        <StatCard label="CTR Lift (AR Loop)" value="+41%" change={41} icon="📈" color={T.accent} sub="vs no-feedback AR" />
        <StatCard label="Conv. Rate (AR)" value="8.9%" change={28} icon="🎯" color={T.blue} sub="vs standard browse" />
        <StatCard label="Telemetry Signals/s" value="2.4M" change={8.1} icon="📡" color={T.cyan} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="AR Commerce Funnel" height={280} info="Funnel from AR launch to purchase (Claim 2).">
          <ResponsiveContainer><BarChart data={arFunnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
            <XAxis type="number" stroke={T.textDim} fontSize={10} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <YAxis dataKey="stage" type="category" stroke={T.textDim} fontSize={10} width={100} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={v => [v.toLocaleString(), "Users"]} />
            <Bar dataKey="users" radius={[0, 6, 6, 0]}>{arFunnelData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.7} />)}</Bar>
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, marginBottom: 16, textTransform: "uppercase" }}>Telemetry Signal Analysis</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {telemetryData.map(t => (
              <div key={t.metric} title={t.info} style={{ background: T.bgElevated, borderRadius: 10, padding: "16px 18px", cursor: "help" }}>
                <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>{t.metric}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{t.value}</div>
                <div style={{ fontSize: 11, color: T.accent, marginTop: 4, fontWeight: 600 }}>▲ {t.change}%</div>
              </div>))}
          </div>
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Top AR Try-On Products</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 1, background: T.border }}>
          {[...products].sort((a, b) => b.arTryOns - a.arTryOns).slice(0, 4).map(p => (
            <div key={p.id} style={{ background: T.bgCard, padding: 20, textAlign: "center" }}>
              <div role="img" aria-label={p.name} style={{ fontSize: 48, marginBottom: 10 }}>{p.img}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{p.name.split(" ").slice(0, 3).join(" ")}</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: T.purple, margin: "8px 0" }}>{p.arTryOns.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>AR try-ons today</div>
              <div style={{ marginTop: 10 }}><MiniBar value={p.sentiment * 100} color={T.accent} /></div>
            </div>))}
        </div>
      </div>
    </div>
  );
};

const SocialSentimentView = ({ isMobile }) => {
  const platforms = genSentimentData();
  const viralData = useMemo(() => genTimeSeries(48, 40, 30, 1.2).map((d, i) => ({ ...d, actual: i < 36 ? d.value * 0.9 + Math.random() * 10 : null })), []);
  const trendingTopics = [
    { topic: "#CoreAesthetics", volume: "2.4M", velocity: 94, sentiment: 0.84, predictedDemand: "+340%" },
    { topic: "Gorpcore Spring", volume: "890K", velocity: 78, sentiment: 0.81, predictedDemand: "+180%" },
    { topic: "Quiet Luxury 2.0", volume: "1.6M", velocity: 62, sentiment: 0.77, predictedDemand: "+120%" },
    { topic: "Tech-Wear Revival", volume: "540K", velocity: 88, sentiment: 0.79, predictedDemand: "+260%" },
  ];
  return (
    <div>
      <SectionHeader title="Social Sentiment Demand Forecasting Engine" subtitle="Subsystem D — Viral velocity prediction with 72-hour demand lead time" subsystem="SSDFE" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Posts Analyzed/hr" value="2.4M" change={6.2} icon="📊" color={T.amber} />
        <StatCard label="Active Viral Signals" value="847" change={23.1} icon="🔥" color={T.rose} />
        <StatCard label="Forecast Lead Time" value="72h" change={4.3} icon="⏱️" color={T.blue} />
        <StatCard label="Forecast Accuracy" value="91.2%" change={1.8} icon="🎯" color={T.accent} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Viral Velocity Prediction vs Actual Demand" height={260} info="Claim 3: Predicted vs actual demand. Gap = forecast lead.">
          <ResponsiveContainer><ComposedChart data={viralData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Line type="monotone" dataKey="value" name="Predicted" stroke={T.amber} strokeWidth={2} dot={false} />
            <Scatter dataKey="actual" name="Actual" fill={T.accent} />
          </ComposedChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Platform Sentiment</div>
          {platforms.map(p => (
            <div key={p.platform} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.platform}</div><div style={{ fontSize: 11, color: T.textMuted }}>{(p.mentions / 1000).toFixed(1)}K mentions</div></div>
              <div style={{ width: 60 }}><MiniBar value={p.sentiment * 100} color={p.sentiment > 0.8 ? T.accent : p.sentiment > 0.7 ? T.amber : T.rose} /></div>
              <Badge color={p.trend === "up" ? T.accent : p.trend === "down" ? T.rose : T.textMuted}>{p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : "→"} {p.velocity}</Badge>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Trending — Viral Velocity Alerts</span>
          <Badge color={T.rose}>🔴 Live</Badge>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Trend", "Volume", "Velocity", "Sentiment", "Predicted Demand"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{trendingTopics.map((t, i) => (
              <tr key={t.topic} style={{ borderBottom: i < trendingTopics.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px", color: T.amber, fontWeight: 700, fontSize: 14 }}>{t.topic}</td>
                <td style={{ padding: "14px 22px", color: T.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{t.volume}</td>
                <td style={{ padding: "14px 22px", width: 140 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><MiniBar value={t.velocity} color={t.velocity > 85 ? T.rose : T.amber} /><span style={{ fontSize: 12, fontWeight: 600 }}>{t.velocity}</span></div></td>
                <td style={{ padding: "14px 22px" }}><Badge color={t.sentiment > 0.82 ? T.accent : T.blue}>{(t.sentiment * 100).toFixed(0)}%</Badge></td>
                <td style={{ padding: "14px 22px", color: T.accent, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{t.predictedDemand}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SupplyChainView = ({ isMobile }) => {
  const nodes = genSupplyChainNodes();
  const optimizationData = useMemo(() => genTimeSeries(24, 82, 8, 0.3), []);
  const horizonData = [
    { horizon: "Immediate (min-hr)", metric: "Fulfillment Routing", optimized: 96, baseline: 72, savings: "$124K/day" },
    { horizon: "Tactical (days-wks)", metric: "Inventory Rebalancing", optimized: 89, baseline: 64, savings: "$890K/week" },
    { horizon: "Strategic (wks-mos)", metric: "Procurement Planning", optimized: 91, baseline: 58, savings: "$3.2M/month" },
  ];
  return (
    <div>
      <SectionHeader title="Autonomous Supply Chain Orchestration Engine" subtitle="Subsystem E — Multi-horizon reinforcement learning optimizer" subsystem="ASCOE" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Fulfillment Latency" value="-37%" change={-37} icon="🚚" color={T.cyan} sub="vs reactive baseline" />
        <StatCard label="Stockout Rate" value="0.4%" change={-68} icon="📦" color={T.accent} sub="reduction" />
        <StatCard label="Carrying Cost Savings" value="$2.1M" change={22} icon="💵" color={T.amber} sub="this quarter" />
        <StatCard label="RL Agent Reward" value="94.8" change={3.4} icon="🤖" color={T.purple} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Supply Chain Optimization Score — 24h" height={240} info="Claim 5: Multi-horizon RL composite score.">
          <ResponsiveContainer><AreaChart data={optimizationData}>
            <defs><linearGradient id="scGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.cyan} stopOpacity={0.3} /><stop offset="100%" stopColor={T.cyan} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} domain={[60, 100]} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.cyan} fill="url(#scGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 16, textTransform: "uppercase" }}>Multi-Horizon Optimization</div>
          {horizonData.map(h => (
            <div key={h.horizon} style={{ marginBottom: 16, padding: "14px 16px", background: T.bgElevated, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{h.horizon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>{h.savings}</span>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>{h.metric}</div>
              <div style={{ position: "relative", height: 8, background: `${T.rose}20`, borderRadius: 4 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${h.baseline}%`, background: `${T.rose}50`, borderRadius: 4 }} />
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${h.optimized}%`, background: T.cyan, borderRadius: 4, opacity: 0.8, transition: "width 1s ease" }} />
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Distribution Network Status</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 1, background: T.border }}>
          {nodes.map(n => (
            <div key={n.id} style={{ background: T.bgCard, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{n.name}</span>
                <Badge color={n.type === "warehouse" ? T.blue : T.purple}>{n.type}</Badge>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>ID: {n.id}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11 }}><span style={{ color: T.textDim }}>Capacity</span><span style={{ color: n.capacity > 80 ? T.rose : T.accent, fontWeight: 600 }}>{n.capacity}%</span></div>
              <MiniBar value={n.capacity} color={n.capacity > 80 ? T.rose : n.capacity > 60 ? T.amber : T.accent} />
              <div style={{ marginTop: 10, fontSize: 12, color: T.textMuted }}>Throughput: <span style={{ color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{n.throughput.toLocaleString()}</span> units/day</div>
            </div>))}
        </div>
      </div>
    </div>
  );
};

const IntentGraphView = ({ isMobile }) => {
  const profiles = genConsumerProfiles();
  const graphRef = useRef(null);
  const [graphKey, setGraphKey] = useState(0);
  useEffect(() => { let timeout; const onResize = () => { clearTimeout(timeout); timeout = setTimeout(() => setGraphKey(k => k + 1), 300); }; window.addEventListener("resize", onResize); return () => { window.removeEventListener("resize", onResize); clearTimeout(timeout); }; }, []);
  const graphStats = [{ label: "Total Nodes", value: "48.2M", icon: "🔵" }, { label: "Total Edges", value: "312M", icon: "🔗" }, { label: "Query Latency", value: "2.1ms", icon: "⚡" }, { label: "Update Freq", value: "30s", icon: "🔄" }];
  const nodeTypes = [{ type: "Consumer", count: "1.84M", color: T.blue }, { type: "Product", count: "2.4M", color: T.accent }, { type: "Brand", count: "48K", color: T.purple }, { type: "Category", count: "3.2K", color: T.amber }, { type: "Social Trend", count: "12K", color: T.rose }, { type: "Eco-Metric", count: "6.8K", color: T.emerald }, { type: "IoT Signal", count: "340K", color: T.orange }, { type: "Memory Node", count: "4.2M", color: T.indigo }];
  const edgeTypes = [{ type: "viewed", count: "142M", weight: "temporal decay" }, { type: "purchased", count: "38M", weight: "recency + frequency" }, { type: "similar-to", count: "64M", weight: "embedding distance" }, { type: "influenced-by", count: "22M", weight: "causal strength" }, { type: "trending-on", count: "8M", weight: "viral velocity" }, { type: "eco-scored", count: "6.8M", weight: "sustainability index" }];

  useEffect(() => {
    if (!graphRef.current) return;
    const width = graphRef.current.clientWidth; const height = 340;
    d3.select(graphRef.current).selectAll("*").remove();
    const svg = d3.select(graphRef.current).append("svg").attr("width", width).attr("height", height).attr("role", "img").attr("aria-label", "Interactive knowledge graph");
    const nodes = [
      { id: "Consumer A", group: 0, r: 18 }, { id: "Consumer B", group: 0, r: 14 },
      { id: "Arc'teryx Jacket", group: 1, r: 16 }, { id: "Nike Air Max", group: 1, r: 17 },
      { id: "Sony XM6", group: 1, r: 15 }, { id: "Lululemon Align", group: 1, r: 16 },
      { id: "Outerwear", group: 3, r: 12 }, { id: "Footwear", group: 3, r: 12 },
      { id: "#CoreAesthetics", group: 4, r: 13 }, { id: "Gorpcore", group: 4, r: 11 },
      { id: "Nike", group: 2, r: 13 }, { id: "Arc'teryx", group: 2, r: 12 },
      { id: "🌱 EcoScore", group: 5, r: 10 }, { id: "📡 Store-NYC", group: 6, r: 10 },
      { id: "💾 Memory", group: 7, r: 11 }, { id: "🤖 Agent-A", group: 8, r: 11 },
    ];
    const links = [
      { source: "Consumer A", target: "Arc'teryx Jacket", value: 3 }, { source: "Consumer A", target: "Nike Air Max", value: 2 },
      { source: "Consumer A", target: "Sony XM6", value: 4 }, { source: "Consumer B", target: "Lululemon Align", value: 3 },
      { source: "Consumer B", target: "Nike Air Max", value: 2 }, { source: "Arc'teryx Jacket", target: "Outerwear", value: 2 },
      { source: "Nike Air Max", target: "Footwear", value: 2 }, { source: "#CoreAesthetics", target: "Arc'teryx Jacket", value: 1 },
      { source: "Gorpcore", target: "Arc'teryx Jacket", value: 1 }, { source: "Nike", target: "Nike Air Max", value: 1 },
      { source: "Arc'teryx", target: "Arc'teryx Jacket", value: 1 }, { source: "Consumer A", target: "#CoreAesthetics", value: 1 },
      { source: "🌱 EcoScore", target: "Arc'teryx Jacket", value: 1 }, { source: "📡 Store-NYC", target: "Consumer A", value: 2 },
      { source: "💾 Memory", target: "Consumer A", value: 2 }, { source: "🤖 Agent-A", target: "Consumer A", value: 3 },
      { source: "🤖 Agent-A", target: "Arc'teryx Jacket", value: 1 },
    ];
    const colors = [T.blue, T.accent, T.purple, T.amber, T.rose, T.emerald, T.orange, T.indigo, T.lime];
    const sim = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(d => d.id).distance(80)).force("charge", d3.forceManyBody().strength(-200)).force("center", d3.forceCenter(width / 2, height / 2)).force("collision", d3.forceCollide(d => d.r + 5));
    const link = svg.append("g").selectAll("line").data(links).join("line").attr("stroke", "#334155").attr("stroke-opacity", 0.5).attr("stroke-width", d => d.value);
    const node = svg.append("g").selectAll("g").data(nodes).join("g").call(d3.drag().on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }).on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; }).on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
    node.append("circle").attr("r", d => d.r).attr("fill", d => colors[d.group] || T.text).attr("fill-opacity", 0.2).attr("stroke", d => colors[d.group] || T.text).attr("stroke-width", 1.5).style("cursor", "grab");
    node.append("text").text(d => d.id.length > 14 ? d.id.slice(0, 12) + "…" : d.id).attr("text-anchor", "middle").attr("dy", d => d.r + 14).attr("fill", "#94a3b8").attr("font-size", 9).attr("font-family", "Arial");
    sim.on("tick", () => { link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y); node.attr("transform", d => `translate(${d.x},${d.y})`); });
    return () => sim.stop();
  }, [graphKey]);

  return (
    <div>
      <SectionHeader title="Unified Consumer Intent Graph" subtitle="Subsystem F — Temporal heterogeneous knowledge graph with v2 node types" subsystem="UCIG" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {graphStats.map(s => (<div key={s.label} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}><span aria-hidden="true" style={{ fontSize: 18 }}>{s.icon}</span><div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace", margin: "6px 0 2px" }}>{s.value}</div><div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{s.label}</div></div>))}
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Live Graph Visualization — Subgraph Sample</div>
          <span title="Drag nodes. Blue=Consumer, Green=Product, Purple=Brand, Amber=Category, Rose=Trend, Emerald=Eco, Orange=IoT, Indigo=Memory, Lime=Agent" style={{ fontSize: 14, cursor: "help", opacity: 0.5 }}>ℹ️</span>
        </div>
        <div ref={graphRef} style={{ width: "100%", height: 340, background: T.bgElevated, borderRadius: 10, overflow: "hidden" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Node Types (v2 Expanded)</div>
          {nodeTypes.map(n => (<div key={n.type} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: n.color }} /><span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{n.type}</span></div><span style={{ fontSize: 13, color: T.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{n.count}</span></div>))}
        </div>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Edge Types</div>
          {edgeTypes.map(e => (<div key={e.type} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, color: T.accent, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{e.type}</span><span style={{ fontSize: 12, color: T.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{e.count}</span></div><div style={{ fontSize: 11, color: T.textDim }}>Weight: {e.weight}</div></div>))}
        </div>
      </div>
    </div>
  );
};

// ─── NEW V2 SUBSYSTEM VIEWS ───

const AgenticAIView = ({ isMobile }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 3000); return () => clearInterval(iv); }, []);
  const agentPerformance = useMemo(() => genTimeSeries(24, 88, 6, 0.2, tick + 200), [tick]);
  const agents = [
    { id: "AGT-001", name: "Cart Recovery Agent", type: "Recovery", status: "Active", tasksDone: 3420, successRate: 78, revenue: 284000, icon: "🛒" },
    { id: "AGT-002", name: "Price Watch Agent", type: "Monitoring", status: "Active", tasksDone: 12800, successRate: 92, revenue: 156000, icon: "💲" },
    { id: "AGT-003", name: "Subscription Manager", type: "Lifecycle", status: "Active", tasksDone: 890, successRate: 96, revenue: 420000, icon: "🔄" },
    { id: "AGT-004", name: "Reorder Predictor", type: "Proactive", status: "Active", tasksDone: 6200, successRate: 84, revenue: 380000, icon: "📦" },
    { id: "AGT-005", name: "Deal Finder Agent", type: "Discovery", status: "Active", tasksDone: 8400, successRate: 71, revenue: 198000, icon: "🏷️" },
    { id: "AGT-006", name: "Gift Recommender", type: "Seasonal", status: "Standby", tasksDone: 2100, successRate: 88, revenue: 340000, icon: "🎁" },
  ];
  const orchestrationData = [
    { action: "Cart Abandoned → Recovery Sequence", triggers: "4,280/hr", conversion: "31%", avgTime: "2.4min" },
    { action: "Staple Low → Auto-Reorder Prompt", triggers: "890/hr", conversion: "68%", avgTime: "0.8min" },
    { action: "Price Drop → Notify Watchers", triggers: "12,400/hr", conversion: "24%", avgTime: "0.1min" },
    { action: "Subscription Renewal → Optimize Plan", triggers: "340/hr", conversion: "89%", avgTime: "1.2min" },
  ];
  return (
    <div>
      <SectionHeader title="Agentic AI Orchestration Hub" subtitle="Autonomous shopping agents that anticipate needs and execute transactions via UCIG traversal" subsystem="AGENTIC" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Active Agents" value="12,840" change={34.2} icon="🤖" color={T.lime} />
        <StatCard label="Tasks Completed/hr" value="33,810" change={18.7} icon="⚡" color={T.amber} />
        <StatCard label="Conversion Lift" value="+28%" change={28} icon="📈" color={T.accent} sub="vs non-agentic" />
        <StatCard label="Agent Revenue" value="$1.78M" change={42.1} icon="💰" color={T.blue} sub="today" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Agent Performance Score — 24h" height={240} info="Claim 13: Composite agent orchestration efficiency.">
          <ResponsiveContainer><AreaChart data={agentPerformance}>
            <defs><linearGradient id="agGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.lime} stopOpacity={0.3} /><stop offset="100%" stopColor={T.lime} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} domain={[70, 100]} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.lime} fill="url(#agGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Orchestration Pipeline</div>
          {orchestrationData.map(o => (
            <div key={o.action} style={{ padding: "12px 14px", marginBottom: 10, background: T.bgElevated, borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 6 }}>{o.action}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textMuted }}>
                <span>Triggers: <span style={{ color: T.lime, fontWeight: 600 }}>{o.triggers}</span></span>
                <span>Conv: <span style={{ color: T.accent, fontWeight: 600 }}>{o.conversion}</span></span>
                <span>Avg: <span style={{ color: T.blue, fontWeight: 600 }}>{o.avgTime}</span></span>
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Agent Fleet Status</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Agent", "Type", "Tasks Done", "Success Rate", "Revenue Impact", "Status"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{agents.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: i < agents.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20 }}>{a.icon}</span><div><div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{a.name}</div><div style={{ fontSize: 11, color: T.textDim }}>{a.id}</div></div></div></td>
                <td style={{ padding: "14px 22px" }}><Badge color={T.blue}>{a.type}</Badge></td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.textMuted }}>{a.tasksDone.toLocaleString()}</td>
                <td style={{ padding: "14px 22px", width: 160 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><MiniBar value={a.successRate} color={a.successRate > 85 ? T.accent : T.amber} /><span style={{ fontSize: 12, fontWeight: 600 }}>{a.successRate}%</span></div></td>
                <td style={{ padding: "14px 22px", color: T.accent, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>${(a.revenue / 1000).toFixed(0)}K</td>
                <td style={{ padding: "14px 22px" }}><div style={{ display: "flex", alignItems: "center" }}><Pulse color={a.status === "Active" ? T.accent : T.amber} /><span style={{ fontSize: 12, fontWeight: 600, color: a.status === "Active" ? T.accent : T.amber }}>{a.status}</span></div></td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MemoryLayerView = ({ isMobile }) => {
  const memoryData = useMemo(() => genTimeSeries(24, 92, 5, 0.15), []);
  const memoryStages = [
    { stage: "Retain", desc: "Raw interaction storage", records: "142M", latency: "0.3ms", color: T.indigo, icon: "💾" },
    { stage: "Recall", desc: "Relevance-weighted retrieval", records: "24M", latency: "1.8ms", color: T.purple, icon: "🔍" },
    { stage: "Reflect", desc: "Pattern learning & synthesis", records: "4.2M", latency: "12ms", color: T.accent, icon: "🧠" },
  ];
  const reductionMetrics = [
    { metric: "Cart Abandonment", before: "72%", after: "41%", reduction: "-43%", color: T.accent },
    { metric: "Repeat Recommendations", before: "34%", after: "6%", reduction: "-82%", color: T.blue },
    { metric: "Support Contact Rate", before: "8.4%", after: "3.1%", reduction: "-63%", color: T.purple },
    { metric: "Session-to-Purchase", before: "4.2 visits", after: "2.1 visits", reduction: "-50%", color: T.amber },
  ];
  const episodicMemories = [
    { id: "MEM-28401", consumer: "USR-7829", type: "Purchase Pattern", content: "Buys outerwear in October, replaces every 2 years. Last: Oct 2024 Arc'teryx Beta.", confidence: 0.94, age: "14mo" },
    { id: "MEM-18203", consumer: "USR-3041", type: "Price Sensitivity", content: "Always waits for 20%+ discount on athleisure. Triggered by email, not push.", confidence: 0.87, age: "6mo" },
    { id: "MEM-42811", consumer: "USR-5518", type: "Brand Loyalty", content: "Sony audio preferred over Bose since 2022. Upgrades at each generation launch.", confidence: 0.91, age: "22mo" },
    { id: "MEM-09142", consumer: "USR-9203", type: "Return Risk", content: "40% return rate on footwear due to sizing. Prefers half-size up in Nike.", confidence: 0.82, age: "3mo" },
  ];
  return (
    <div>
      <SectionHeader title="Long-Term Memory & Reflection Layer" subtitle="Three-stage memory system (retain, recall, reflect) for persistent consumer context" subsystem="MEMORY" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Memory Records" value="142M" change={6.8} icon="💾" color={T.indigo} />
        <StatCard label="Recall Accuracy" value="96.2%" change={1.4} icon="🎯" color={T.accent} />
        <StatCard label="Cart Abandonment" value="-43%" change={-43} icon="🛒" color={T.blue} sub="reduction" />
        <StatCard label="Repeat Rec. Rate" value="6%" change={-82} icon="🔄" color={T.purple} sub="reduction" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Memory System Health — 24h" height={240} info="Claim 14: Three-stage memory pipeline performance.">
          <ResponsiveContainer><AreaChart data={memoryData}>
            <defs><linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.indigo} stopOpacity={0.3} /><stop offset="100%" stopColor={T.indigo} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} domain={[80, 100]} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.indigo} fill="url(#memGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Memory Pipeline Stages</div>
          {memoryStages.map(s => (
            <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", marginBottom: 10, background: T.bgElevated, borderRadius: 10, border: `1px solid ${s.color}20` }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.stage}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{s.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{s.records}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>Latency: {s.latency}</div>
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {reductionMetrics.map(m => (
          <div key={m.metric} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.textDim, textTransform: "uppercase", marginBottom: 8 }}>{m.metric}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{m.reduction}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{m.before} → {m.after}</div>
          </div>))}
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Episodic Memory Samples</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Consumer", "Type", "Memory Content", "Confidence", "Age"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{episodicMemories.map((m, i) => (
              <tr key={m.id} style={{ borderBottom: i < episodicMemories.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px", color: T.blue, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{m.consumer}</td>
                <td style={{ padding: "14px 22px" }}><Badge color={T.indigo}>{m.type}</Badge></td>
                <td style={{ padding: "14px 22px", color: T.text, fontSize: 13, maxWidth: 300 }}>{m.content}</td>
                <td style={{ padding: "14px 22px", width: 120 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><MiniBar value={m.confidence * 100} color={T.accent} /><span style={{ fontSize: 12, fontWeight: 600 }}>{(m.confidence * 100).toFixed(0)}%</span></div></td>
                <td style={{ padding: "14px 22px", color: T.textMuted, fontSize: 12 }}>{m.age}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const VoiceCommerceView = ({ isMobile }) => {
  const voiceData = useMemo(() => genTimeSeries(24, 4200, 1800, 120), []);
  const channels = [
    { channel: "Smart Speakers", sessions: 42800, conversion: 6.2, avgOrder: 84, tone: "Neutral-Positive" },
    { channel: "Mobile Voice", sessions: 28400, conversion: 4.8, avgOrder: 112, tone: "Engaged" },
    { channel: "In-Store Kiosk", sessions: 8900, conversion: 8.4, avgOrder: 186, tone: "Exploratory" },
    { channel: "Car Assistant", sessions: 3200, conversion: 3.1, avgOrder: 48, tone: "Task-Oriented" },
  ];
  const sampleQueries = [
    { query: "Find me eco-friendly outerwear in my size", intent: "Discovery + Sustainability", subsystems: "VOICE → SUSTAIN → PPIE → UCIG", confidence: 0.94 },
    { query: "Reorder my usual running shoes, half size up", intent: "Reorder + Memory Recall", subsystems: "VOICE → MEMORY → AGENTIC", confidence: 0.97 },
    { query: "What's trending in tech-wear right now?", intent: "Trend Discovery", subsystems: "VOICE → SSDFE → UCIG", confidence: 0.91 },
    { query: "Show me how the Nike Air Max looks on me", intent: "AR Try-On", subsystems: "VOICE → MULTIMODAL → IACE", confidence: 0.88 },
  ];
  return (
    <div>
      <SectionHeader title="Voice & Conversational Commerce Engine" subtitle="Ambient voice-enabled shopping with tone sentiment analysis and natural language UCIG traversal" subsystem="VOICE" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Voice Sessions/hr" value="83,300" change={22.4} icon="🎙️" color={T.pink} />
        <StatCard label="Voice Conversion" value="5.8%" change={38} icon="📈" color={T.accent} sub="vs text-only 3.2%" />
        <StatCard label="Avg Discovery Time" value="18s" change={-52} icon="⏱️" color={T.blue} sub="reduction" />
        <StatCard label="Revenue Lift" value="+40%" change={40} icon="💰" color={T.amber} sub="voice channel" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Voice Sessions — 24h" height={240} info="Claim 15: Voice commerce volume across all channels.">
          <ResponsiveContainer><AreaChart data={voiceData}>
            <defs><linearGradient id="vcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.pink} stopOpacity={0.3} /><stop offset="100%" stopColor={T.pink} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.pink} fill="url(#vcGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Channel Performance</div>
          {channels.map(c => (
            <div key={c.channel} style={{ padding: "12px 14px", marginBottom: 10, background: T.bgElevated, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.channel}</span>
                <Badge color={T.pink}>{c.tone}</Badge>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textMuted }}>
                <span>{(c.sessions / 1000).toFixed(1)}K sessions</span>
                <span>Conv: <span style={{ color: T.accent, fontWeight: 600 }}>{c.conversion}%</span></span>
                <span>AOV: <span style={{ color: T.blue, fontWeight: 600 }}>${c.avgOrder}</span></span>
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Voice Query → Subsystem Routing</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Voice Query", "Detected Intent", "Subsystem Chain", "Confidence"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{sampleQueries.map((q, i) => (
              <tr key={i} style={{ borderBottom: i < sampleQueries.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px", color: T.pink, fontWeight: 600, fontSize: 13, fontStyle: "italic" }}>"{q.query}"</td>
                <td style={{ padding: "14px 22px" }}><Badge color={T.blue}>{q.intent}</Badge></td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.accent }}>{q.subsystems}</td>
                <td style={{ padding: "14px 22px", width: 120 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><MiniBar value={q.confidence * 100} color={T.accent} /><span style={{ fontSize: 12, fontWeight: 600 }}>{(q.confidence * 100).toFixed(0)}%</span></div></td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SustainabilityView = ({ isMobile }) => {
  const products = genProducts();
  const carbonData = useMemo(() => genTimeSeries(24, 42, 12, -0.8), []);
  const ecoTrends = [
    { trend: "Recycled Materials", growth: "+284%", volume: "1.2M mentions", demandShift: "+42%", color: T.emerald },
    { trend: "Carbon-Neutral Shipping", growth: "+196%", volume: "840K mentions", demandShift: "+38%", color: T.accent },
    { trend: "Circular Fashion", growth: "+340%", volume: "2.1M mentions", demandShift: "+56%", color: T.blue },
    { trend: "Low-Water Manufacturing", growth: "+128%", volume: "420K mentions", demandShift: "+22%", color: T.cyan },
  ];
  return (
    <div>
      <SectionHeader title="Sustainability Intelligence Engine" subtitle="Eco-metric node types in UCIG with carbon-aware supply chain optimization" subsystem="SUSTAIN" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Avg Eco-Score" value="72.4" change={8.2} icon="🌱" color={T.emerald} />
        <StatCard label="Carbon Saved" value="24.8 tons" change={34} icon="🌍" color={T.accent} sub="this month" />
        <StatCard label="Green Products" value="62%" change={12} icon="♻️" color={T.blue} sub="of catalog" />
        <StatCard label="Eco-Loyalty Lift" value="+18%" change={18} icon="💚" color={T.lime} sub="repeat rate" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Carbon Footprint Trend — 24h (tons CO₂)" height={240} info="Claim 16: Carbon-aware optimization reducing emissions.">
          <ResponsiveContainer><AreaChart data={carbonData}>
            <defs><linearGradient id="ecoGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.emerald} stopOpacity={0.3} /><stop offset="100%" stopColor={T.emerald} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.emerald} fill="url(#ecoGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Eco-Trend Intelligence (via SSDFE)</div>
          {ecoTrends.map(t => (
            <div key={t.trend} style={{ padding: "12px 14px", marginBottom: 10, background: T.bgElevated, borderRadius: 10, borderLeft: `3px solid ${t.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{t.trend}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.color, fontFamily: "'JetBrains Mono', monospace" }}>{t.growth}</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textMuted }}>
                <span>{t.volume}</span>
                <span>Demand: <span style={{ color: T.accent, fontWeight: 600 }}>{t.demandShift}</span></span>
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Product Eco-Scorecard</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Product", "Eco-Score", "Carbon (kg CO₂)", "Sustainable Alt.", "Demand Impact"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{[...products].sort((a, b) => b.ecoScore - a.ecoScore).map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20 }}>{p.img}</span><span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{p.name}</span></div></td>
                <td style={{ padding: "14px 22px", width: 160 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><MiniBar value={p.ecoScore} color={p.ecoScore > 80 ? T.emerald : p.ecoScore > 60 ? T.amber : T.rose} /><span style={{ fontSize: 13, fontWeight: 700, color: p.ecoScore > 80 ? T.emerald : T.text, fontFamily: "'JetBrains Mono', monospace" }}>{p.ecoScore}</span></div></td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: p.carbonKg < 5 ? T.accent : p.carbonKg > 15 ? T.rose : T.textMuted }}>{p.carbonKg} kg</td>
                <td style={{ padding: "14px 22px" }}><Badge color={p.ecoScore > 75 ? T.emerald : T.amber}>{p.ecoScore > 75 ? "Eco-Certified" : "Alt. Available"}</Badge></td>
                <td style={{ padding: "14px 22px", color: T.accent, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>+{Math.round(p.ecoScore * 0.3)}%</td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const IoTOmnichannelView = ({ isMobile }) => {
  const iotData = useMemo(() => genTimeSeries(24, 340, 80, 12), []);
  const stores = [
    { id: "NYC-5th", name: "NYC 5th Avenue", beacons: 48, cameras: 12, dwellAvg: "4.2min", footTraffic: 8400, digitalTriggers: 2840, conversion: 12.4 },
    { id: "LA-Grove", name: "LA The Grove", beacons: 32, cameras: 8, dwellAvg: "3.8min", footTraffic: 6200, digitalTriggers: 1920, conversion: 10.8 },
    { id: "CHI-Mag", name: "Chicago Mag Mile", beacons: 28, cameras: 6, dwellAvg: "5.1min", footTraffic: 4800, digitalTriggers: 1680, conversion: 14.2 },
    { id: "MIA-Design", name: "Miami Design Dist.", beacons: 24, cameras: 6, dwellAvg: "6.4min", footTraffic: 3200, digitalTriggers: 1240, conversion: 16.8 },
  ];
  const signalTypes = [
    { signal: "Beacon Proximity", count: "2.4M/day", latency: "80ms", accuracy: "92%", icon: "📡" },
    { signal: "Camera Dwell Detection", count: "840K/day", latency: "120ms", accuracy: "88%", icon: "📷" },
    { signal: "Mobile App Handoff", count: "1.2M/day", latency: "40ms", accuracy: "96%", icon: "📱" },
    { signal: "Smart Mirror Interaction", count: "180K/day", latency: "200ms", accuracy: "94%", icon: "🪞" },
  ];
  return (
    <div>
      <SectionHeader title="Physical Store IoT Fusion" subtitle="Digital-physical signal blending via beacons, cameras, and in-store dwell sensors" subsystem="IOT" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="IoT Signals/min" value="48,200" change={14.8} icon="📡" color={T.orange} />
        <StatCard label="Store Locations" value="4" change={100} icon="🏬" color={T.blue} sub="pilot stores" />
        <StatCard label="Omnichannel Conv." value="13.6%" change={82} icon="📈" color={T.accent} sub="vs online-only 4.8%" />
        <StatCard label="Return Reduction" value="-24%" change={-24} icon="↩️" color={T.purple} sub="via try-before-buy" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="IoT Signal Volume — 24h" height={240} info="Claim 17: Physical store IoT signal ingestion rate.">
          <ResponsiveContainer><AreaChart data={iotData}>
            <defs><linearGradient id="iotGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.orange} stopOpacity={0.3} /><stop offset="100%" stopColor={T.orange} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.orange} fill="url(#iotGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Signal Types</div>
          {signalTypes.map(s => (
            <div key={s.signal} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", marginBottom: 8, background: T.bgElevated, borderRadius: 10 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.signal}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{s.count} · {s.latency} · {s.accuracy} acc.</div>
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Store Network Dashboard</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Store", "Beacons", "Cameras", "Avg Dwell", "Foot Traffic", "Digital Triggers", "Conv. Rate"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{stores.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < stores.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px", color: T.text, fontWeight: 600, fontSize: 14 }}>{s.name}</td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.textMuted }}>{s.beacons}</td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.textMuted }}>{s.cameras}</td>
                <td style={{ padding: "14px 22px", color: T.blue, fontWeight: 600, fontSize: 13 }}>{s.dwellAvg}</td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.text }}>{s.footTraffic.toLocaleString()}</td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.orange }}>{s.digitalTriggers.toLocaleString()}</td>
                <td style={{ padding: "14px 22px" }}><Badge color={s.conversion > 14 ? T.accent : T.blue}>{s.conversion}%</Badge></td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PrivacyConsoleView = ({ isMobile }) => {
  const privacyData = useMemo(() => genTimeSeries(24, 98, 2, 0.02), []);
  const consentMetrics = [
    { regulation: "GDPR (EU)", compliance: 99.8, epsilonCurrent: 1.2, epsilonTarget: 1.0, consentRate: "94.2%", riskLevel: "Low" },
    { regulation: "CCPA (California)", compliance: 99.6, epsilonCurrent: 1.4, epsilonTarget: 1.2, consentRate: "91.8%", riskLevel: "Low" },
    { regulation: "LGPD (Brazil)", compliance: 98.9, epsilonCurrent: 1.6, epsilonTarget: 1.4, consentRate: "88.4%", riskLevel: "Medium" },
    { regulation: "PIPA (South Korea)", compliance: 99.1, epsilonCurrent: 1.1, epsilonTarget: 1.0, consentRate: "96.1%", riskLevel: "Low" },
  ];
  const dataFlows = [
    { from: "CBFE", to: "UCIG", dataType: "Behavioral Fingerprint", volume: "2.4M/hr", encrypted: true, anonymized: true },
    { from: "IACE", to: "UCIG", dataType: "AR Telemetry", volume: "840K/hr", encrypted: true, anonymized: true },
    { from: "SSDFE", to: "ASCOE", dataType: "Demand Forecast", volume: "12K/hr", encrypted: true, anonymized: false },
    { from: "IOT", to: "UCIG", dataType: "Store Signals", volume: "48K/hr", encrypted: true, anonymized: true },
    { from: "VOICE", to: "MEMORY", dataType: "Voice Embeddings", volume: "83K/hr", encrypted: true, anonymized: true },
  ];
  return (
    <div>
      <SectionHeader title="AI-Driven Privacy & Consent Console" subtitle="Dynamic epsilon adjustment, predictive consent preferences, and explainable data flows" subsystem="PRIVACY" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Compliance Score" value="99.2%" change={0.4} icon="🛡️" color={T.teal} />
        <StatCard label="Consent Rate" value="92.6%" change={2.1} icon="✅" color={T.accent} />
        <StatCard label="Avg Epsilon (ε)" value="1.28" change={-8} icon="🔒" color={T.blue} sub="lower = more private" />
        <StatCard label="Data Requests" value="124" change={-12} icon="📋" color={T.purple} sub="this month" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Privacy Compliance Score — 24h" height={240} info="Claim 18: AI-driven adaptive consent management score.">
          <ResponsiveContainer><AreaChart data={privacyData}>
            <defs><linearGradient id="privGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={T.teal} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} domain={[95, 100]} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.teal} fill="url(#privGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Regulatory Compliance</div>
          {consentMetrics.map(c => (
            <div key={c.regulation} style={{ padding: "12px 14px", marginBottom: 10, background: T.bgElevated, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.regulation}</span>
                <Badge color={c.riskLevel === "Low" ? T.accent : T.amber}>{c.riskLevel} Risk</Badge>
              </div>
              <div style={{ marginBottom: 6 }}><MiniBar value={c.compliance} color={T.teal} /></div>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textMuted }}>
                <span>ε: {c.epsilonCurrent} → {c.epsilonTarget}</span>
                <span>Consent: {c.consentRate}</span>
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Data Flow Audit Trail</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Source", "Destination", "Data Type", "Volume", "Encrypted", "Anonymized"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{dataFlows.map((f, i) => (
              <tr key={i} style={{ borderBottom: i < dataFlows.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px" }}><Badge color={T.blue}>{f.from}</Badge></td>
                <td style={{ padding: "14px 22px" }}><Badge color={T.purple}>{f.to}</Badge></td>
                <td style={{ padding: "14px 22px", color: T.text, fontSize: 13 }}>{f.dataType}</td>
                <td style={{ padding: "14px 22px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.textMuted }}>{f.volume}</td>
                <td style={{ padding: "14px 22px", color: T.accent, fontSize: 16 }}>{f.encrypted ? "✓" : "✗"}</td>
                <td style={{ padding: "14px 22px", color: f.anonymized ? T.accent : T.amber, fontSize: 16 }}>{f.anonymized ? "✓" : "⚠"}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MultimodalARView = ({ isMobile }) => {
  const multimodalData = useMemo(() => genTimeSeries(24, 1200, 400, 40), []);
  const capabilities = [
    { name: "Visual Search", desc: "Upload photo → find matching products", accuracy: "94.2%", usage: "42K/day", icon: "📸", color: T.rose },
    { name: "3D Body Modeling", desc: "Camera scan → virtual avatar creation", accuracy: "91.8%", usage: "18K/day", icon: "🧍", color: T.purple },
    { name: "Wardrobe Integration", desc: "Scan closet → outfit recommendations", accuracy: "87.4%", usage: "8.2K/day", icon: "👗", color: T.pink },
    { name: "Style Transfer", desc: "Apply style from image to product range", accuracy: "82.6%", usage: "12K/day", icon: "🎨", color: T.amber },
  ];
  const returnReduction = [
    { category: "Footwear", beforeReturn: "28%", afterReturn: "12%", reduction: "-57%", method: "3D foot scan" },
    { category: "Outerwear", beforeReturn: "22%", afterReturn: "9%", reduction: "-59%", method: "Body model fit" },
    { category: "Athleisure", beforeReturn: "18%", afterReturn: "8%", reduction: "-56%", method: "Size prediction" },
    { category: "Wearables", beforeReturn: "14%", afterReturn: "6%", reduction: "-57%", method: "Wrist scan" },
  ];
  return (
    <div>
      <SectionHeader title="Multimodal Visual Commerce Engine" subtitle="Combined image-text-video processing for visual search, 3D modeling, and wardrobe-aware try-on" subsystem="MULTIMODAL" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Visual Searches/day" value="42,000" change={28.4} icon="🔍" color={T.rose} />
        <StatCard label="3D Avatars Created" value="18,400" change={44} icon="🧍" color={T.purple} />
        <StatCard label="Return Reduction" value="-57%" change={-57} icon="↩️" color={T.accent} sub="vs no multimodal" />
        <StatCard label="CTR Lift" value="+62%" change={62} icon="📈" color={T.amber} sub="visual search" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <ChartCard title="Multimodal Sessions — 24h" height={240} info="Claim 19: Combined image-text-video processing volume.">
          <ResponsiveContainer><AreaChart data={multimodalData}>
            <defs><linearGradient id="mmGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.rose} stopOpacity={0.3} /><stop offset="100%" stopColor={T.rose} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="time" stroke={T.textDim} fontSize={10} /><YAxis stroke={T.textDim} fontSize={10} />
            <Tooltip contentStyle={{ background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={T.rose} fill="url(#mmGrad)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </ChartCard>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Multimodal Capabilities</div>
          {capabilities.map(c => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", marginBottom: 8, background: T.bgElevated, borderRadius: 10, borderLeft: `3px solid ${c.color}` }}>
              <span style={{ fontSize: 24 }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{c.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.accuracy}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>{c.usage}</div>
              </div>
            </div>))}
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Return Reduction by Category (Multimodal Fit)</div>
        <div style={{ overflowX: "auto" }}>
          <table role="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>{["Category", "Before", "After", "Reduction", "Method"].map(h => (<th key={h} style={{ padding: "12px 22px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textDim, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{returnReduction.map((r, i) => (
              <tr key={r.category} style={{ borderBottom: i < returnReduction.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 22px", color: T.text, fontWeight: 600, fontSize: 14 }}>{r.category}</td>
                <td style={{ padding: "14px 22px", color: T.rose, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{r.beforeReturn}</td>
                <td style={{ padding: "14px 22px", color: T.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{r.afterReturn}</td>
                <td style={{ padding: "14px 22px", fontWeight: 700, fontSize: 16, color: T.accent }}>{r.reduction}</td>
                <td style={{ padding: "14px 22px" }}><Badge color={T.purple}>{r.method}</Badge></td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── AI RECOMMENDATION ENGINE ───
const AIRecommendationView = ({ isMobile }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const runRecommendation = async () => {
    const cleaned = query.trim();
    if (!cleaned || cleaned.length < 3) { setError("Please enter a more detailed query (3+ characters)."); return; }
    if (cleaned.length > 500) { setError("Query too long. Please keep under 500 characters."); return; }
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) { setError("Claude API key not configured. Add VITE_ANTHROPIC_API_KEY to your .env file. See README for setup."); return; }
    setLoading(true); setResult(null); setError(null);
    try {
      const resp = await fetch("/api/anthropic/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `You are the OmniSense AI v2.0 recommendation engine for a retailer. Query: "${sanitize(cleaned)}"\n\nThe platform now has 13 subsystems: CBFE (cross-device), PPIE (predictions), IACE (AR commerce), SSDFE (sentiment), ASCOE (supply chain), UCIG (intent graph), AGENTIC (autonomous agents), MEMORY (long-term memory), VOICE (voice commerce), SUSTAIN (sustainability), IOT (physical store), PRIVACY (consent management), MULTIMODAL (visual search/3D modeling).\n\nProvide a strategic recommendation leveraging the expanded platform.\n\nRespond ONLY with JSON (no markdown):\n{"recommendation":"2-3 sentences","confidence":0.0-1.0,"signals":["signal1","signal2","signal3"],"actions":[{"action":"description","priority":"high/medium/low","subsystem":"SUBSYSTEM_KEY"}],"predicted_impact":{"revenue":"+X%","conversion":"+X%","efficiency":"+X%"}}` }] }),
      });
      if (!resp.ok) throw new Error(`API returned ${resp.status}: ${resp.statusText}`);
      const data = await resp.json();
      if (!data.content || !Array.isArray(data.content)) throw new Error("Unexpected API response format.");
      const text = data.content.map(i => i.text || "").join("\n");
      let parsed;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { throw new Error("Failed to parse AI response as JSON."); }
      if (!parsed.recommendation || typeof parsed.confidence !== "number") throw new Error("AI response missing required fields.");
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
      parsed.signals = Array.isArray(parsed.signals) ? parsed.signals.slice(0, 10) : [];
      parsed.actions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 8) : [];
      setResult(parsed);
    } catch (err) { setError(`Analysis failed: ${err.message}. Please try again.`); }
    setLoading(false);
  };
  const subsystemColors = { CBFE: T.blue, PPIE: T.accent, IACE: T.purple, SSDFE: T.amber, ASCOE: T.cyan, UCIG: T.rose, AGENTIC: T.lime, MEMORY: T.indigo, VOICE: T.pink, SUSTAIN: T.emerald, IOT: T.orange, PRIVACY: T.teal, MULTIMODAL: T.rose };
  return (
    <div>
      <SectionHeader title="AI Recommendation Engine" subtitle="Query all 13 OmniSense AI subsystems for real-time strategic recommendations powered by Claude" />
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
          <input value={query} onChange={e => { setQuery(e.target.value); setError(null); }} onKeyDown={e => e.key === "Enter" && runRecommendation()}
            placeholder="Ask OmniSense AI... e.g. 'How should I prepare for a viral eco-fashion trend across voice and in-store channels?'" maxLength={500}
            aria-label="Enter query for AI recommendation engine"
            style={{ flex: 1, padding: "14px 20px", borderRadius: 10, border: `1px solid ${error ? T.rose : T.border}`, background: T.bgElevated, color: T.text, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = error ? T.rose : T.accent} onBlur={e => e.target.style.borderColor = error ? T.rose : T.border} />
          <button onClick={runRecommendation} disabled={loading} aria-label="Run analysis" style={{ padding: "14px 28px", borderRadius: 10, border: "none", cursor: loading ? "wait" : "pointer", background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, color: "#000", fontWeight: 700, fontSize: 14, opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
            {loading ? "Analyzing..." : "⚡ Analyze"}
          </button>
        </div>
        {error && <div role="alert" style={{ marginTop: 10, fontSize: 12, color: T.rose, fontWeight: 500 }}>{error}</div>}
        <div style={{ marginTop: 8, fontSize: 11, color: T.textDim }}>{query.length}/500 characters</div>
      </div>
      {loading && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ width: 40, height: 40, margin: "0 auto 16px", borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: T.textMuted, fontSize: 14 }}>Analyzing across all 13 subsystems...</div>
        </div>
      )}
      {result && !loading && (
        <div style={{ display: "grid", gap: 20, animation: "slideIn 0.4s ease" }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.accent}30`, borderRadius: 12, padding: 24, boxShadow: glow(T.accent, 10) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, textTransform: "uppercase" }}>Strategic Recommendation</span>
              <Badge color={result.confidence > 0.8 ? T.accent : result.confidence > 0.6 ? T.amber : T.rose}>Confidence: {(result.confidence * 100).toFixed(0)}%</Badge>
            </div>
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.6 }}>{result.recommendation}</div>
            {result.signals?.length > 0 && (<div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>{result.signals.map((s, i) => <Badge key={i} color={T.blue}>{s}</Badge>)}</div>)}
          </div>
          {result.actions?.length > 0 && (
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 14, textTransform: "uppercase" }}>Recommended Actions</div>
              {result.actions.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < result.actions.length - 1 ? `1px solid ${T.border}` : "none", flexWrap: "wrap" }}>
                  <Badge color={a.priority === "high" ? T.rose : a.priority === "medium" ? T.amber : T.textMuted}>{a.priority}</Badge>
                  <span style={{ flex: 1, fontSize: 14, color: T.text, minWidth: 200 }}>{a.action}</span>
                  <Badge color={subsystemColors[a.subsystem] || T.textMuted}>{a.subsystem}</Badge>
                </div>))}
            </div>
          )}
          {result.predicted_impact && Object.keys(result.predicted_impact).length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${Math.min(Object.keys(result.predicted_impact).length, 4)}, 1fr)`, gap: 16 }}>
              {Object.entries(result.predicted_impact).map(([k, v]) => (
                <div key={k} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 22px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: T.textDim, textTransform: "uppercase", marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                </div>))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── ERROR BOUNDARY ───
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(err, info) { console.error("OmniSense Error Boundary:", err, info); }
  render() {
    if (this.state.hasError) {
      return React.createElement("div", { style: { padding: 40, textAlign: "center", background: T.bgCard, border: `1px solid ${T.rose}30`, borderRadius: 12, margin: 20 } },
        React.createElement("div", { style: { fontSize: 32, marginBottom: 12 } }, "⚠️"),
        React.createElement("div", { style: { fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 8 } }, "Subsystem Rendering Error"),
        React.createElement("div", { style: { fontSize: 13, color: T.textMuted, marginBottom: 16 } }, this.state.error?.message || "An unexpected error occurred."),
        React.createElement("button", { onClick: () => this.setState({ hasError: false, error: null }), style: { padding: "10px 24px", borderRadius: 8, border: "none", background: T.accent, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "Retry")
      );
    }
    return this.props.children;
  }
}

// ─── MAIN APP ───
export default function OmniSenseAI() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isMobile, isTablet } = useResponsive();
  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [isMobile]);
  useEffect(() => { const handleEsc = (e) => { if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false); }; window.addEventListener("keydown", handleEsc); return () => window.removeEventListener("keydown", handleEsc); }, [sidebarOpen]);

  const navGroups = [
    { label: "Core", items: [
      { key: "dashboard", label: "Command Center", icon: "⬡", color: T.text },
      { key: "ucig", label: "Intent Graph", icon: "🧠", color: T.rose },
      { key: "ai", label: "AI Engine", icon: "⚡", color: T.accent },
    ]},
    { label: "AI Subsystems", items: [
      { key: "cbfe", label: "Cross-Device", icon: "📱", color: T.blue },
      { key: "ppie", label: "Predictions", icon: "🎯", color: T.accent },
      { key: "iace", label: "AR Commerce", icon: "👓", color: T.purple },
      { key: "ssdfe", label: "Sentiment", icon: "📊", color: T.amber },
      { key: "ascoe", label: "Supply Chain", icon: "🔗", color: T.cyan },
    ]},
    { label: "V2 Innovations", items: [
      { key: "agentic", label: "Agentic AI", icon: "🤖", color: T.lime },
      { key: "memory", label: "Memory Layer", icon: "💾", color: T.indigo },
      { key: "voice", label: "Voice Commerce", icon: "🎙️", color: T.pink },
      { key: "sustain", label: "Sustainability", icon: "🌱", color: T.emerald },
      { key: "iot", label: "IoT Omnichannel", icon: "📡", color: T.orange },
      { key: "privacy", label: "Privacy Console", icon: "🛡️", color: T.teal },
      { key: "multimodal", label: "Multimodal AR", icon: "🔍", color: T.rose },
    ]},
  ];

  const renderView = () => {
    const p = { isMobile, isTablet };
    switch (activeView) {
      case "dashboard": return <DashboardOverview setActiveView={setActiveView} {...p} />;
      case "cbfe": return <CrossDeviceView {...p} />;
      case "ppie": return <PredictiveView {...p} />;
      case "iace": return <ARCommerceView {...p} />;
      case "ssdfe": return <SocialSentimentView {...p} />;
      case "ascoe": return <SupplyChainView {...p} />;
      case "ucig": return <IntentGraphView {...p} />;
      case "agentic": return <AgenticAIView {...p} />;
      case "memory": return <MemoryLayerView {...p} />;
      case "voice": return <VoiceCommerceView {...p} />;
      case "sustain": return <SustainabilityView {...p} />;
      case "iot": return <IoTOmnichannelView {...p} />;
      case "privacy": return <PrivacyConsoleView {...p} />;
      case "multimodal": return <MultimodalARView {...p} />;
      case "ai": return <AIRecommendationView {...p} />;
      default: return <DashboardOverview setActiveView={setActiveView} {...p} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", color: T.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes skeletonPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.borderActive}; }
        button:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
      `}</style>

      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 49 }} />}

      <nav role="navigation" aria-label="Main navigation" style={{
        width: 220, minWidth: 220, background: T.bgCard, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", padding: "20px 0",
        ...(isMobile ? { position: "fixed", left: sidebarOpen ? 0 : -240, top: 0, bottom: 0, zIndex: 50, transition: "left 0.3s ease", boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.4)" : "none" } : {}),
      }}>
        <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, fontSize: 16, fontWeight: 700, color: "#000" }}>O</div>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: -0.5 }}>OmniSense</div><div style={{ fontSize: 10, color: T.accent, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>AI Platform v2</div></div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "4px 10px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {navGroups.map(group => (
            <React.Fragment key={group.label}>
              <NavSection label={group.label} />
              {group.items.map(item => (
                <button key={item.key} onClick={() => { setActiveView(item.key); if (isMobile) setSidebarOpen(false); }}
                  aria-current={activeView === item.key ? "page" : undefined}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: activeView === item.key ? 600 : 500, background: activeView === item.key ? `${item.color}15` : "transparent", color: activeView === item.key ? item.color : T.textMuted, transition: "all 0.2s", textAlign: "left", width: "100%" }}>
                  <span aria-hidden="true" style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                </button>))}
            </React.Fragment>
          ))}
        </div>
        <div style={{ padding: "10px 20px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><Pulse color={T.accent} size={6} /><span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>13 Systems Online</span></div>
          <div style={{ fontSize: 10, color: T.textDim }}>v2.0.0 — Patent Pending</div>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: "auto", padding: isMobile ? 16 : 32 }}>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "8px 0" }}>
            <button onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: T.text, fontSize: 18, lineHeight: 1 }}>☰</button>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>OmniSense AI v2</div>
          </div>
        )}
        <div style={{ maxWidth: 1200, margin: "0 auto", animation: "slideIn 0.3s ease" }} key={activeView}>
          <ErrorBoundary key={activeView}>
            {renderView()}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
