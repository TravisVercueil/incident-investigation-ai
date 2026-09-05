# Evaluation

The deterministic baseline was executed against all four authored scenarios:

| Scenario              | Expected diagnosis  | Baseline result |
| --------------------- | ------------------- | --------------- |
| Webhook backlog       | worker_capacity     | Pass            |
| Failing dependency    | dependency_timeout  | Pass            |
| Duplicate delivery    | missing_idempotency | Pass            |
| Insufficient evidence | inconclusive        | Pass            |

**4/4 diagnosis matches; 4/4 structural citation/quote validations.** Reproduce with `python scripts/evaluate.py`. This is a small, in-sample regression suite for inspectable rules, not evidence of general AI accuracy. It uses the same fixture distribution the rules were written against. An additional unit test checks that an unknown signal abstains.

Citation IDs must exist and observation quotes must exactly match their cited event. These checks do not prove a causal hypothesis is correct, nor that its selected citations support it. The test suite deliberately demonstrates a structurally valid wrong diagnosis to preserve that distinction. Causal diagnosis is scored separately against each fixture's expected label.

No live provider evaluation was run during implementation because no credentials/model were supplied. Provider boundary tests use mocks and cannot establish real API compatibility or model quality. `python scripts/evaluate.py --ai` makes four live calls and reports provider results without substituting baseline answers. Before presenting broader AI performance claims, add held-out incidents, independent human labels, repeated model runs, causal-support review and latency/cost measurements.

## Local integration checks

The PostgreSQL Compose path was built and started. The Django suite passed against PostgreSQL as well as SQLite. Four CSRF-protected HTTP investigations were saved, both API and database services restarted, and all four records plus the browser session were recovered. The host localhost:8103 endpoint was also checked. Both regular and VITE_DEMO_MODE frontend builds pass. These checks cover the demo path; they are not production load or availability tests.
