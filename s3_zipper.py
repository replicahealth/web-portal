#!/usr/bin/env python3
import argparse, os, tempfile, zipfile, shutil
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client("s3")

def list_common_prefixes(bucket, prefix):
    # list immediate children (folders) under prefix
    paginator = s3.get_paginator("list_objects_v2")
    prefixes = []
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix, Delimiter="/"):
        for p in page.get("CommonPrefixes", []):
            prefixes.append(p["Prefix"])
    return prefixes

def list_keys(bucket, prefix):
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if not key.endswith("/"):  # skip “directory marker” keys
                yield key

def zip_one_dataset(bucket, dataset_prefix, dest_bucket, dest_prefix, overwrite=False, dry_run=False):
    # e.g. dataset_prefix = raw_data/public_availability/AIDE_T1D/
    dataset_name = dataset_prefix.rstrip("/").split("/")[-1]
    zip_key = f"{dest_prefix.rstrip('/')}/{dataset_name}.zip"

    # skip if exists (unless overwrite)
    if not overwrite:
        try:
            s3.head_object(Bucket=dest_bucket, Key=zip_key)
            print(f"⏭️  Exists, skipping: s3://{dest_bucket}/{zip_key}")
            return
        except ClientError:
            pass

    print(f"📦 Zipping {dataset_name} → s3://{dest_bucket}/{zip_key}")
    if dry_run:
        return

    with tempfile.TemporaryDirectory() as tmpd:
        zip_path = os.path.join(tmpd, f"{dataset_name}.zip")
        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            for key in list_keys(bucket, dataset_prefix):
                relpath = key[len(dataset_prefix):]
                # stream S3 object into the zip without loading whole file in RAM
                with zf.open(relpath, "w") as zdst:
                    obj = s3.get_object(Bucket=bucket, Key=key)
                    body = obj["Body"]
                    shutil.copyfileobj(body, zdst, length=1024 * 1024)  # 1MB chunks

        s3.upload_file(zip_path, dest_bucket, zip_key)
        print(f"✅ Uploaded: s3://{dest_bucket}/{zip_key}")

def main():
    ap = argparse.ArgumentParser(
        description="Create ZIPs for each top-level dataset folder under a prefix and upload to S3."
    )
    ap.add_argument("--bucket", required=True, help="Source bucket")
    ap.add_argument("--src-prefix", required=True, help="Source prefix (e.g., raw_data/public_availability/)")
    ap.add_argument("--dest-bucket", help="Destination bucket (default: same as --bucket)")
    ap.add_argument("--dest-prefix", required=True, help="Destination prefix for ZIPs (e.g., raw_data/public_availability_compressed/)")
    ap.add_argument("--overwrite", action="store_true", help="Overwrite ZIPs if they already exist")
    ap.add_argument("--dry-run", action="store_true", help="List work but do not upload")
    args = ap.parse_args()

    dest_bucket = args.dest_bucket or args.bucket

    # find top-level dataset folders
    datasets = list_common_prefixes(args.bucket, args.src_prefix)
    if not datasets:
        print("No dataset folders found (check prefix).")
        return

    print(f"Found {len(datasets)} dataset folders under s3://{args.bucket}/{args.src-prefix}")
    for dp in datasets:
        zip_one_dataset(args.bucket, dp, dest_bucket, args.dest_prefix, overwrite=args.overwrite, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
