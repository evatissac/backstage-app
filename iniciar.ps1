# Arranca el portal en local. Los secretos se leen de .env (ignorado por git)
# y se pasan como variables de entorno; nunca se escriben en app-config.
$ErrorActionPreference = 'Stop'
$env:Path = "$env:APPDATA\corepack-bin;$env:Path"
Set-Location $PSScriptRoot

if (Test-Path .env) {
  foreach ($linea in Get-Content .env) {
    if ($linea -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$') {
      Set-Item "env:$($Matches[1])" $Matches[2]
    }
  }
}

if (-not $env:GITHUB_TOKEN) {
  $env:GITHUB_TOKEN = gh auth token
  if (-not $env:GITHUB_TOKEN) { throw 'Sin GITHUB_TOKEN en .env ni sesión de GitHub CLI (gh auth login).' }
}

if (-not $env:AUTH_GITHUB_CLIENT_ID -or -not $env:AUTH_GITHUB_CLIENT_SECRET) {
  Write-Warning 'Faltan AUTH_GITHUB_CLIENT_ID / AUTH_GITHUB_CLIENT_SECRET en .env: solo funcionará el ingreso como invitado.'
}

# cmd /c evita que PowerShell 5.1 convierta la salida de error de docker en un error fatal.
cmd /c "docker info >nul 2>&1"
if ($LASTEXITCODE -ne 0) { Write-Warning 'Docker no está encendido: el catálogo funciona, pero TechDocs no podrá compilar la documentación.' }

yarn start
