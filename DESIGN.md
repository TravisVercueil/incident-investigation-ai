# Signal product interface

## Design read

A developer investigation workbench for engineers, built with **official Primer Product React**. Predictable structure, dense readable evidence, restrained operational controls. Design variance 3, motion 1, density 7. This is an enterprise application: the requested product treatment overrides landing-page heroes, photography, decorative animations and promotional copy defaults.

## Sources and how they apply

- [Taste skill](https://tasteskill.dev): audit-first redesign, official system rather than copied styling, contextual rules, explicit responsive states, no generic visual filler. Its scope explicitly excludes dashboards; its landing-page composition requirements do not apply here.
- [Image-to-code skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/image-to-code-skill/SKILL.md): generated reference inspected before implementation; retain its structure, hierarchy and spacing, not its invented content.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) and [current review rules](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): labels, semantic actions, focus visibility, async states, readable long text, constrained overflow and reduced motion.
- [Awesome DESIGN.md catalogue](https://github.com/VoltAgent/awesome-design-md): source-backed visual specification structure. The inspected catalogue has no GitHub-specific entry; no third-party GitHub design analysis is claimed. Official Primer documentation is the implementation authority.
- [Primer React setup](https://primer.style/product/getting-started/react/), [official repository](https://github.com/primer/react), [color usage](https://primer.style/product/foundations/color-usage/) and [component documentation](https://primer.style/product/components/): real packages and semantic theme tokens.

## Reference analysis

The generated reference `exec-1a8427e2-5d58-42fc-a139-580121609678.png` establishes:

- A compact 48px global bar: Signal, product context, source link and genuine environment information.
- Horizontal scenario controls directly below. No oversized decorative sidebar.
- Compact scenario heading and actual service/time context beside engine selection and one investigation action.
- A contiguous workbench, approximately **55% evidence / 45% investigation brief**, separated by a 14px gutter. The log and its versioned runbook share the left reading flow. Findings occupy the right.
- Neutral graphite background, subtle bordered surfaces, blue actions/citations, amber warning levels and red error levels. No violet accent or gradients.
- 14px system-sans UI, 12px monospace event messages, 21px scenario heading, 13px findings. Technical text carries precision; headings do not compete with the evidence.
- Recent investigations below the workbench, using a compact table rather than sidebar cards.

### Deliberate deviations

The reference is a visual specification, not a data source. The implemented log keeps the existing **four events** (three for the inconclusive case), timestamps, exact messages, IDs and runbook version 1.0. Generated extra events, diagnosis details, owners, resolution statuses, notebook links and external runbook links are omitted because the application does not provide them. The generated GitHub logo is replaced by a neutral Octicon pulse mark for Signal; the app is not a GitHub product.

The outer wrapper around the whole workbench is omitted: it adds redundant nesting. Component borders communicate actual log, runbook, brief and history boundaries. The existing empty brief stays empty until investigation is requested; history contains only actual saved results. The source link points directly to the repository following the user's explicit public-source approval.

## Component and token contract

One system: `@primer/react` 38.38.0, `@primer/primitives` 11.10.0 and `@primer/octicons-react` 19.33.0, pinned in the manifest and lockfile. Registry peers were checked against the existing React 19.2.0. No second component library or animation framework is introduced.

- Current `ThemeProvider` from `@primer/react/next` and `BaseStyles` provide the root environment. Official dark, typography and radius styles are imported from primitives. No external font service is required.
- Primer Button, Select, FormControl, Label, Link and Spinner implement the actual controls. Native semantic tables represent the small fixed evidence/history datasets; a virtualized grid would add unnecessary complexity.
- `--bgColor-inset`, `--bgColor-default`, `--bgColor-muted`: canvas and surface hierarchy.
- `--fgColor-default`, `--fgColor-muted`, `--fgColor-accent`: content, metadata and links.
- `--fgColor-attention` and `--fgColor-danger`: warning/error telemetry, never decorative brand color.
- `--borderColor-default` and `--borderColor-muted`: panels and row separators.
- `--fontStack-system`, `--fontStack-monospace`: UI and technical content.
- `--borderRadius-medium`: official restrained component radius; no giant rounded cards.
- The investigation button's primary background uses Primer's accent-emphasis blue rather than the default green, as requested by the design brief. This is an action-local semantic-token override, not a replacement theme.
- Spacing rhythm: 4/6/8/12/14/16/24px; 24px desktop outside gutters, 14px mobile gutters. No motion beyond control feedback; reduced-motion behavior is explicit.

## Preserved interaction inventory

| Surface              | Existing behavior preserved                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scenario controls    | Webhook backlog, Failing dependency, Duplicate delivery, Insufficient evidence; selecting clears the active brief, filter and error; disabled while analysis runs. |
| Engine               | Offline deterministic baseline; optional configured/unconfigured OpenAI mode in the full local app; sandbox offers offline only.                                   |
| Investigation action | Disabled while busy and for unconfigured AI; starts the existing request, shows Investigating…, saves the same returned result/history; errors remain explicit.    |
| Timeline filter      | All levels, Warnings, Errors, Info; empty filtered state remains visible.                                                                                          |
| Citations            | Existing event/runbook fragment IDs; citation selection restores All levels and links to its evidence. Target receives a semantic attention highlight.             |
| Results              | Working hypothesis or Inconclusive; exact observations, citations, missing evidence, read-only steps, source/time and human-review limitation.                     |
| History              | Most recent six of the existing 20-record session list; selecting restores that scenario, result and engine. No generated owners/statuses.                         |
| Workspace            | Initial loading, retry on connection failure, analysis failure, no-investigation and empty-history states.                                                         |
| Sandbox disclosure   | Explicit interactive sandbox, simulated telemetry and no live AI calls; browser-tab storage remains unchanged.                                                     |
| Navigation           | Skip link and Signal anchor target the workspace. Direct Source code link uses the existing repository.                                                            |

No backend, API, model/provider, evaluation, persistence or sandbox-adapter logic changes are part of this redesign.

## Responsive and accessibility behavior

At 1100px the scenario context and engine controls stack. At 800px the evidence/brief grid becomes one column in reading order. At 540px the action controls stack, scenario controls remain an explicitly scrollable strip with full labels, and history scrolls within its own container. History remains available on mobile. The log wraps event content and retains its timestamps and semantic levels without expanding the page.

Controls retain explicit labels, native keyboard behavior and Primer focus indication. Findings retain `aria-live` and `aria-busy`; errors retain `role=alert`. Event IDs and runbooks remain focusable anchor targets. No generated image is shipped as a fake application screenshot. The public sandbox and regular local build must both compile; existing backend tests remain the functionality baseline.
