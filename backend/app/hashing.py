import hashlib


def sha256_of_file(file_bytes: bytes) -> str:
    """Compute the SHA-256 hash of raw file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()


def compute_event_hash(prev_event_hash: str | None, evidence_id: str, actor_id: str,
                        action: str, timestamp: str) -> str:
    """
    Chain-link hash for a custody event: hashes the previous event's hash
    together with this event's own data. Changing any past event, or
    inserting one out of order, changes every hash after it — that's what
    makes the chain tamper-evident.
    """
    payload = f"{prev_event_hash or ''}|{evidence_id}|{actor_id}|{action}|{timestamp}"
    return hashlib.sha256(payload.encode()).hexdigest()
