#!/bin/bash

PORT=6006
PIDS=$(lsof -ti :$PORT 2>/dev/null)

if [ -n "$PIDS" ]; then
  echo "Port $PORT is already in use (PIDs: $(echo $PIDS | tr '\n' ' '))."
  read -p "Kill and restart Storybook? (y/N) " answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null
    while lsof -ti :$PORT >/dev/null 2>&1; do sleep 0.5; done
    echo "Port $PORT freed."
  else
    echo "Aborted."
    exit 0
  fi
fi

exec npx storybook dev -p $PORT --no-open
