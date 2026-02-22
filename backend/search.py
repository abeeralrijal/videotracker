from typing import Any, Dict, List

from backend.db import search_events


def run_search(query: str, filters: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]:
    return search_events(query, filters, limit)
