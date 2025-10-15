#!/bin/bash
# Auto nano + git push script for Visora frontend

FOLDER="lib"
FILE="lib/main.dart"
MSG="Auto update: Flutter frontend changes pushed"

# Make sure folder exists
mkdir -p $FOLDER

# Open file in nano
nano $FILE

# Git add + commit + push
git add .
git commit -m "$MSG"
git push
