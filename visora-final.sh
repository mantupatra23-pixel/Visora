#!/bin/bash
# visora-final.sh 🚀
# Auto clean + add + commit + push (no submodule issues)

echo "🧹 Cleaning old submodule refs..."
rm -rf .gitmodules
rm -rf .git/modules/Visora
git rm -r --cached Visora || true

echo "➕ Adding Visora folder as normal files..."
git add Visora/* -f

echo "💾 Commit kar rahe hain..."
git commit -m "fix: final Visora sync (frontend + backend + android + ios)"

echo "⬆️ Force pushing to main..."
git push origin main --force

echo "✅ DONE: Visora fully synced and pushed to GitHub!"
