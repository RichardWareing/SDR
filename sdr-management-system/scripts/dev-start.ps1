# SDR Management System - Development Start Script
# PowerShell script to start all development servers

param(
    [switch]$Frontend,
    [switch]$Api,
    [switch]$TeamsBot,
    [switch]$All
)

# If no specific service is requested, start all
if (-not ($Frontend -or $Api -or $TeamsBot)) {
    $All = $true
}

Write-Host "🚀 Starting SDR Management System development servers..." -ForegroundColor Green

# Function to start a service in a new terminal
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$WorkingDirectory,
        [string]$Command,
        [string]$Color = "Cyan"
    )
    
    Write-Host "Starting $ServiceName..." -ForegroundColor $Color
    
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "powershell"
    $startInfo.Arguments = "-NoExit -Command `"cd '$WorkingDirectory'; Write-Host '🟢 $ServiceName Server' -ForegroundColor $Color; $Command`""
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    [System.Diagnostics.Process]::Start($startInfo) | Out-Null
    Start-Sleep -Seconds 2
}

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Start shared package build in watch mode
Write-Host "Building shared package..." -ForegroundColor Yellow
Set-Location "packages/shared"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🟡 Shared Package Builder' -ForegroundColor Yellow; npm run dev" -WindowStyle Normal
Set-Location "../.."
Start-Sleep -Seconds 3

# Start API (Azure Functions)
if ($Api -or $All) {
    $apiPath = Join-Path (Get-Location) "apps\api"
    Start-Service -ServiceName "API" -WorkingDirectory $apiPath -Command "npm run dev" -Color "Blue"
}

# Start Frontend (React)
if ($Frontend -or $All) {
    $frontendPath = Join-Path (Get-Location) "apps\frontend"
    Start-Service -ServiceName "Frontend" -WorkingDirectory $frontendPath -Command "npm run dev" -Color "Green"
}

# Start Teams Bot
if ($TeamsBot -or $All) {
    $teamsPath = Join-Path (Get-Location) "apps\teams-bot"
    Start-Service -ServiceName "Teams Bot" -WorkingDirectory $teamsPath -Command "npm run dev" -Color "Magenta"
}

Write-Host "`n✅ Development servers are starting!" -ForegroundColor Green
Write-Host "`n📋 Service URLs:" -ForegroundColor Yellow

if ($Frontend -or $All) {
    Write-Host "   🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
}

if ($Api -or $All) {
    Write-Host "   🔌 API: http://localhost:7071" -ForegroundColor Cyan
    Write-Host "   📊 API Status: http://localhost:7071/api/health" -ForegroundColor Cyan
}

if ($TeamsBot -or $All) {
    Write-Host "   🤖 Teams Bot: http://localhost:3978" -ForegroundColor Cyan
    Write-Host "   💓 Bot Health: http://localhost:3978/api/health" -ForegroundColor Cyan
}

Write-Host "`n📝 Tips:" -ForegroundColor Yellow
Write-Host "   - Use Ctrl+C to stop individual services" -ForegroundColor White
Write-Host "   - Check logs in each terminal for debugging" -ForegroundColor White
Write-Host "   - API swagger docs: http://localhost:7071/api/swagger" -ForegroundColor White

if ($All) {
    Write-Host "`n⏰ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Optional: Open browser tabs
    $openBrowser = Read-Host "Open browser tabs? (y/N)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
        Start-Process "http://localhost:3000"  # Frontend
        Start-Process "http://localhost:7071/api/swagger"  # API docs
    }
}

Write-Host "`n🎉 Happy coding!" -ForegroundColor Green