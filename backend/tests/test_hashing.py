from app.hashing import sha256_of_file, compute_event_hash


def test_sha256_known_value():
    # SHA-256 of "abc" is a published test vector.
    assert sha256_of_file(b"abc") == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"


def test_file_hash_changes_when_one_byte_changes():
    assert sha256_of_file(b"evidence A") != sha256_of_file(b"evidence B")


def _build_chain(actions):
    prev, chain = None, []
    for i, action in enumerate(actions):
        h = compute_event_hash(prev, "evidence-1", "user-1", action, f"2026-10-13T10:00:0{i}")
        chain.append({"action": action, "ts": f"2026-10-13T10:00:0{i}", "prev": prev, "hash": h})
        prev = h
    return chain


def _first_broken(chain):
    prev = None
    for i, e in enumerate(chain):
        expected = compute_event_hash(prev, "evidence-1", "user-1", e["action"], e["ts"])
        if e["prev"] != prev or e["hash"] != expected:
            return i
        prev = e["hash"]
    return None


def test_intact_chain_verifies():
    assert _first_broken(_build_chain(["upload", "verify", "access"])) is None


def test_edited_event_is_detected():
    chain = _build_chain(["upload", "verify", "access"])
    chain[1]["action"] = "upload"
    assert _first_broken(chain) == 1


def test_deleted_event_is_detected():
    chain = _build_chain(["upload", "verify", "access"])
    del chain[1]
    assert _first_broken(chain) == 1
