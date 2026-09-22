# Acentra Order Hub - One-Click Spring Boot Runner for Windows
# Requires Java 21

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Acentra Pulse: Concurrent Order Processing Backend     " -ForegroundColor Cyan
Write-Host "   Spring Boot 3 + Java 21 + RabbitMQ + WebSockets        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "[OK] Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green

# Check or download local Apache Maven
$MavenVersion = "3.9.9"
$MavenDir = Join-Path $ScriptDir ".maven\apache-maven-$MavenVersion"
$MvnBin = Join-Path $MavenDir "bin\mvn.cmd"

if (-not (Test-Path $MvnBin)) {
    Write-Host "[...] Downloading standalone Apache Maven $MavenVersion for Windows..." -ForegroundColor Yellow
    $ZipPath = Join-Path $ScriptDir ".maven\apache-maven-$MavenVersion-bin.zip"
    New-Item -ItemType Directory -Force -Path (Join-Path $ScriptDir ".maven") | Out-Null
    
    $DownloadUrl = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing
    
    Write-Host "[...] Extracting Maven..." -ForegroundColor Yellow
    Expand-Archive -Path $ZipPath -DestinationPath (Join-Path $ScriptDir ".maven") -Force
    Remove-Item $ZipPath -Force
}

Write-Host "[OK] Maven ready at: $MvnBin" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Compiling & Starting Spring Boot on http://localhost:8081" -ForegroundColor Green
Write-Host "WebSocket STOMP Channel: ws://localhost:8081/ws" -ForegroundColor Green
Write-Host "H2 In-Memory DB Console: http://localhost:8081/h2-console" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

& $MvnBin spring-boot:run
