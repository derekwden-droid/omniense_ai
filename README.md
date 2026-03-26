# OmniSense AI v2.0

**Unified Consumer Intent Graph Platform — 13 AI Subsystems for Autonomous Retail Personalization**

OmniSense AI is a production-grade dashboard demonstrating a unified AI platform for omnichannel retail. It simulates 13 interconnected AI subsystems powered by a temporal heterogeneous knowledge graph (UCIG) with 48.2M nodes across 8 node types. The platform includes live data visualization, an interactive D3.js force-directed graph, and a real AI recommendation engine powered by the Claude API.

![Platform Status](https://img.shields.io/badge/subsystems-13%20online-06d6a0)
![Version](https://img.shields.io/badge/version-2.0.0-1B4F72)
![React](https://img.shields.io/badge/react-18.3-61DAFB)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

### Core AI Subsystems (v1.0)
| Subsystem | Description | Key Metric |
|-----------|-------------|------------|
| **CBFE** — Cross-Device Fusion | Siamese neural network identity resolution across 5 device types | 97.3% accuracy |
| **PPIE** — Predictive Purchase | Transformer-based intent decay with category-specific curves | 94.1% accuracy |
| **IACE** — AR Commerce | Bidirectional telemetry (dwell, rotation, micro-expressions, screenshots) | +41% CTR lift |
| **SSDFE** — Social Sentiment | Viral Velocity Prediction Model across 6 platforms | 72h forecast lead |
| **ASCOE** — Supply Chain | Multi-horizon reinforcement learning (immediate/tactical/strategic) | -37% latency |
| **UCIG** — Intent Graph | Temporal heterogeneous knowledge graph with 8 node types | 2.1ms queries |

### v2.0 Innovation Subsystems
| Subsystem | Description | Key Metric |
|-----------|-------------|------------|
| **Agentic AI** | Autonomous shopping agents (cart recovery, price watch, reorder) | +28% conversion |
| **Memory Layer** | Three-stage episodic memory (retain, recall, reflect) | -43% abandonment |
| **Voice Commerce** | Ambient shopping across 4 channels with tone sentiment | +40% revenue |
| **Sustainability** | Eco-Score and Carbon tracking with green supply chain routing | 24.8 tons CO₂ saved |
| **IoT Omnichannel** | Beacon, camera, and smart mirror fusion from physical stores | 13.6% store conversion |
| **Privacy Console** | Dynamic ε differential privacy per regulation with audit trail | 99.2% compliance |
| **Multimodal AR** | Visual search, 3D body modeling, wardrobe integration | -57% returns |

### Platform Features
- **AI Engine** — Real Claude API integration for strategic recommendations across all 13 subsystems
- **Interactive UCIG** — D3.js force-directed graph with drag interaction and 8 color-coded node types
- **Live Dashboard** — Auto-refreshing charts (4s interval) with seeded deterministic data
- **Error Boundaries** — Subsystem-scoped fault isolation (one view crash doesn't affect the other 12)
- **Responsive Design** — Mobile drawer navigation, adaptive grid layouts, ARIA accessibility
- **Immutable Pipeline** — Copy-on-transform data operations preventing cross-subsystem corruption

---

## Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| **Node.js** | 18.0 or higher | `node --version` |
| **npm** | 9.0 or higher | `npm --version` |
| **Git** | 2.0 or higher | `git --version` |

> **Optional:** An [Anthropic API key](https://console.anthropic.com/settings/keys) is needed only for the **AI Engine** tab. All other 13 subsystem views work without it.

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/omnisense-ai.git
cd omnisense-ai
```

### 2. Install Dependencies

```bash
npm install
```

This installs React 18, Recharts, D3.js, and the Vite dev server.

### 3. Configure Environment (Optional — for AI Engine only)

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

> **How to get a key:** Go to [console.anthropic.com](https://console.anthropic.com/settings/keys) → API Keys → Create Key. The AI Engine uses `claude-sonnet-4-20250514`. You'll need credits on your Anthropic account.

> **Skip this step** if you don't need the AI Engine — every other view works without an API key.

### 4. Start the Dev Server

```bash
npm run dev
```

The app opens at **http://localhost:5173**. The Vite dev server proxies Claude API requests to avoid CORS issues.

### 5. Explore the Platform

Use the sidebar navigation (grouped into **Core**, **AI Subsystems**, and **V2 Innovations**) to explore all 13 subsystems. The **Command Center** dashboard shows an overview of all systems with clickable cards.

---

## Project Structure

```
omnisense-ai/
├── public/
│   └── favicon.svg            # OmniSense logo
├── src/
│   ├── main.jsx               # React entry point
│   └── App.jsx                # Complete OmniSense AI platform (1,371 lines)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML shell
├── LICENSE                    # MIT license
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite config with API proxy
└── README.md                  # This file
```

### Architecture Notes

The entire platform lives in a single `App.jsx` file by design — this serves as the **enabling disclosure** for the associated patent application and must remain self-contained. The file includes:

- **Design tokens** (lines 7–20) — Centralized color and style constants
- **Patent claims** (lines 22–37) — All 19 claim references with tooltips
- **Data generators** (lines 39–110) — Seeded random with zero-guard, validated inputs
- **Shared components** (lines 112–230) — StatCard, ChartCard, MiniBar, Badge, PatentBadge, ErrorBoundary
- **14 view components** (lines 232–1210) — Dashboard + 6 core + 7 v2 innovation views + AI Engine
- **Main app shell** (lines 1230–1371) — Grouped navigation, responsive layout, mobile drawer

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:5173 with hot reload and API proxy |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Production Build

```bash
npm run build
```

This generates static files in `dist/` that can be deployed to any static host.

### Deploy to GitHub Pages

1. Install the GitHub Pages plugin:
   ```bash
   npm install -D gh-pages
   ```

2. Add to `package.json` scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```

3. Add `base` to `vite.config.js`:
   ```js
   base: "/omnisense-ai/",
   ```

4. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

> **Note:** The AI Engine tab won't work on static hosts (GitHub Pages, Netlify, Vercel) without a backend proxy for the Anthropic API. All other views work perfectly as static files.

### Deploy to Vercel (with API Proxy)

For full functionality including the AI Engine, deploy to Vercel with a serverless API route:

1. Create `api/anthropic.js`:
   ```js
   export default async function handler(req, res) {
     const response = await fetch("https://api.anthropic.com/v1/messages", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "x-api-key": process.env.ANTHROPIC_API_KEY,
         "anthropic-version": "2023-06-01",
       },
       body: JSON.stringify(req.body),
     });
     const data = await response.json();
     res.status(response.status).json(data);
   }
   ```

2. Set `ANTHROPIC_API_KEY` in Vercel Environment Variables.

3. Update the fetch URL in `App.jsx` to `/api/anthropic`.

---

## How the AI Engine Works

The **AI Engine** tab sends queries to Claude via the Anthropic Messages API. The Vite dev server proxies requests from `/api/anthropic/*` to `https://api.anthropic.com/*` to avoid browser CORS restrictions.

**Request flow:**
```
Browser → localhost:5173/api/anthropic/v1/messages
       → Vite proxy → api.anthropic.com/v1/messages
       → Claude claude-sonnet-4-20250514 → JSON response
       → Parsed and rendered as recommendation cards
```

The prompt tells Claude about all 13 subsystems and asks for strategic recommendations in a structured JSON format with confidence scores, signals, actions, and predicted impact.

---

## Customization

### Adding a New Subsystem View

1. Create a new component in `App.jsx` following the existing pattern:
   ```jsx
   const MyNewView = ({ isMobile }) => {
     return (
       <div>
         <SectionHeader title="My New Subsystem" subtitle="Description" subsystem="NEW_KEY" />
         {/* Stats, charts, tables */}
       </div>
     );
   };
   ```

2. Add a patent claim entry to `PATENT_CLAIMS`:
   ```js
   NEW_KEY: { claim: "Claim 20", title: "...", desc: "..." },
   ```

3. Add a nav item to the appropriate group in `navGroups`.

4. Add a `case` in the `renderView()` switch.

### Changing the Color Theme

Edit the design tokens object `T` at the top of `App.jsx`. All components reference these tokens. The accent color (`#06d6a0`) is used for primary highlights, and each subsystem has its own color for visual distinction.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 | Component architecture, hooks, error boundaries |
| Charts | Recharts 2 | Area, Line, Bar, Radar, Composed, Pie charts |
| Graph | D3.js 7 | Force-directed UCIG visualization with drag |
| Build | Vite 6 | Dev server, HMR, API proxy, production builds |
| AI | Claude API | Real-time strategic recommendations |
| Styling | Inline CSS | Design token system, no external CSS dependencies |

---

## Patent Information

This codebase serves as the enabling disclosure for the OmniSense AI patent application. The accompanying patent proposal (v3.0) covers:

- **19 patent claims** (8 independent, 11 dependent)
- **13 AI subsystems** with quantified performance metrics
- **4 platform-level innovations** (deterministic simulation, error boundaries, immutable pipeline, adaptive responsive architecture)

See `OmniSense_AI_Patent_Proposal_v3.docx` for the full filing.

---

## Troubleshooting

### `npm run dev` fails with "module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Charts render blank or flickering
The dashboard uses seeded random data that refreshes every 4 seconds. If charts appear empty, wait a moment for the initial data generation. If they flicker excessively, check that your browser supports `requestAnimationFrame`.

### AI Engine returns "API key not configured"
1. Make sure you have a `.env` file (not just `.env.example`)
2. Verify the key starts with `sk-ant-`
3. Restart the dev server after changing `.env` (`Ctrl+C` then `npm run dev`)

### AI Engine returns 401 or 403
- Your API key may be invalid or expired — regenerate at [console.anthropic.com](https://console.anthropic.com/settings/keys)
- Check that your account has available credits

### Mobile sidebar won't close
Press `Escape` or tap the backdrop overlay. The sidebar uses a combination of click-outside and keyboard handlers.

### D3 graph doesn't resize
The graph uses a debounced resize listener (300ms). Try resizing the window and waiting a moment. If the graph still doesn't update, switching to another view and back will re-render it.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-subsystem`
3. Commit changes: `git commit -m "Add new subsystem"`
4. Push: `git push origin feature/new-subsystem`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.
