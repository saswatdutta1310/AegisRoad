# Start AegisRoad React frontend (port 3000)
Set-Location $PSScriptRoot\Frontend
if (-not (Test-Path "node_modules")) {
  npm install
}
npm run dev
