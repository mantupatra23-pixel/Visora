#!/bin/bash

# Step 1: Clean submodule reference
echo "🧹 Cleaning old Visora submodule..."
git rm -r --cached Visora 2>/dev/null
rm -rf .git/modules/Visora

# Step 2: Add Visora folder as normal folder
echo "➕ Adding Visora folder..."
git add Visora

# Step 3: Commit changes
echo "📦 Committing changes..."
git commit -m "fix: added Visora as normal folder" || echo "⚠️ Nothing to commit."

# Step 4: Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main
