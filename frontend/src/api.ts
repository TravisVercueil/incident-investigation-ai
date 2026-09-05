import sandbox from "./sandbox.json";
export const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
const storageKey = "signal-investigations-v1";
let demoHistory: unknown[] = [];

// The public sandbox never contacts the API or any AI provider.
export async function api(path: string, init?: RequestInit): Promise<Response> {
  if (!demoMode) return fetch(`/api/${path}`, init);
  if (path === "scenarios")
    return Response.json({
      ...sandbox,
      csrfToken: "sandbox",
      aiConfigured: false,
    });
  if (init?.method !== "POST") {
    try {
      const stored: unknown = JSON.parse(
        sessionStorage.getItem(storageKey) || "[]",
      );
      if (Array.isArray(stored)) demoHistory = stored;
    } catch {
      /* Private browsing/storage denial keeps history in memory. */
    }
    return Response.json({ investigations: demoHistory });
  }
  const input = JSON.parse(String(init.body));
  if (input.mode !== "offline" || !(input.scenario in sandbox.results))
    return Response.json(
      { error: "The public sandbox only supports offline fixture analysis." },
      { status: 400 },
    );
  const row = {
    id: Date.now(),
    scenario: input.scenario,
    mode: "offline",
    created_at: new Date().toISOString(),
    result: sandbox.results[input.scenario as keyof typeof sandbox.results],
  };
  demoHistory = [row, ...demoHistory].slice(0, 20);
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(demoHistory));
  } catch {
    /* Ephemeral results still work without browser storage. */
  }
  return Response.json(row, { status: 201 });
}
