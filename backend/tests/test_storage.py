import importlib

import pytest


@pytest.fixture
def local_storage(tmp_path, monkeypatch):
    monkeypatch.setenv("STORAGE_BACKEND", "local")
    monkeypatch.setenv("LOCAL_STORAGE_DIR", str(tmp_path))
    from app import storage

    return importlib.reload(storage)


def test_save_and_read_roundtrip(local_storage):
    location = local_storage.save("abc123", b"hello evidence")
    assert local_storage.read(location) == b"hello evidence"


def test_missing_file_raises(local_storage, tmp_path):
    with pytest.raises(FileNotFoundError):
        local_storage.read(str(tmp_path / "does-not-exist"))


def test_healthy_when_directory_writable(local_storage):
    assert local_storage.healthy() is True


def test_s3_backend_requires_bucket_name(monkeypatch):
    monkeypatch.setenv("STORAGE_BACKEND", "s3")
    monkeypatch.delenv("S3_BUCKET_NAME", raising=False)
    from app import storage

    with pytest.raises(RuntimeError):
        importlib.reload(storage)
