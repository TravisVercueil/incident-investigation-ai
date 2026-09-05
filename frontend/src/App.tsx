import { useEffect, useState } from "react";
import { api, demoMode } from "./api";

type Event = { id: string; time: string; level: string; message: string };
type Scenario = {
  id: string;
  title: string;
  service: string;
  description: string;
  events: Event[];
  runbook: { id: string; title: string; text: string; version: string };
};
type Result = {
  diagnosis: string;
  hypothesis: string;
  citations: string[];
  observations: { citation: string; quote: string }[];
  missing_evidence: string[];
  next_steps: string[];
  source: string;
};
type Investigation = {
  id: number;
  scenario: string;
  mode: string;
  result: Result;
  created_at: string;
};

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState("backlog");
  const [mode, setMode] = useState<"offline" | "ai">("offline");
  const [csrf, setCsrf] = useState("");
  const [aiConfigured, setAiConfigured] = useState(false);
  const [history, setHistory] = useState<Investigation[]>([]);
  const [active, setActive] = useState<Investigation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const s = scenarios.find((item) => item.id === selected);
  async function load() {
    setError("");
    try {
      const response = await api("scenarios");
      if (!response.ok)
        throw new Error(
          "Unable to load the workspace. Check that the Django API is running on port 8103.",
        );
      const data = await response.json();
      setScenarios(data.scenarios);
      setCsrf(data.csrfToken);
      setAiConfigured(data.aiConfigured);
      const saved = await api("investigations");
      if (!saved.ok) throw new Error("Unable to load saved investigations.");
      setHistory((await saved.json()).investigations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Workspace unavailable.");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function choose(id: string) {
    setSelected(id);
    setActive(null);
    setFilter("all");
    setError("");
  }
  async function investigate() {
    setBusy(true);
    setError("");
    try {
      const response = await api("investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        body: JSON.stringify({ scenario: selected, mode }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Investigation failed. Please retry.");
      setActive(result);
      setHistory((items) => [result, ...items].slice(0, 20));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Investigation failed.");
    } finally {
      setBusy(false);
    }
  }
  const citation = (id: string) => (
    <a className="citation" href={`#${id}`} onClick={() => setFilter("all")}>
      {id.endsWith("-r1") ? "Runbook v1.0" : `Event ${id.split("-e")[1]}`}
    </a>
  );
  return (
    <>
      <a className="skip" href="#workspace">
        Skip to investigation
      </a>
      <header className="topbar">
        <a className="brand" href="#workspace">
          <span className="brand-symbol">S</span>signal
          <span className="brand-detail">/ incident workspace</span>
        </a>
        <span className="simulation">
          <i /> Synthetic environment
        </span>
        <a
          className="repo-link"
          href="mailto:travisvercueil@gmail.com?subject=Incident%20investigation%20source%20access"
        >
          Source on request ↗
        </a>
      </header>
      {demoMode && (
        <div className="sandbox-banner">
          Interactive sandbox • simulated telemetry • no live AI calls{" "}
          <span>
            Full Django + PostgreSQL application available in the repository.
          </span>
        </div>
      )}
      <div className="shell">
        <aside className="sidebar">
          <p className="eyebrow">SCENARIO LIBRARY</p>
          <h2>Follow the evidence.</h2>
          <p className="muted intro-small">
            Four reproducible incidents. No production connections.
          </p>
          <nav aria-label="Incident scenarios">
            {scenarios.map((item, i) => (
              <button
                key={item.id}
                disabled={busy}
                aria-current={selected === item.id ? "true" : undefined}
                className={`scenario ${selected === item.id ? "selected" : ""}`}
                onClick={() => choose(item.id)}
              >
                <span className="scenario-number">0{i + 1}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.service}</small>
                </span>
                <span className="arrow">↗</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="eyebrow">BOUNDARIES BY DESIGN</span>
            <p>
              Read-only investigation.
              <br />
              Cited observations.
              <br />
              Hypotheses stay hypotheses.
            </p>
          </div>
          <div className="history">
            <p className="eyebrow">RECENT INVESTIGATIONS</p>
            {!history.length ? (
              <p className="muted">
                Run a scenario to save your first investigation.
              </p>
            ) : (
              history.slice(0, 6).map((row) => (
                <button
                  disabled={busy}
                  key={row.id}
                  onClick={() => {
                    choose(row.scenario);
                    setActive(row);
                    setMode(row.mode as "ai" | "offline");
                  }}
                >
                  <span>
                    {scenarios.find((item) => item.id === row.scenario)?.title}
                  </span>
                  <small>
                    #{row.id} · {row.mode === "ai" ? "AI" : "Offline"}
                  </small>
                </button>
              ))
            )}
          </div>
        </aside>
        <main id="workspace" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                INVESTIGATION / {s ? `0${scenarios.indexOf(s) + 1}` : "—"}
              </p>
              <h1>{s?.title || "Incident investigation"}</h1>
              <p className="subtitle">
                {s?.description || "Loading the synthetic scenario library…"}
              </p>
            </div>
            <span className="read-only">Read-only</span>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}
              {!s && (
                <button onClick={() => void load()}>Retry connection</button>
              )}
            </div>
          )}
          {s && (
            <>
              <div className="context-strip">
                <div>
                  <span>SERVICE</span>
                  <strong>{s.service}</strong>
                </div>
                <div>
                  <span>WINDOW · UTC</span>
                  <strong>
                    12 Aug 2026 · 09:00–
                    {s.events[s.events.length - 1].time.slice(11, 16)}
                  </strong>
                </div>
                <div>
                  <span>EVIDENCE</span>
                  <strong>{s.events.length} events + 1 runbook</strong>
                </div>
                <div>
                  <span>ENVIRONMENT</span>
                  <strong>Simulated telemetry</strong>
                </div>
              </div>
              <section
                className="analysis-controls"
                aria-label="Analysis controls"
              >
                <div>
                  <label htmlFor="mode">Investigation engine</label>
                  <select
                    id="mode"
                    value={mode}
                    disabled={busy}
                    onChange={(e) =>
                      setMode(e.target.value as "offline" | "ai")
                    }
                  >
                    <option value="offline">
                      Offline · deterministic baseline
                    </option>
                    {!demoMode && (
                      <option value="ai">
                        AI · OpenAI{" "}
                        {aiConfigured ? "(configured)" : "(not configured)"}
                      </option>
                    )}
                  </select>
                  <p>
                    {mode === "offline"
                      ? "Inspectable rules, no model call. Results are saved to this browser session."
                      : "One bounded model call. Only synthetic evidence is sent. Provider failures are shown explicitly."}
                  </p>
                </div>
                <button
                  className="primary"
                  disabled={busy || (mode === "ai" && !aiConfigured)}
                  onClick={() => void investigate()}
                >
                  {busy ? "Investigating…" : "Investigate scenario"}
                  <span aria-hidden="true">↗</span>
                </button>
              </section>
              <div className="work-grid">
                <section className="evidence-panel">
                  <div className="section-title">
                    <h2>Event timeline</h2>
                    <label className="filter">
                      Show
                      <select
                        aria-label="Filter timeline"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">All levels</option>
                        <option value="warning">Warnings</option>
                        <option value="error">Errors</option>
                        <option value="info">Info</option>
                      </select>
                    </label>
                  </div>
                  <div className="timeline">
                    {s.events
                      .filter((e) => filter === "all" || e.level === filter)
                      .map((event) => (
                        <article
                          key={event.id}
                          id={event.id}
                          className={`event event-${event.level}`}
                          tabIndex={-1}
                        >
                          <div className="event-meta">
                            <time>{event.time.slice(11, 19)} UTC</time>
                            <span className={`level ${event.level}`}>
                              {event.level}
                            </span>
                          </div>
                          <p>{event.message}</p>
                          <code>{event.id}</code>
                        </article>
                      ))}
                    {!s.events.some(
                      (e) => filter === "all" || e.level === filter,
                    ) && (
                      <p className="empty-filter">
                        No {filter} events in this scenario.
                      </p>
                    )}
                  </div>
                  <article className="runbook" id={s.runbook.id} tabIndex={-1}>
                    <p className="eyebrow">VERSIONED RUNBOOK</p>
                    <h3>{s.runbook.title}</h3>
                    <p>{s.runbook.text}</p>
                    <code>{s.runbook.id}</code>
                  </article>
                </section>
                <section
                  className="findings-panel"
                  aria-label="Investigation findings"
                  aria-live="polite"
                  aria-busy={busy}
                >
                  <div className="section-title">
                    <h2>Investigation brief</h2>
                    <span className="result-status">
                      {active ? `SAVED #${active.id}` : "AWAITING RUN"}
                    </span>
                  </div>
                  {active ? (
                    <>
                      <div className="finding-summary">
                        <p className="eyebrow">
                          {active.result.diagnosis === "inconclusive"
                            ? "INCONCLUSIVE"
                            : "WORKING HYPOTHESIS"}
                        </p>
                        <h3>{active.result.hypothesis}</h3>
                        <div className="citations">
                          {active.result.citations.map((id) => (
                            <span key={id}>{citation(id)}</span>
                          ))}
                        </div>
                        <p className="source">
                          {active.result.source} ·{" "}
                          {new Date(active.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="findings-body">
                        <h3>Observed in the evidence</h3>
                        {active.result.observations.map((o, i) => (
                          <blockquote key={i}>
                            <p>{o.quote}</p>
                            {citation(o.citation)}
                          </blockquote>
                        ))}
                        <h3>What we still need</h3>
                        <ul>
                          {active.result.missing_evidence.map((text, i) => (
                            <li key={i}>{text}</li>
                          ))}
                        </ul>
                        <h3>Read-only next steps</h3>
                        <ul>
                          {active.result.next_steps.map((text, i) => (
                            <li key={i}>{text}</li>
                          ))}
                        </ul>
                        <p className="disclaimer">
                          Exact observation quotes and citation IDs are
                          validated. Hypothesis relevance still requires human
                          review. No remediation is executed.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="empty-brief">
                      <span className="empty-icon" aria-hidden="true">
                        ⌕
                      </span>
                      <h3>
                        Start with a question.
                        <br />
                        Finish with evidence.
                      </h3>
                      <p>
                        Run this scenario to separate observed facts, plausible
                        causes and missing signals.
                      </p>
                      <ol>
                        <li>Inspect the timestamped events</li>
                        <li>Choose offline baseline or configured AI</li>
                        <li>Follow each finding back to its source</li>
                      </ol>
                    </div>
                  )}
                </section>
              </div>
              <footer>
                Built by Travis Vercueil{" "}
                <span>Python · Django · TypeScript · React</span>
              </footer>
            </>
          )}
        </main>
      </div>
    </>
  );
}
