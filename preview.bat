@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  npm install
)

echo Starting dev server on http://localhost:5173
start "" "http://localhost:5173"
npm run dev -- --host 127.0.0.1 --port 5173
