#!/usr/bin/env bash
set -euo pipefail

echo "[v0] Current branch: $(git branch --show-current)"
echo "[v0] Fetching origin..."
git fetch origin

echo "[v0] Rebasing onto origin/main..."
git rebase origin/main

echo "[v0] Rebase complete."
echo "[v0] Current log (last 5):"
git log --oneline -5
