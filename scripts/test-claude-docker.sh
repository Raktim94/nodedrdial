#!/bin/bash
# Runs Claude Code in an isolated Debian container, auto-deletes after.
# Usage:
#   ./scripts/test-claude-docker.sh          # basic test (no project mount)
#   ./scripts/test-claude-docker.sh --project # mount project + analyze codebase
set -e

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "ERROR: Set ANTHROPIC_API_KEY first:"
  echo "  export ANTHROPIC_API_KEY=sk-ant-..."
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-}"

if [ "$MODE" = "--project" ]; then
  echo "Starting isolated Claude Code container with project mounted..."
  echo "Project: $PROJECT_ROOT"

  docker run --rm \
    --name claude-code-test \
    --env ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    --env CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
    --network bridge \
    --memory 1g \
    --cpus 2 \
    --read-only \
    --tmpfs /tmp \
    --volume "$PROJECT_ROOT:/workspace:ro" \
    --workdir /workspace \
    node:20-bookworm-slim \
    bash -c '
      echo "=== Debian version ===" && cat /etc/os-release | grep PRETTY_NAME
      echo "=== Project files ===" && ls -la
      echo "=== Installing Claude Code ===" && npm install -g @anthropic-ai/claude-code --silent
      echo "=== Claude Code version ===" && claude --version
      echo ""
      echo "=== Analyzing codebase ===" && claude \
        -p "You are reviewing the TwilioHub OSS project. Look at the package.json, folder structure, and key source files. Summarize: 1) what this project does, 2) the tech stack, 3) any obvious improvements or risks you can spot." \
        --output-format json \
        --max-turns 3 \
        --allowedTools "Read,Bash(find:*),Bash(ls:*),Bash(cat:*)"
      echo ""
      echo "=== Done ==="
    '
else
  echo "Starting isolated Claude Code test container (no project mount)..."

  docker run --rm \
    --name claude-code-test \
    --env ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    --network bridge \
    --memory 512m \
    --cpus 1 \
    node:20-bookworm-slim \
    bash -c '
      echo "=== Debian version ===" && cat /etc/os-release | grep PRETTY_NAME
      echo "=== Installing Claude Code ===" && npm install -g @anthropic-ai/claude-code --silent
      echo "=== Claude Code version ===" && claude --version
      echo "=== Running test prompt ===" && claude \
        -p "List 3 Node.js best practices in one sentence each." \
        --output-format json \
        --max-turns 1
      echo "=== Done ==="
    '
fi

echo ""
echo "Container auto-deleted. Nothing left behind."
echo "Verify: docker ps -a | grep claude-code-test"
