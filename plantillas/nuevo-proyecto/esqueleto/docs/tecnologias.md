# Tecnologías

{% if values.tecnologias and values.tecnologias.length -%}
Previstas al crear el proyecto:

{% for t in values.tecnologias -%}
- `${{ t }}`
{% endfor %}
{%- else -%}
_Aún no se han elegido._
{%- endif %}

{% if values.notasTecnologias -%}
## Notas

${{ values.notasTecnologias }}
{%- endif %}

## Por qué

_Para cada elección importante, registra una [decisión](decisiones/index.md)._

Si el proyecto tiene interfaz para el personal del hospital, se recomienda el
kit `hrl-core-ui` para mantener el mismo aspecto que los demás sistemas.
