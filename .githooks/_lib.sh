# shellcheck shell=sh
# Shared helpers for git hooks. Sourced, not executed.

GREEN='\033[0;32m'
RED='\033[0;31m'
RESET='\033[0m'

ok() { printf "${GREEN}%s${RESET}\n" "$1"; }
fail() { printf "${RED}%s${RESET}\n" "$1" >&2; }

run_parallel() {
  label="$1"
  out=$(mktemp)
  shift
  ( "$@" >"$out" 2>&1 ) &
  pid=$!
  eval "pid_$label=$pid"
  eval "out_$label=$out"
}

# wait_step waits for a run_parallel step and prints its buffered output only
# on failure — steps are awaited in declaration order so messages stay stable
# even when several ran concurrently.
wait_step() {
  label="$1"
  eval "pid=\$pid_$label"
  eval "out=\$out_$label"
  if wait "$pid"; then
    rm -f "$out"
    ok "✔ $label passed"
  else
    status=$?
    fail "------ $label failed ------"
    cat "$out" >&2
    rm -f "$out"
    exit $status
  fi
}
