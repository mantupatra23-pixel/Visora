#!/bin/bash
echo "🔧 Starting auto fix for 'visora' capital issue..."

# Step 1: Search and replace all 'visora' → 'visora' (case-sensitive)
grep -Rl "visora" . | while read file; do
  sed -i 's/visora/visora/g' "$file"
  echo "✅ Fixed in: $file"
done

# Step 2: Verify
echo "🔍 Checking for any remaining 'visora'..."
grep -R "visora" . || echo "✅ All 'visora' references removed successfully!"

# Step 3: Clean flutter cache and rebuild dependencies
echo "🧹 Cleaning Flutter cache..."
flutter clean >/dev/null 2>&1
flutter pub get >/dev/null 2>&1

# Step 4: Commit and push changes
git add .
git commit -m "Auto-fixed all 'visora' → 'visora' references (final lowercase clean)" || echo "No new changes to commit"
git push origin main

echo "🎯 All done! Re-run your GitHub Action build now."
