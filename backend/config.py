from typing import Any, Dict

DEFAULT_USE_CASE = "general_security"

USE_CASES: Dict[str, Dict[str, Any]] = {
    "general_security": {
        "name": "Security Ops",
        "events": [
            "fight",
            "assault",
            "theft",
            "intrusion",
            "trespass",
            "vandalism",
            "loitering",
            "weapon",
            "medical_emergency",
            "fire_or_smoke",
            "unsafe_behavior",
        ],
        "system_prompt": (
            "You are analyzing security footage for public spaces. Identify safety, "
            "security, and suspicious activity that should be reviewed by a human."
        ),
        "context": (
            "General public-space surveillance (campuses, retail, parking lots, "
            "transit hubs). Focus on safety risks, suspicious behavior, and incidents."
        ),
    },
    "campus_safety": {
        "name": "Campus Safety",
        "events": [
            "fight",
            "intruder",
            "suspicious_package",
            "vandalism",
            "loitering",
        ],
        "system_prompt": (
            "You are analyzing campus security footage. Identify events that "
            "might require a human safety review."
        ),
        "context": (
            "University campus security camera monitoring common areas like "
            "entrances, parking lots, and walkways."
        ),
    },
    "traffic": {
        "name": "Traffic Monitoring",
        "events": [
            "accident",
            "wrong_way",
            "pedestrian_danger",
            "road_rage",
            "speeding",
        ],
        "system_prompt": (
            "You are analyzing traffic camera footage. Identify risky or unsafe "
            "traffic events that require attention."
        ),
        "context": (
            "Traffic intersection camera monitoring vehicles and pedestrians in "
            "an urban environment."
        ),
    },
}


def get_use_case(use_case: str) -> Dict[str, Any]:
    if use_case not in USE_CASES:
        raise KeyError(f"Unknown use case: {use_case}")
    return USE_CASES[use_case]
