import os

def fix_requirements(file_path="requirements.txt"):
    print("🔍 Checking dependencies...")
    if not os.path.exists(file_path):
        print("❌ requirements.txt not found!")
        return

    with open(file_path, "r") as file:
        lines = file.readlines()

    fixed_lines = []
    for line in lines:
        line = line.strip()

        # Fix openai version format
        if line.startswith("openai"):
            fixed_lines.append("openai==1.52.2\n")
        elif line.startswith("gtts") or line.startswith("GTTS"):
            fixed_lines.append("gtts==2.5.4\n")
        else:
            fixed_lines.append(line + "\n")

    with open(file_path, "w") as file:
        file.writelines(fixed_lines)

    print("✅ Dependencies fixed successfully!")


if __name__ == "__main__":
    fix_requirements()
