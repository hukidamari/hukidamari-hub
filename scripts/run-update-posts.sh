#!/bin/sh

echo "Start Updating Posts"
pnpm tsx scripts/update-posts.ts
echo "Posts Updated"
