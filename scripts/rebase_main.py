import subprocess
import sys

def run(cmd, check=True):
    print(f"$ {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if check and result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result

# Show current branch
run("git branch --show-current")

# Fetch latest from origin
run("git fetch origin main")

# Rebase current branch onto origin/main
result = run("git rebase origin/main", check=False)

if result.returncode != 0:
    print("Rebase had conflicts or failed. Aborting rebase.")
    run("git rebase --abort", check=False)
    sys.exit(1)

print("Rebase onto origin/main complete.")

# Force push the rebased branch
run("git push --force-with-lease origin HEAD")

print("Force push complete.")
