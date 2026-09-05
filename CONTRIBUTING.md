# Contributing

Use Python 3.12 and Node 22.12+ and follow the README setup. Keep a change focused: a bug fix, one scenario or one demonstrable workflow. Open a branch and PR into `main`; describe the user-visible change, tests and limitations.

Run the backend tests, migration check, evaluator and frontend build before submitting. When editing scenarios, regenerate the browser fixtures with `python scripts/export_sandbox.py`. Preserve explicit simulated/AI mode labels and add failure-path tests for changed evidence or provider behavior. Do not add employer records, real incident data or credentials.

Dependencies are pinned in `requirements.lock` and `frontend/package-lock.json`. Update locks intentionally and verify the application after upgrades. Prefer Django, Python standard-library and native browser capabilities over additional frameworks.
