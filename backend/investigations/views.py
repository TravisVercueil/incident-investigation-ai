import json
import os
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_http_methods
from .analysis import AnalysisError, ai_analysis, offline_analysis, public_scenario
from .models import Investigation
from .scenarios import BY_ID, SCENARIOS


@require_GET
def scenarios(request):
    return JsonResponse(
        {
            "scenarios": [public_scenario(s) for s in SCENARIOS],
            "csrfToken": get_token(request),
            "aiConfigured": bool(
                os.environ.get("OPENAI_API_KEY") and os.environ.get("OPENAI_MODEL")
            ),
        }
    )


def serialize(row):
    return {
        "id": row.id,
        "scenario": row.scenario,
        "mode": row.mode,
        "result": row.result,
        "created_at": row.created_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def investigations(request):
    if not request.session.session_key:
        request.session.create()
    if request.method == "GET":
        return JsonResponse(
            {
                "investigations": [
                    serialize(row)
                    for row in Investigation.objects.filter(
                        session_key=request.session.session_key
                    ).order_by("-created_at")[:20]
                ]
            }
        )
    try:
        payload = json.loads(request.body)
        if (
            not isinstance(payload, dict)
            or payload.get("mode") not in ("offline", "ai")
            or not isinstance(payload.get("scenario"), str)
            or payload["scenario"] not in BY_ID
        ):
            return JsonResponse(
                {
                    "error": "Choose a valid scenario and an explicit offline or AI mode."
                },
                status=400,
            )
        s = BY_ID[payload["scenario"]]
        result = offline_analysis(s) if payload["mode"] == "offline" else ai_analysis(s)
        row = Investigation.objects.create(
            session_key=request.session.session_key,
            scenario=s["id"],
            mode=payload["mode"],
            result=result,
        )
        return JsonResponse(serialize(row), status=201)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"error": "Request must contain valid JSON."}, status=400)
    except AnalysisError as error:
        return JsonResponse({"error": str(error)}, status=502)
