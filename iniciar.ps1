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

# Base local: el PostgreSQL de Windows (servicio postgresql-x64-18). Usuario y
# contraseña en .env; el rol se crea una vez (ver docs/levantamiento.md).
if (-not $env:POSTGRES_HOST) { $env:POSTGRES_HOST = '127.0.0.1' }
if (-not $env:POSTGRES_PORT) { $env:POSTGRES_PORT = '5432' }
if (-not $env:POSTGRES_USER -or -not $env:POSTGRES_PASSWORD) { throw 'Faltan POSTGRES_USER / POSTGRES_PASSWORD en .env.' }

$tcp = New-Object Net.Sockets.TcpClient
try { $tcp.Connect($env:POSTGRES_HOST, [int]$env:POSTGRES_PORT) }
catch { throw "PostgreSQL no responde en $($env:POSTGRES_HOST):$($env:POSTGRES_PORT). Revisa el servicio postgresql-x64-18." }
finally { $tcp.Dispose() }

# cmd /c evita que PowerShell 5.1 convierta la salida de error de docker en un error fatal.
cmd /c "docker info >nul 2>&1"
if ($LASTEXITCODE -ne 0) { Write-Warning 'Docker no está encendido: la documentación (TechDocs) no se podrá compilar.' }

yarn start
