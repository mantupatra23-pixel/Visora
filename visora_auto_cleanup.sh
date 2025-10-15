#!/bin/bash
set -e

echo "🚀 Starting visora auto cleanup and fix process..."

# Go to project root
cd ~/visora

# Step 1: Force rename any leftover folder or file with capital visora
echo "🔧 Renaming any capitalized visora references..."
find . -type f -exec sed -i 's/visora/visora/g' {} \; || true
mv visora visora 2>/dev/null || true

# Step 2: Remove old submodule configs
echo "🧹 Removing old submodules and invalid Git configs..."
rm -f .gitmodules || true
git config --unset submodule.visora.url || true
git config --unset submodule.visora.url || true

# Step 3: Verify pubspec.yaml name
echo "🧾 Ensuring pubspec.yaml name is lowercase..."
sed -i 's/^name:.*/name: visora/' pubspec.yaml

# Step 4: Commit and push all changes
git add .
git commit -m "Auto cleanup: fixed lowercase package name and removed invalid submodules"
git push origin main

# Step 5: Trigger GitHub workflow run (Android + Web build)
echo "⚙️ Triggering GitHub Actions workflow..."
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/mantupatra23-pixel/visora/actions/workflows/visora_build.yml/dispatches \
  -d '{"ref":"main"}' || echo "⚠️ Workflow trigger skipped (missing GitHub token)"

echo "✅ Cleanup done! Go check your Actions tab: https://github.com/mantupatra23-pixel/visora/actions"
