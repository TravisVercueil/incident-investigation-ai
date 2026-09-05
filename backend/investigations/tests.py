import json
import os
import urllib.error
from unittest.mock import patch
from django.test import Client, TestCase
from .analysis import (
    AnalysisError,
    ai_analysis,
    offline_analysis,
    public_scenario,
    validate_result,
)
from .models import Investigation
from .scenarios import SCENARIOS


class InvestigationTests(TestCase):
    def test_baseline_matches_four_known_faults(self):
        for scenario in SCENARIOS:
            with self.subTest(scenario=scenario["id"]):
                result = validate_result(offline_analysis(scenario), scenario)
                self.assertEqual(result["diagnosis"], scenario["expected"])

    def test_unknown_signal_abstains(self):
        s = {
            **SCENARIOS[0],
            "events": [{"id": "unknown", "message": "CPU briefly increased."}],
        }
        self.assertEqual(offline_analysis(s)["diagnosis"], "inconclusive")

    def test_reference_answers_are_not_sent_to_provider(self):
        self.assertNotIn("expected", public_scenario(SCENARIOS[0]))
        self.assertNotIn("summary", public_scenario(SCENARIOS[0]))
        self.assertNotIn("missing", public_scenario(SCENARIOS[0]))

    def test_rejects_invented_citation(self):
        result = offline_analysis(SCENARIOS[0])
        result["citations"] = ["made-up"]
        with self.assertRaisesRegex(AnalysisError, "citations"):
            validate_result(result, SCENARIOS[0])

    def test_rejects_unsupported_observation(self):
        result = offline_analysis(SCENARIOS[0])
        result["observations"][0]["quote"] = "Database corruption caused the incident."
        with self.assertRaisesRegex(AnalysisError, "unsupported"):
            validate_result(result, SCENARIOS[0])

    def test_rejects_invalid_shape(self):
        for result in [[], None, {"diagnosis": "proven"}]:
            with self.assertRaises(AnalysisError):
                validate_result(result, SCENARIOS[0])

    @patch.dict(os.environ, {"OPENAI_API_KEY": "", "OPENAI_MODEL": ""})
    def test_unconfigured_ai_does_not_fall_back(self):
        response = self.client.post(
            "/api/investigations",
            {"scenario": "backlog", "mode": "ai"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 502)
        self.assertEqual(Investigation.objects.count(), 0)

    @patch.dict(
        os.environ, {"OPENAI_API_KEY": "test-only", "OPENAI_MODEL": "test-model"}
    )
    @patch(
        "urllib.request.urlopen", side_effect=urllib.error.URLError("provider failed")
    )
    def test_provider_failure_does_not_save_or_fall_back(self, provider):
        response = self.client.post(
            "/api/investigations",
            {"scenario": "backlog", "mode": "ai"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 502)
        self.assertIn("No offline substitution", response.json()["error"])
        self.assertEqual(Investigation.objects.count(), 0)

    @patch.dict(
        os.environ, {"OPENAI_API_KEY": "test-only", "OPENAI_MODEL": "test-model"}
    )
    @patch("urllib.request.urlopen")
    def test_valid_provider_result_is_validated(self, provider):
        provider.return_value.__enter__.return_value.read.return_value = json.dumps(
            {
                "choices": [
                    {"message": {"content": json.dumps(offline_analysis(SCENARIOS[1]))}}
                ]
            }
        ).encode()
        self.assertEqual(ai_analysis(SCENARIOS[1])["source"], "OpenAI / test-model")
        self.assertEqual(provider.call_args.kwargs["timeout"], 25)

    @patch.dict(
        os.environ, {"OPENAI_API_KEY": "test-only", "OPENAI_MODEL": "test-model"}
    )
    @patch("urllib.request.urlopen")
    def test_malformed_provider_result_is_rejected(self, provider):
        provider.return_value.__enter__.return_value.read.return_value = b"not json"
        with self.assertRaisesRegex(AnalysisError, "unreadable"):
            ai_analysis(SCENARIOS[0])

    def test_post_requires_explicit_mode_and_known_scenario(self):
        for payload in [
            {"scenario": "backlog"},
            {"scenario": "bogus", "mode": "offline"},
            [],
            {"scenario": {}, "mode": "offline"},
        ]:
            self.assertEqual(
                self.client.post(
                    "/api/investigations", payload, content_type="application/json"
                ).status_code,
                400,
            )

    def test_malformed_json_is_rejected(self):
        self.assertEqual(
            self.client.post(
                "/api/investigations", "{", content_type="application/json"
            ).status_code,
            400,
        )

    def test_saved_history_is_scoped_to_browser_session(self):
        response = self.client.post(
            "/api/investigations",
            {"scenario": "duplicate", "mode": "offline"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            len(self.client.get("/api/investigations").json()["investigations"]), 1
        )
        self.assertEqual(
            Client().get("/api/investigations").json()["investigations"], []
        )

    def test_csrf_is_enforced_for_writes(self):
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(
            client.post(
                "/api/investigations", "{}", content_type="application/json"
            ).status_code,
            403,
        )
        token = client.get("/api/scenarios").json()["csrfToken"]
        response = client.post(
            "/api/investigations",
            {"scenario": "inconclusive", "mode": "offline"},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 201)

    def test_observation_citation_must_appear_in_citations(self):
        result = offline_analysis(SCENARIOS[0])
        result["citations"] = [SCENARIOS[0]["runbook"]["id"]]
        with self.assertRaisesRegex(AnalysisError, "unsupported"):
            validate_result(result, SCENARIOS[0])

    def test_citation_validation_does_not_claim_causal_correctness(self):
        result = offline_analysis(SCENARIOS[0])
        result["diagnosis"] = "dependency_timeout"
        accepted = validate_result(result, SCENARIOS[0])
        self.assertNotEqual(accepted["diagnosis"], SCENARIOS[0]["expected"])

    def test_runbook_cannot_masquerade_as_event_with_null_quote(self):
        for observation in [
            {"citation": SCENARIOS[0]["runbook"]["id"]},
            {"citation": SCENARIOS[0]["runbook"]["id"], "quote": None},
        ]:
            result = offline_analysis(SCENARIOS[0])
            result["observations"] = [observation]
            with (
                self.subTest(observation=observation),
                self.assertRaisesRegex(AnalysisError, "unsupported"),
            ):
                validate_result(result, SCENARIOS[0])
