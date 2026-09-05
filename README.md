# Incident investigation AI

An investigation workspace combining application events, traces and runbooks into an evidence-backed incident timeline.

## Status

Project selected for Travis Vercueil’s portfolio. Initial scope is documented; the full application is not yet built or deployed.

## Demonstration

Replay a webhook backlog, a failing dependency and a duplicate-delivery incident. Inspect the timeline and compare suggested diagnoses against known scenario outcomes.

## Proposed implementation

Proposed: an instrumented demo service, OpenTelemetry, Python investigation API and TypeScript/React interface. Start with file-based scenario imports before live collectors.

## Acceptance criteria

- Use only a dedicated synthetic demo environment.
- Every diagnosis distinguishes observations, hypotheses and missing evidence.
- Citations resolve to specific events, traces or runbook versions.
- Tools are read-only; bounded execution and query budgets prevent runaway investigation.
- Evaluate diagnosis accuracy and evidence support against known faults, including an inconclusive scenario.

## Delivery

1. Implement one reproducible vertical slice with synthetic fixtures.
2. Add persistence, a usable review interface and meaningful failure-path tests.
3. Add AI where it improves the workflow, with a non-AI baseline and evaluation results.
4. Deploy an isolated demo and record a short walkthrough.
5. Publish an architecture case study with measured results before replacing the existing portfolio entry.

Original implementation only. No employer code, customer records or internal operational data. Repository visibility starts private; a later public release can be considered when the demo is ready.
