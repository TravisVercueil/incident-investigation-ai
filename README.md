# Signal — incident investigation workspace

**An evidence-led workspace that separates observations, hypotheses and missing signals.** Built by [Travis Vercueil](https://github.com/TravisVercueil) with Python, Django, TypeScript and React.

Investigate four reproducible synthetic incidents: a webhook backlog, a failing dependency, duplicate delivery and insufficient telemetry. Follow findings back to timestamped events and a versioned runbook. Nothing connects to production or executes remediation.

## Try it

**[Open the live sandbox →](https://incident-investigation-ai.vercel.app)**

The public interactive sandbox runs entirely in the browser. It uses bundled synthetic telemetry and precomputed deterministic baseline results, **not live AI calls**. It supports scenario selection, investigation briefs, event filtering, citation navigation and session history. The full local application adds a Django API, persisted investigations, PostgreSQL or SQLite and optional real OpenAI analysis.

### Local full application

Requires Python 3.12 and Node.js 22.12+ (Node 24 used in development). No provider key, account or Docker is required for offline mode.

```sh
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.lock
python backend/manage.py migrate
python backend/manage.py runserver 127.0.0.1:8103
```

In a second terminal:

```sh
npm --prefix frontend ci
npm --prefix frontend run dev
```

Open **http://127.0.0.1:5103**. Choose a scenario and click **Investigate scenario**. Vite proxies `/api` to Django. SQLite is the zero-configuration local store; investigations are scoped to the anonymous browser session.

### Three-minute walkthrough

1. **Webhook backlog:** inspect the concurrency change, growing queue and healthy downstream endpoint. Run the offline baseline and follow an Event citation. The brief proposes reduced capacity as a hypothesis; it does not claim a proven cause.
2. **Failing dependency:** inspect the two correlated timeout traces. The dependency's internal cause remains explicitly unknown.
3. **Duplicate delivery:** compare event `evt-42` against two committed action IDs. The missing idempotency control explains a plausible failure path.
4. **Insufficient evidence:** the baseline abstains. Notice the missing trace/deployment evidence rather than an invented diagnosis.
5. Open a saved investigation in Recent investigations below the workspace. Refresh to verify session history persists. In the public sandbox, history lasts for the browser tab session.

### PostgreSQL demo

```sh
cp .env.example .env
docker compose up --build
```

Run the frontend separately as above. Compose starts PostgreSQL 17 with a health check and a Django development server bound to localhost:8103. This is a **local demonstration configuration**, not a production deployment. `docker compose down` preserves the database volume; `docker compose down -v` deliberately deletes it.

### Optional live AI

Set `OPENAI_API_KEY` and `OPENAI_MODEL` in the server's environment, restart Django, and explicitly choose **AI · OpenAI**. Use a model supporting Chat Completions JSON mode and `max_completion_tokens`. The application does not automatically load `.env`; Compose loads it for its services, while a directly launched Django server needs exported variables.

```sh
export OPENAI_API_KEY='your-key'
export OPENAI_MODEL='your-compatible-model'
python backend/manage.py runserver 127.0.0.1:8103
```

One user action makes at most one request with a 25-second timeout, 1,800 output-token cap and 64 KiB response limit. Only synthetic scenario evidence is sent; reference answers are withheld. Provider errors, malformed results, invented citations and altered observation quotes fail explicitly without saving an investigation. **There is no silent offline fallback.** Keys never enter the frontend.

## Architecture

```text
React + TypeScript UI
  ├─ public sandbox → bundled synthetic JSON → browser session storage
  └─ local full app → Django JSON API → session-scoped investigations
                           ├─ inspectable deterministic baseline
                           ├─ optional OpenAI request + result validation
                           └─ SQLite locally / PostgreSQL in Compose
```

| Decision                            | Reason and trade-off                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Django without a REST framework     | Two endpoints, framework sessions, CSRF and ORM are sufficient.                                                                                     |
| React + Vite + Primer React         | Official GitHub Primer Product components, semantic dark-theme tokens and a compact investigation workbench.                                        |
| Fixed scenario fixtures             | Repeatable failure investigation without unnecessary cloud infrastructure. No claim of live observability integration.                              |
| Synchronous bounded model call      | Simple single-user demo. A job queue becomes useful with multi-user workloads or longer analysis.                                                   |
| Exact quote and citation validation | Makes observations auditable. It does **not** establish that a hypothesis is correct or its citations are relevant. Human review remains necessary. |
| Explicit offline baseline           | Usable without credentials; intentionally narrow rules, not a general incident reasoning system.                                                    |

Telemetry, runbooks and expected outcomes live in `backend/investigations/scenarios.py`. The baseline uses signal rules for the diagnostic label; missing-evidence prompts and next steps are scenario-authored guidance. The static export is generated with `python scripts/export_sandbox.py` and committed so public deployments need no Python runtime.

## Verification

```sh
python backend/manage.py test investigations
python backend/manage.py check
python backend/manage.py makemigrations --check --dry-run
python scripts/evaluate.py
npm --prefix frontend ci
npm --prefix frontend run build
VITE_DEMO_MODE=true npm --prefix frontend run build
```

The backend tests cover all four known faults, unknown-signal abstention, incorrect citations, altered observation quotes, malformed/provider failure paths, explicit mode selection, CSRF protection and session isolation. See [evaluation results and limits](docs/EVALUATION.md).

To run a **live** four-scenario evaluation (makes billed API calls with your configured model):

```sh
python scripts/evaluate.py --ai
```

## Deploy the public sandbox

Import this repository into Vercel with **Root Directory `frontend`**, install `npm ci`, build `npm run build`, output `dist`, and environment variable **`VITE_DEMO_MODE=true`**. No API keys, backend or database are needed. The sandbox visibly identifies simulated telemetry and no live AI calls.

## Scope and limitations

- Four authored fixtures are a regression demonstration, not a held-out benchmark or a real-world accuracy claim.
- AI structural validation rejects fabricated observations; it cannot guarantee causal reasoning or safe suggestions. Suggestions are plain text and never executable tools.
- Anonymous sessions isolate local history but are not account authentication. The local API has no production rate limits, tenant management or operational data retention policy. Do not expose it as a shared public service.
- No live collectors, distributed traces, deployment integrations or infrastructure changes are implemented. The trace IDs are synthetic evidence.
- The public sandbox has no backend persistence, uploads, provider credentials or real AI execution. Full backend behavior is demonstrated locally.

[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [MIT license](LICENSE)

The interface follows [the documented design system and reference analysis](DESIGN.md). The source is available in [this repository](https://github.com/TravisVercueil/incident-investigation-ai).
