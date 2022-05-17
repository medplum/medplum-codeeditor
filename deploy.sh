#!/usr/bin/env bash

LOCAL_PATH="./"
S3_URI="s3://medplum-codeeditor/"

# HTML files
aws s3 cp "$LOCAL_PATH" "$S3_URI" \
  --region us-east-1 \
  --recursive \
  --content-type "text/html" \
  --cache-control "no-cache" \
  --exclude "*" \
  --include "*.html"

# CSS files
aws s3 cp "$LOCAL_PATH" "$S3_URI" \
  --region us-east-1 \
  --recursive \
  --content-type "text/css" \
  --cache-control "no-cache" \
  --exclude "*" \
  --include "*.css"

# JS files
aws s3 cp "$LOCAL_PATH" "$S3_URI" \
  --region us-east-1 \
  --recursive \
  --content-type "application/javascript" \
  --cache-control "no-cache" \
  --exclude "*" \
  --include "*.js"
