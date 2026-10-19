# ${{ values.titulo }}

${{ values.descripcion }}

## Situación actual

${{ values.situacion }}

## Objetivo

{% if values.objetivo -%}
${{ values.objetivo }}
{%- else -%}
_Pendiente: qué tiene que lograr el proyecto y cómo se sabrá que lo logró._
{%- endif %}

## Alcance

_Qué entra y qué no entra en este proyecto._

- **Incluye:**
- **No incluye:**

## Usuarios

| Quién | Qué necesita del sistema |
|---|---|
| | |

!!! warning "Sin datos de pacientes"
    Ni en este repositorio ni en su documentación va ningún dato de pacientes:
    ni capturas con nombres, ni Excel de ejemplo, ni volcados de la base.

## Contenido de esta documentación

- [Proceso](proceso/index.md): cómo funciona hoy y cómo funcionará, con diagramas.
- [Arquitectura](arquitectura.md): piezas del sistema y cómo se conectan.
- [Tecnologías](tecnologias.md): con qué se construye y por qué.
- [Decisiones](decisiones/index.md): registro de las decisiones importantes.
