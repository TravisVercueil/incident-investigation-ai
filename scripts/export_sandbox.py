"""Regenerate the explicit static sandbox from versioned synthetic scenarios."""

import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / "backend"))
from investigations.analysis import offline_analysis, public_scenario
from investigations.scenarios import SCENARIOS

payload = {
    "scenarios": [public_scenario(s) for s in SCENARIOS],
    "results": {s["id"]: offline_analysis(s) for s in SCENARIOS},
}
(root / "frontend/src/sandbox.json").write_text(json.dumps(payload, indent=2) + "\n")
