#!/bin/bash

# Start Flask backend with Gunicorn
gunicorn --workers=1 --threads=100 --worker-class=gthread api.backend.index:app --bind=0.0.0.0:${PORT:-5328} &

# Start Next.js frontend in production mode
PORT=${NEXT_PORT:-3000} node .next/standalone/server.js 