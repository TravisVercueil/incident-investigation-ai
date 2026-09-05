"""Small known-fault evaluation, not a claim of real-world agent accuracy."""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from investigations.analysis import (
    AnalysisError,
    ai_analysis,
    offline_analysis,
    validate_result,
)
from investigations.scenarios import SCENARIOS

parser = argparse.ArgumentParser()
parser.add_argument(
    "--ai",
    action="store_true",
    help="Make four billed provider calls using configured credentials; no fallback.",
)
args = parser.parse_args()
print("Mode:", "AI provider (live)" if args.ai else "deterministic baseline")
print("| Scenario | Expected | Predicted | Citation/quote checks | Diagnosis |")
print("| --- | --- | --- | --- | --- |")
correct = valid = 0
for s in SCENARIOS:
    try:
        result = validate_result(ai_analysis(s) if args.ai else offline_analysis(s), s)
        valid += 1
        matches = result["diagnosis"] == s["expected"]
        correct += matches
        print(
            f"| {s['id']} | {s['expected']} | {result['diagnosis']} | pass | {'pass' if matches else 'FAIL'} |"
        )
    except AnalysisError as error:
        print(f"| {s['id']} | {s['expected']} | unavailable | FAIL: {error} | FAIL |")
print(
    f"\nDiagnosis: {correct}/{len(SCENARIOS)}; structural evidence checks: {valid}/{len(SCENARIOS)}."
)
print(
    "Four authored fixtures, no held-out dataset. Citation existence and exact quotes do not prove causal reasoning."
)
sys.exit(0 if correct == valid == len(SCENARIOS) else 1)
