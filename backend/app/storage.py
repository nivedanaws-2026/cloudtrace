"""
Evidence file storage. Two backends, chosen by STORAGE_BACKEND:

  local  - files in LOCAL_STORAGE_DIR (default, used for development)
  s3     - files in the S3 bucket named by S3_BUCKET_NAME

The location string saved in the database says where each file lives
("s3://bucket/key" or a local path), so files stored before switching
backends can still be read.
"""
import os

STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local").lower()
LOCAL_DIR = os.getenv("LOCAL_STORAGE_DIR", "storage")
S3_BUCKET = os.getenv("S3_BUCKET_NAME", "")
S3_PREFIX = "evidence/"

if STORAGE_BACKEND not in ("local", "s3"):
    raise RuntimeError("STORAGE_BACKEND must be 'local' or 's3'")
if STORAGE_BACKEND == "s3" and not S3_BUCKET:
    raise RuntimeError("STORAGE_BACKEND=s3 requires S3_BUCKET_NAME to be set")

os.makedirs(LOCAL_DIR, exist_ok=True)

_s3_client = None


def _s3():
    global _s3_client
    if _s3_client is None:
        import boto3  # imported lazily so local-only setups don't need AWS config

        # Credentials come from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in the environment.
        _s3_client = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
    return _s3_client


def _split_s3(location: str) -> tuple[str, str]:
    bucket, _, key = location[len("s3://"):].partition("/")
    return bucket, key


def save(key: str, data: bytes) -> str:
    """Store bytes under a random key. Returns the location to save in the DB."""
    if STORAGE_BACKEND == "s3":
        object_key = f"{S3_PREFIX}{key}"
        _s3().put_object(
            Bucket=S3_BUCKET,
            Key=object_key,
            Body=data,
            ServerSideEncryption="AES256",
        )
        return f"s3://{S3_BUCKET}/{object_key}"

    path = os.path.join(LOCAL_DIR, key)
    with open(path, "wb") as f:
        f.write(data)
    return path


def read(location: str) -> bytes:
    """Return the stored bytes. Raises FileNotFoundError if the file is gone."""
    if location.startswith("s3://"):
        from botocore.exceptions import ClientError

        bucket, key = _split_s3(location)
        try:
            return _s3().get_object(Bucket=bucket, Key=key)["Body"].read()
        except ClientError as e:
            if e.response.get("Error", {}).get("Code") in ("NoSuchKey", "404"):
                raise FileNotFoundError(location) from e
            raise

    with open(location, "rb") as f:
        return f.read()


def healthy() -> bool:
    """Used by /health. For S3, checks the bucket is reachable with our credentials."""
    if STORAGE_BACKEND == "s3":
        try:
            _s3().head_bucket(Bucket=S3_BUCKET)
            return True
        except Exception:
            return False
    return os.path.isdir(LOCAL_DIR) and os.access(LOCAL_DIR, os.W_OK)
