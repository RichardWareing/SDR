# SDR Management System - Development Environment Setup Script
# PowerShell script for Windows development environment setup

param(
    [switch]$SkipPrerequisites,
    [switch]$SkipInstall,
    [switch]$SkipConfiguration,
    [string]$NodeVersion = "18.17.0"
)

Write-Host "🚀 Setting up SDR Management System development environment..." -ForegroundColor Green

# Function to check if a command exists
function Test-CommandExists {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
if (-not $SkipPrerequisites) {
    Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    if (Test-CommandExists "node") {
        $nodeVersion = node --version
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found. Please install Node.js $NodeVersion or later." -ForegroundColor Red
        Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Cyan
        exit 1
    }
    
    # Check npm
    if (Test-CommandExists "npm") {
        $npmVersion = npm --version
        Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm not found." -ForegroundColor Red
        exit 1
    }
    
    # Check Git
    if (Test-CommandExists "git") {
        $gitVersion = git --version
        Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Git not found. Please install Git." -ForegroundColor Red
        Write-Host "   Download from: https://git-scm.com/" -ForegroundColor Cyan
        exit 1
    }
    
    # Check Azure Functions Core Tools
    if (Test-CommandExists "func") {
        $funcVersion = func --version
        Write-Host "✅ Azure Functions Core Tools found: v$funcVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Azure Functions Core Tools not found." -ForegroundColor Yellow
        Write-Host "   Install with: npm install -g azure-functions-core-tools@4" -ForegroundColor Cyan
        
        $install = Read-Host "Install Azure Functions Core Tools now? (y/N)"
        if ($install -eq "y" -or $install -eq "Y") {
            Write-Host "Installing Azure Functions Core Tools..." -ForegroundColor Yellow
            npm install -g azure-functions-core-tools@4
        }
    }
    
    # Check Azure CLI (optional)
    if (Test-CommandExists "az") {
        Write-Host "✅ Azure CLI found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Azure CLI not found (optional for deployment)" -ForegroundColor Yellow
        Write-Host "   Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Cyan
    }
}

# Install dependencies
if (-not $SkipInstall) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
    
    # Root dependencies
    Write-Host "Installing root workspace dependencies..." -ForegroundColor Cyan
    npm install
    
    # Frontend dependencies
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location "apps/frontend"
    npm install
    Set-Location "../.."
    
    # API dependencies
    Write-Host "Installing API dependencies..." -ForegroundColor Cyan
    Set-Location "apps/api"
    npm install
    Set-Location "../.."
    
    # Teams Bot dependencies
    Write-Host "Installing Teams Bot dependencies..." -ForegroundColor Cyan
    Set-Location "apps/teams-bot"
    npm install
    Set-Location "../.."
    
    # Shared package dependencies
    Write-Host "Installing shared package dependencies..." -ForegroundColor Cyan
    Set-Location "packages/shared"
    npm install
    Set-Location "../.."
    
    Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
}

# Configuration setup
if (-not $SkipConfiguration) {
    Write-Host "`n⚙️  Setting up configuration files..." -ForegroundColor Yellow
    
    # Create environment files if they don't exist
    $envFiles = @(
        @{Path = "apps/frontend/.env.local"; Template = "apps/frontend/.env.example"},
        @{Path = "apps/api/local.settings.json"; Template = "apps/api/local.settings.example.json"},
        @{Path = "apps/teams-bot/.env"; Template = "apps/teams-bot/.env.example"},
        @{Path = "tests/e2e/.env.test"; Template = "tests/e2e/.env.test.example"}
    )
    
    foreach ($envFile in $envFiles) {
        if (-not (Test-Path $envFile.Path)) {
            if (Test-Path $envFile.Template) {
                Copy-Item $envFile.Template $envFile.Path
                Write-Host "✅ Created $($envFile.Path)" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Template file not found: $($envFile.Template)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "ℹ️  Configuration file already exists: $($envFile.Path)" -ForegroundColor Cyan
        }
    }
    
    Write-Host "`n📝 Please update the following configuration files with your values:" -ForegroundColor Yellow
    Write-Host "   - apps/frontend/.env.local" -ForegroundColor Cyan
    Write-Host "   - apps/api/local.settings.json" -ForegroundColor Cyan
    Write-Host "   - apps/teams-bot/.env" -ForegroundColor Cyan
}

# Build projects
Write-Host "`n🔨 Building projects..." -ForegroundColor Yellow

# Build shared package first
Write-Host "Building shared package..." -ForegroundColor Cyan
Set-Location "packages/shared"
npm run build
Set-Location "../.."

# Build other projects
Write-Host "Building API..." -ForegroundColor Cyan
Set-Location "apps/api"
npm run build
Set-Location "../.."

Write-Host "Building Teams Bot..." -ForegroundColor Cyan
Set-Location "apps/teams-bot"
npm run build
Set-Location "../.."

Write-Host "Building Frontend..." -ForegroundColor Cyan
Set-Location "apps/frontend"
npm run build
Set-Location "../.."

# Run tests
Write-Host "`n🧪 Running tests..." -ForegroundColor Yellow

Write-Host "Running API tests..." -ForegroundColor Cyan
Set-Location "apps/api"
npm test
Set-Location "../.."

Write-Host "Running Frontend tests..." -ForegroundColor Cyan
Set-Location "apps/frontend"
npm test -- --watchAll=false
Set-Location "../.."

Write-Host "`n✅ Development environment setup completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update configuration files with your environment values" -ForegroundColor Cyan
Write-Host "2. Start the development servers:" -ForegroundColor Cyan
Write-Host "   - Frontend: npm run dev (in apps/frontend)" -ForegroundColor White
Write-Host "   - API: npm run dev (in apps/api)" -ForegroundColor White
Write-Host "   - Teams Bot: npm run dev (in apps/teams-bot)" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 to access the frontend" -ForegroundColor Cyan
Write-Host "`n📚 Documentation available in the /docs folder" -ForegroundColor Yellow
Write-Host "`nHappy coding! 🎉" -ForegroundColor Green