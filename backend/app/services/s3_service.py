"""AWS S3 service — optional stub for file/asset storage."""
from app.utils.logger import logger


def upload_file(local_path: str, bucket_key: str) -> str:
    """Upload a local file to S3. Returns the public URL."""
    # TODO: Implement with boto3
    logger.info("[S3 STUB] upload %s → %s", local_path, bucket_key)
    return ""


def get_file_url(bucket_key: str) -> str:
    """Return the public URL for an S3 object."""
    # TODO: Implement with boto3 presigned URL
    return ""


def delete_file(bucket_key: str) -> None:
    """Delete an object from S3."""
    # TODO: Implement with boto3
    logger.info("[S3 STUB] delete %s", bucket_key)
