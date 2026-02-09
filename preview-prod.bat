@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  npm install
)

echo Building production bundle...
npm run build

echo Starting preview server on http://localhost:4173
start "" "http://localhost:4173"
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
