# Launch backend and frontend in separate windows
$root = $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-File", "$root\start-backend.ps1"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-File", "$root\start-frontend.ps1"
Write-Host "AegisRoad starting — Frontend: http://localhost:3000  |  API docs: http://localhost:8000/docs"
