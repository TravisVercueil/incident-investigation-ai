"""Original synthetic telemetry. No live system access or customer records."""


def scenario(
    id,
    title,
    service,
    description,
    events,
    diagnosis,
    summary,
    evidence,
    missing,
    runbook,
):
    return {
        "id": id,
        "title": title,
        "service": service,
        "description": description,
        "events": [
            {
                "id": f"{id}-e{i + 1}",
                "time": f"2026-08-12T09:{i * 2:02d}:00Z",
                "level": level,
                "message": text,
            }
            for i, (level, text) in enumerate(events)
        ],
        "runbook": {
            "id": f"{id}-r1",
            "version": "1.0",
            "title": runbook[0],
            "text": runbook[1],
        },
        "expected": diagnosis,
        "summary": summary,
        "evidence": evidence,
        "missing": missing,
    }


SCENARIOS = [
    scenario(
        "backlog",
        "Webhook backlog",
        "delivery-worker",
        "Delivery latency rises after a worker deployment.",
        [
            ("info", "Deployment d-104 reduced worker concurrency from 8 to 1."),
            (
                "warning",
                "Queue depth increased from 40 to 1800; incoming rate remained 60 events per minute.",
            ),
            ("warning", "Delivery p95 increased from 2 seconds to 95 seconds."),
            (
                "info",
                "Downstream endpoint success rate remained 99.9%; worker error count was 0.",
            ),
        ],
        "worker_capacity",
        "Reduced worker concurrency is a plausible cause of the queue growth.",
        [0, 1, 3],
        [
            "Worker CPU and processing duration are not present.",
            "A controlled concurrency restoration has not been observed.",
        ],
        (
            "Queue saturation / v1.0",
            "Compare arrival rate, worker concurrency and processing duration. Check downstream failures before proposing capacity changes.",
        ),
    ),
    scenario(
        "dependency",
        "Failing dependency",
        "checkout-api",
        "Checkout requests fail while a pricing dependency times out.",
        [
            ("info", "Checkout release remained unchanged at d-88."),
            (
                "error",
                "Trace t-201: pricing-api timed out after 3000 ms; checkout returned 502.",
            ),
            (
                "error",
                "Trace t-202: pricing-api timed out after 3000 ms; checkout returned 502.",
            ),
            (
                "warning",
                "Pricing dependency timeout rate reached 38%; database latency remained 12 ms.",
            ),
        ],
        "dependency_timeout",
        "Pricing dependency timeouts are a plausible contributor to checkout failures.",
        [1, 2, 3],
        [
            "Pricing service internals are unavailable.",
            "The cause of the dependency timeout is not established.",
        ],
        (
            "Dependency timeout / v1.0",
            "Correlate failing traces with dependency timings. Check timeout rates and recent changes. Do not infer the dependency root cause from caller traces alone.",
        ),
    ),
    scenario(
        "duplicate",
        "Duplicate delivery",
        "webhook-consumer",
        "A retried event creates a repeated downstream action.",
        [
            ("info", "Event evt-42 delivery attempt 1 committed action act-101."),
            ("warning", "Acknowledgement for evt-42 attempt 1 timed out after commit."),
            ("error", "Event evt-42 delivery attempt 2 committed action act-102."),
            ("warning", "Consumer configuration: idempotency enforcement disabled."),
        ],
        "missing_idempotency",
        "A retry without idempotency enforcement plausibly allowed the duplicate action.",
        [0, 2, 3],
        [
            "The acknowledgement network failure cause is unknown.",
            "Other affected event IDs have not been checked.",
        ],
        (
            "Duplicate handling / v1.0",
            "Compare stable event IDs and committed action IDs across attempts. Confirm idempotency enforcement; preserve records for review.",
        ),
    ),
    scenario(
        "inconclusive",
        "Insufficient evidence",
        "orders-api",
        "A latency alert arrives with a gap in trace collection.",
        [
            ("warning", "Order latency p95 increased from 200 ms to 1700 ms."),
            ("warning", "Trace collection unavailable for the alert window."),
            ("info", "No deployment record is available for the alert window."),
        ],
        "inconclusive",
        "The available telemetry does not establish a likely cause.",
        [0, 1],
        [
            "Request traces, dependency timings and deployment records are missing.",
            "Collect these signals before attributing a cause.",
        ],
        (
            "Incomplete telemetry / v1.0",
            "State what is observed. List missing signals. Do not select a root cause without supporting evidence.",
        ),
    ),
]
BY_ID = {s["id"]: s for s in SCENARIOS}
