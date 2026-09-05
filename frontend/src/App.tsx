import { useEffect, useState } from "react";
import { api, demoMode } from "./api";
import {
  Button,
  FormControl,
  Label,
  Link,
  Select,
  Spinner,
} from "@primer/react";
import {
  AlertIcon,
  HistoryIcon,
  InfoIcon,
  LinkExternalIcon,
  PlayIcon,
  PulseIcon,
} from "@primer/octicons-react";

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
    <Link className="citation" href={`#${id}`} onClick={() => setFilter("all")}>
      {id.endsWith("-r1") ? "Runbook v1.0" : `Event ${id.split("-e")[1]}`}
    </Link>
  );
  const visibleEvents =
    s?.events.filter((event) => filter === "all" || event.level === filter) ??
    [];
  return (
    <>
      <a className="skip" href="#workspace">
        Skip to investigation
      </a>
      <header className="globalbar">
        <a className="brand" href="#workspace">
          <PulseIcon size={20} aria-hidden="true" />
          Signal
        </a>
        <span className="global-divider" aria-hidden="true">
          /
        </span>
        <span className="product-name">Investigations</span>
        <Link
          className="source-link"
          href="https://github.com/TravisVercueil/incident-investigation-ai"
          target="_blank"
          rel="noreferrer"
        >
          Source code <LinkExternalIcon size={14} aria-hidden="true" />
        </Link>
        {!demoMode && (
          <span className="environment-label">
            Local application · synthetic telemetry
          </span>
        )}
      </header>
      <nav className="scenario-bar" aria-label="Incident scenarios">
        {scenarios.map((item) => (
          <Button
            key={item.id}
            className="scenario-button"
            disabled={busy}
            aria-current={selected === item.id ? "true" : undefined}
            onClick={() => choose(item.id)}
          >
            {item.title}
          </Button>
        ))}
      </nav>
      <main id="workspace" tabIndex={-1}>
        {demoMode && (
          <p className="sandbox-note">
            <InfoIcon size={14} aria-hidden="true" />
            Interactive sandbox • simulated telemetry • no live AI calls
          </p>
        )}
        {error && (
          <div className="error-message" role="alert">
            <AlertIcon size={16} aria-hidden="true" />
            <span>{error}</span>
            {!s && (
              <Button size="small" onClick={() => void load()}>
                Retry connection
              </Button>
            )}
          </div>
        )}
        {!s ? (
          <section className="workspace-loading" aria-live="polite">
            <h1>Incident investigation</h1>
            {!error && (
              <>
                <Spinner size="small" />
                <p>Loading the synthetic scenario library…</p>
              </>
            )}
          </section>
        ) : (
          <>
            <div className="workspace-toolbar">
              <div className="scenario-heading">
                <div className="title-line">
                  <h1>{s.title}</h1>
                  <span className="service">{s.service}</span>
                  <Label>Read-only</Label>
                </div>
                <p className="description">{s.description}</p>
                <p className="window">
                  12 Aug 2026{" "}
                  <span>
                    09:00-{s.events[s.events.length - 1].time.slice(11, 16)} UTC
                  </span>
                  <span>{s.events.length} events + 1 runbook</span>
                </p>
              </div>
              <div className="engine-controls" aria-label="Analysis controls">
                <FormControl disabled={busy}>
                  <FormControl.Label htmlFor="mode">
                    Investigation engine
                  </FormControl.Label>
                  <Select
                    id="mode"
                    value={mode}
                    onChange={(e) =>
                      setMode(e.target.value as "offline" | "ai")
                    }
                  >
                    <Select.Option value="offline">
                      Offline · deterministic baseline
                    </Select.Option>
                    {!demoMode && (
                      <Select.Option value="ai">
                        AI · OpenAI{" "}
                        {aiConfigured ? "(configured)" : "(not configured)"}
                      </Select.Option>
                    )}
                  </Select>
                </FormControl>
                <Button
                  className="investigate-button"
                  variant="primary"
                  leadingVisual={busy ? undefined : PlayIcon}
                  disabled={busy || (mode === "ai" && !aiConfigured)}
                  onClick={() => void investigate()}
                >
                  {busy ? "Investigating…" : "Investigate scenario"}
                </Button>
                <p className="engine-help">
                  {mode === "offline"
                    ? "Inspectable rules. No model call."
                    : "One bounded model call. Provider failures are shown explicitly."}
                </p>
              </div>
            </div>
            <div className="workbench">
              <section
                className="evidence-column"
                aria-label="Scenario evidence"
              >
                <div className="event-log">
                  <div className="panel-heading">
                    <h2>
                      Event timeline <span>Chronological</span>
                    </h2>
                    <Select
                      aria-label="Filter timeline"
                      size="small"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <Select.Option value="all">All levels</Select.Option>
                      <Select.Option value="warning">Warnings</Select.Option>
                      <Select.Option value="error">Errors</Select.Option>
                      <Select.Option value="info">Info</Select.Option>
                    </Select>
                  </div>
                  <div className="log-scroll">
                    <table className="log-table">
                      <thead>
                        <tr>
                          <th scope="col">Time (UTC)</th>
                          <th scope="col">Level</th>
                          <th scope="col">Event</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleEvents.map((event) => (
                          <tr id={event.id} key={event.id} tabIndex={-1}>
                            <td>
                              <time dateTime={event.time}>
                                {event.time.slice(11, 19)}
                              </time>
                            </td>
                            <td>
                              <span
                                className={`severity severity-${event.level}`}
                              >
                                {event.level === "warning"
                                  ? "WARN"
                                  : event.level.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {event.message}
                              <code>{event.id}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!visibleEvents.length && (
                      <p className="empty-filter">
                        No {filter} events in this scenario.
                      </p>
                    )}
                  </div>
                </div>
                <article className="runbook" id={s.runbook.id} tabIndex={-1}>
                  <div className="panel-heading">
                    <h2>Runbook: {s.runbook.title}</h2>
                  </div>
                  <div className="runbook-body">
                    <p>{s.runbook.text}</p>
                    <code>{s.runbook.id}</code>
                  </div>
                </article>
              </section>
              <section
                className="investigation-brief"
                aria-label="Investigation findings"
                aria-live="polite"
                aria-busy={busy}
              >
                <div className="panel-heading">
                  <h2>Investigation brief</h2>
                  <span className="saved-state">
                    {active ? `Saved #${active.id}` : "Awaiting run"}
                  </span>
                </div>
                {active ? (
                  <div className="brief-body">
                    <section className="hypothesis">
                      <h3>
                        {active.result.diagnosis === "inconclusive"
                          ? "Inconclusive"
                          : "Working hypothesis"}
                      </h3>
                      <p>{active.result.hypothesis}</p>
                      <div className="citations">
                        {active.result.citations.map((id) => (
                          <span key={id}>{citation(id)}</span>
                        ))}
                      </div>
                      <p className="analysis-source">
                        {active.result.source} ·{" "}
                        {new Date(active.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </section>
                    <section>
                      <h3>Observed in the evidence</h3>
                      <ul className="observations">
                        {active.result.observations.map((observation, i) => (
                          <li key={i}>
                            {observation.quote} {citation(observation.citation)}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h3>What we still need</h3>
                      <ul>
                        {active.result.missing_evidence.map((text, i) => (
                          <li key={i}>{text}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h3>Read-only next steps</h3>
                      <ul>
                        {active.result.next_steps.map((text, i) => (
                          <li key={i}>{text}</li>
                        ))}
                      </ul>
                    </section>
                    <p className="evidence-limit">
                      Exact observation quotes and citation IDs are validated.
                      Hypothesis relevance still requires human review. No
                      remediation is executed.
                    </p>
                  </div>
                ) : (
                  <div className="empty-brief">
                    <PulseIcon size={32} aria-hidden="true" />
                    <h3>No investigation yet</h3>
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
            <section
              className="recent-investigations"
              aria-label="Recent investigations"
            >
              <div className="panel-heading">
                <h2>
                  <HistoryIcon size={16} aria-hidden="true" />
                  Recent investigations
                </h2>
                <span className="history-note">
                  {demoMode
                    ? "Saved in this browser tab"
                    : "Saved to this browser session"}
                </span>
              </div>
              {!history.length ? (
                <p className="empty-history">
                  Run a scenario to save your first investigation.
                </p>
              ) : (
                <div className="history-scroll">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th scope="col">Scenario</th>
                        <th scope="col">Service</th>
                        <th scope="col">Engine</th>
                        <th scope="col">Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 6).map((row) => (
                        <tr
                          key={row.id}
                          aria-current={
                            active?.id === row.id ? "true" : undefined
                          }
                        >
                          <td>
                            <Button
                              variant="invisible"
                              size="small"
                              className="history-button"
                              disabled={busy}
                              onClick={() => {
                                choose(row.scenario);
                                setActive(row);
                                setMode(row.mode as "ai" | "offline");
                              }}
                            >
                              {
                                scenarios.find(
                                  (item) => item.id === row.scenario,
                                )?.title
                              }
                            </Button>
                          </td>
                          <td>
                            <code>
                              {
                                scenarios.find(
                                  (item) => item.id === row.scenario,
                                )?.service
                              }
                            </code>
                          </td>
                          <td>{row.mode === "ai" ? "AI" : "Offline"}</td>
                          <td>
                            <time dateTime={row.created_at}>
                              {new Date(row.created_at).toLocaleString()}
                            </time>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <footer>
              <span>Built by Travis Vercueil</span>
              <span>Python · Django · TypeScript · React</span>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
