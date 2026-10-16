#!/bin/sh
# Arranque del contenedor. Coolify entrega las variables que no tienen valor
# como cadena vacía, y Backstage no acepta una cadena vacía donde espera un
# texto: con GITHUB_TOKEN o las credenciales de OAuth vacías, cada plugin que
# usa GitHub falla al iniciar, la preparación queda en 503 y el contenedor se
# marca unhealthy («no available server»). Aquí se degrada en vez de caer.

# Sin token, la integración con GitHub queda anónima (límite bajo de la API y
# sin repos privados), pero el portal arranca.
if [ -z "${GITHUB_TOKEN:-}" ]; then
  unset GITHUB_TOKEN
  echo "AVISO: GITHUB_TOKEN sin valor. El portal arranca sin leer repositorios privados de GitHub." >&2
fi

# Sin credenciales de OAuth nadie puede ingresar (el guest está desactivado
# en producción), pero el portal arranca y lo dice con claridad.
if [ -z "${AUTH_GITHUB_CLIENT_ID:-}" ] || [ -z "${AUTH_GITHUB_CLIENT_SECRET:-}" ]; then
  export AUTH_GITHUB_CLIENT_ID=sin-configurar
  export AUTH_GITHUB_CLIENT_SECRET=sin-configurar
  echo "AVISO: AUTH_GITHUB_CLIENT_ID o AUTH_GITHUB_CLIENT_SECRET sin valor. El ingreso con GitHub no funcionará hasta cargarlos." >&2
fi

exec node packages/backend --config app-config.yaml --config app-config.production.yaml
