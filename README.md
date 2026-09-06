# 🛡️ AP Payment Fraud Sentinel

> **Autonomous Accounts Payable fraud prevention** — every invoice screened through a 7-stage pipeline of deterministic risk signals, a tri-agent AI swarm, and out-of-band voice verification before a payment moves. Built on the RocketRide visual pipeline architecture.

[![RocketRide Pipeline](https://img.shields.io/badge/RocketRide-Visual%20Pipe-00D2FF?style=for-the-badge&logo=rocket)](https://rocketride.org)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## What it does

Sentinel Payments screens inbound invoice PDFs and vendor emails before disbursement:

1. **Intake** — PDF invoices and EML emails ingested; malformed files quarantined, never crash the batch
2. **Extraction** — invoice facts pulled via pdfplumber/OCR and normalized to USD
3. **Grounding** — facts checked against a 60-record vendor master and 480-row payment history (per-vendor μ/σ baseline)
4. **Signals** — six deterministic detectors: domain lookalike (Levenshtein), 3-sigma amount anomaly, bank-change timing, duplicate invoices, first-time vendor, SAR threshold skirting
5. **Agents** — a 3-agent swarm (BEC Analyst, Vendor Verifier, Case Builder) with manager arbitration; ties break to *hold*
6. **Verification** — automated call script (TTS → ASR) to the vendor number **on file, never from the suspicious email**
7. **Gate** — clean invoices auto-release; holds wait for a human controller decision with the full evidence pack

Composite risk score is a weighted sum of fired signals (0.00–1.00). Holds trigger at **0.40** — the threshold and weights are frozen, never tuned after evaluation.

## The product

A single dark-glass design system across both surfaces:

- **Public portal** — marketing landing with an interactive attack sandbox (spoofed BEC domain, 3-sigma spike, clean invoice), a live ROI exposure model, and the weighted signal matrix
- **Operations console** — command-center dashboard (fraud-loss hero metric with run sparkline, detection ring gauge, actionable holds queue), animated **pipeline trace with live case activity**, cases queue with inline risk meters, a **master–detail batch ledger** with per-run cost breakdowns, a **vendor master registry** with grounding profiles and payment-history charts, and a fully data-driven **evidence sheet** per case
- **⌘K / Ctrl+K command palette** — navigate, run batches, and jump straight to any case

Everything on screen is real pipeline output: no mock data, no hardcoded demo content.

> **Honesty note:** the bundled dataset is 100% synthetic (seed 42 — no real PII, banking details, or domains). Detection metrics shown in the UI are computed against the synthetic ground truth and are demonstration numbers, not production benchmarks. The "verification call" is a TTS→ASR simulation; no live telephony is placed.

## Quick start

```bat
:: Windows
setup.bat    :: one-time: installs deps, creates + seeds the database
start.bat    :: every run: starts all 3 services and opens the dashboard
```

```bash
# macOS / Linux
./setup.sh
./start.sh
```

Then open **http://localhost:3000** and click **Run Batch Audit** to screen the 141-invoice demo queue.

| Service | Port | What it is |
|---|---|---|
| Dashboard (Next.js) | 3000 | Public portal + ops console |
| Pipeline worker (Python/aiohttp) | 3030 | 7-stage screening engine + HTTP API |
| Trace service (Bun/socket.io) | 3003 | Live pipeline events to the dashboard |

**No API keys required** — with no `ROCKETRIDE_API_KEY` set, everything runs fully locally: deterministic signals, template-fallback agents, and prerecorded verification audio. Optional: local [Ollama](https://ollama.com) (`llama3.2`) powers the agent narratives; a RocketRide key enables the cloud pipeline path.

Use your own data: **Invoice Ingestion** accepts your own PDF/EML/CSV files, and the vendor master reloads from uploaded CSVs.

## Repository layout

```
├── src/                    # Next.js dashboard (App Router, Tailwind v4, shadcn/ui)
│   ├── app/                # Routes: landing, console views, /privacy, /terms, /api/*
│   └── components/         # landing/, dashboard/, views/, console/, ui/
├── worker/                 # Python pipeline: local_executor, signals, agents, call, db
│   ├── prompts/            # Agent system prompts + call script
│   └── utils/              # Domain check, timing, stats, call analysis
├── pipelines/              # 8 RocketRide .pipe pipeline definitions (7 stages + master)
├── mini-services/pipeline-ws/  # Socket.io trace broadcaster (port 3003)
├── data/                   # Synthetic dataset (seed 42) — invoices, emails, CSVs
├── prisma/                 # SQLite schema (Vendors, Payments, Cases, Decisions, Runs)
├── scripts/                # Dataset generation + DB seeding
└── db/                     # custom.db (created by setup)
```

## Tech stack

**Frontend:** Next.js (App Router), React 19, Tailwind CSS v4, shadcn/ui, Framer Motion, TanStack Query, Zustand, Recharts, socket.io-client
**Pipeline:** Python 3.10+, aiohttp, pdfplumber, RocketRide SDK (optional)
**AI:** z-ai-web-dev-sdk / OpenAI-compatible LLM route (optional), Ollama fallback (optional), Whisper-style ASR + TTS routes (optional)
**Data:** SQLite via Prisma (dashboard) + raw sqlite3 (worker)

## License

MIT — see [LICENSE](LICENSE).
