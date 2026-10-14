# Qué debe mostrar el portal

**Fecha:** 2026-10-14. Análisis de qué contenido aporta valor en el Portal de
Desarrollo HRL, con el Sistema de Reporte Estadístico como primer caso. Evalúa
las ideas propuestas (tecnologías, arquitectura, despliegue, procesos,
documentos en Drive) y suma las que faltan.

## 1. Para quién es y qué preguntas responde

El portal es para quien **construye y mantiene** los sistemas, no para el
personal clínico ni para las áreas que usan los sistemas. Cada página debe
responder rápido una de estas preguntas:

| Quién                    | Pregunta                                                    | Dónde se responde hoy                                |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------------- |
| Desarrollador nuevo      | ¿Qué es este sistema, cómo está hecho y cómo lo levanto?    | Disperso entre `README.md`, `docs/` y conversaciones |
| Desarrollador del equipo | ¿Qué pieza llama a cuál? ¿Qué rompo si cambio esto?         | En la cabeza de quien lo escribió                    |
| Responsable técnico / TI | ¿Dónde corre, qué expone, quién responde, cómo se recupera? | `docs/DESPLIEGUE.md` (bien), sin vista de conjunto   |
| Jefatura                 | ¿Qué sistemas hay, en qué estado y quién los sostiene?      | No existe                                            |

**Regla de fondo: el portal reúne, no duplica.** Lo técnico vive en el
repositorio (código, `catalog-info.yaml`, `docs/`) y el portal lo muestra. Si
algo se escribe a mano en el portal y no en el repo, se desactualiza. La única
excepción son los documentos de oficina (PDF, Word, Excel, actas), que viven en
un Drive institucional y el portal solo enlaza (sección 3.5).

## 2. El caso de Estadística: lo que ya hay

Lo revisé en la copia local (`Estadistica_Modulo_Nutrición`, rama `redesign`):

- **Tres piezas en el catálogo:** `estadistica-web` (React 19 + Vite 8 + kit
  `@hrl/core-ui`), `estadistica-api` (FastAPI + PostgreSQL, JWT) y
  `estadistica-bot-validador` (Node, lee Excel). Bien descritas y con responsable.
- **Documentación buena y honesta** en `docs/`: contexto, plan, despliegue,
  API del backend, indicadores. `DESPLIEGUE.md` ya tiene un diagrama (en texto)
  de quién llama a quién y qué se expone.
- **Un diagrama de proceso:** `docs/AS_IS 2.0.drawio`. Está en formato
  `.drawio`, que el portal **no** dibuja; necesita exportarse como `.drawio.svg`.
- **Falta en el catálogo:** la base de datos (no existe como entidad), la API
  como contrato (no hay entidad `API` ni OpenAPI) y las relaciones entre piezas
  más allá de `dependsOn` de la web.

<!-- prettier-ignore -->
!!! danger "Pendiente de seguridad"
    Hay un pendiente de seguridad en el repositorio de este proyecto que debe
    resolverse antes de documentarlo. El detalle está en las notas privadas del
    responsable del portal, no en este repositorio público.

## 3. Evaluación de las ideas propuestas

### 3.1 Tecnologías por capa (frontend, backend, BD, microservicios) — Sí, prioridad alta

Es lo primero que pregunta alguien que llega. **Ya está en el portal**: la
pestaña _Resumen_ de cada proyecto agrupa las etiquetas (`tags`) de sus
componentes en Frontend, Backend, Datos e Infraestructura, y la tarjeta del
proyecto muestra el stack.

Para que sea completo y no dependa de etiquetas sueltas:

1. **Cada capa como entidad del catálogo**, que es como Backstage lo entiende:
   - Frontend → `Component` con `type: website` (ya está).
   - Backend y microservicios → `Component` con `type: service` (ya está: API y bot).
   - Base de datos → `Resource` con `type: database`. Hoy **no existe**; al
     agregarla, aparece en el grafo y en la pestaña del proyecto.
   - Almacenamiento de archivos (volumen `cargas`) → `Resource` con `type: storage`.
2. **Versiones**: las etiquetas no llevan versión. Una página
   `docs/tecnologias.md` por repo con una tabla _tecnología · versión · para
   qué se usa · por qué se eligió_ responde lo que el portal no puede deducir.
3. **El kit `@hrl/core-ui`** merece una mención propia: qué versión usa cada
   frontend. Más adelante, una comprobación de calidad puede avisar cuando un
   proyecto queda atrás.

### 3.2 Arquitectura: cómo interactúan los elementos — Sí, prioridad alta

Dos niveles, que se complementan:

1. **Automático (sin dibujar nada):** el _Grafo del catálogo_ ya dibuja las
   relaciones declaradas en `catalog-info.yaml` (`dependsOn`, `providesApis`,
   `consumesApis`, `partOf`). Nunca se desactualiza, pero solo muestra lo que se
   declara. Para Estadística falta declarar: la API depende de la base y del bot;
   la API _provee_ `estadistica-api` (entidad `API`) y la web la _consume_.
2. **Dibujado (lo que el grafo no sabe):** diagramas con el modelo **C4**, en
   draw.io como `.drawio.svg` dentro de `docs/` (el portal permite ampliarlos):
   - _Contexto:_ el sistema, sus usuarios (las diez áreas, Estadística) y los
     sistemas externos (DIRESA, HIS).
   - _Contenedores:_ web, API, bot, PostgreSQL, volumen, con protocolos y puertos.
     El diagrama en texto de `DESPLIEGUE.md` es exactamente esto; conviene
     pasarlo a draw.io.

Recomiendo una pestaña **Arquitectura** en el subportal que muestre la página
`docs/arquitectura.md` del repo junto al grafo del sistema.

### 3.3 Arquitectura de despliegue — Sí, prioridad media-alta

`DESPLIEGUE.md` de Estadística ya es un buen modelo. Lo que conviene que el
portal muestre de un vistazo, para cada proyecto:

| Dato                               | Ejemplo en Estadística                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| Entornos y sus direcciones         | local, demo (sin servidor, en memoria), producción           |
| Qué se expone y qué no             | solo el frontend (`:80`); API, bot y `/docs` quedan internos |
| Dónde está la base                 | PostgreSQL del servidor, **fuera** de Docker                 |
| Cómo se despliega                  | `docker compose up -d --build`                               |
| Variables necesarias (sin valores) | `DATABASE_URL`, `JWT_SECRETO`, `PUERTO_WEB`                  |
| Respaldos y cómo se restauran      | _falta_                                                      |
| Quién tiene acceso al servidor     | _falta_                                                      |

Se resuelve con un diagrama de despliegue (`docs/despliegue.drawio.svg`) y los
**enlaces por entorno** en `catalog-info.yaml` (`metadata.links`), que el portal
ya muestra en la tarjeta _Acerca de_.

### 3.4 Diagramas de procesos — Sí, separando negocio de técnica

Hay dos tipos y conviene no mezclarlos:

- **Procesos de negocio** (para entender _qué_ hace el sistema): el ciclo del
  reporte mensual — el área carga el Excel, el bot valida, se entrega a la
  matriz, Estadística remite a DIRESA — y los **estados del reporte**
  (`CONTEXTO.md` §5). Ya existe `AS_IS 2.0.drawio`; falta el **TO-BE** (cómo
  funciona con el sistema).
- **Procesos técnicos** (para entender _cómo_): carga y validación de un Excel
  de punta a punta, inicio de sesión con JWT, despliegue de una versión nueva.
  Mejor como diagramas de secuencia.

Formato: draw.io (`.drawio.svg`), por decisión ya tomada. Cada diagrama, con un
párrafo que diga qué muestra y cuándo se actualizó.

### 3.5 Documentos PDF, JPG, DOCX enlazados a un Drive — Sí, con condiciones

Útil para la normativa, los formatos de DIRESA, las actas y los oficios, que no
son código. Condiciones para que no se convierta en un riesgo:

1. **Drive institucional, en una unidad compartida** del área, no en la cuenta
   personal de alguien: si esa persona se va, los enlaces mueren.
2. **Permisos restringidos** a la organización o a personas concretas. Nunca
   «cualquier persona con el enlace».
3. **Ningún dato de pacientes**, ni en el Drive enlazado. Los Excel con datos
   reales no se enlazan desde el portal.
4. **Qué va al repo y qué al Drive:**
   - Al repo (`docs/`): imágenes de la documentación, diagramas y PDFs de
     referencia pequeños y no sensibles. Se versionan con el código.
   - Al Drive: lo editable (Word, Excel), lo pesado (RAR, escaneados) y lo que
     tiene firma o sello.
     En Estadística, `Campos_Formato_Servicios_Intermedios_DIRESA.pdf`,
     `Indicadores_de_Gestion_Estadistica_HRL.pdf` y `OFICIOS_HRL.rar` están en la
     carpeta local pero no en git: son candidatos naturales al Drive.
5. **Cómo se muestran:** cada documento como enlace en `catalog-info.yaml`
   (`metadata.links`, con `title`, `type` e `icon`) y una pestaña **Documentos**
   en el subportal que los agrupe por tipo (normativa, formatos, actas,
   manuales), con el tipo de archivo visible.

## 4. Lo que agregaría y no estaba en la lista

Ordenado por valor frente a esfuerzo:

1. **La API como contrato (OpenAPI).** FastAPI genera la especificación sola.
   Exportarla a `servidor/api/openapi.json` y registrarla como entidad `API`
   hace que el portal muestre la documentación interactiva (el plugin ya está
   instalado), **sin** exponer `/docs` del servidor. Esfuerzo bajo, valor alto.
2. **Modelo de datos.** Diagrama entidad-relación y diccionario de datos de la
   base (los scripts de `servidor/api/bd/avance_04` son la verdad). Es lo que
   más cuesta reconstruir cuando alguien nuevo toca la base.
3. **Operación (runbooks).** Qué hacer cuando algo falla: reiniciar un servicio,
   el bot no responde, restaurar un respaldo, rotar `JWT_SECRETO`. Corto y
   concreto, con los comandos exactos.
4. **Decisiones (ADR).** `CONTEXTO.md` §8 ya las tiene; basta con un formato
   fijo (contexto · decisión · descartado) y la fecha.
5. **Glosario del dominio.** Las diez áreas, la matriz de destinos, DIRESA, HIS,
   los formatos. Evita malentendidos entre desarrollo y Estadística.
6. **Estado y hoja de ruta.** `PLAN.md` enlazado desde el resumen, y las
   versiones publicadas (releases de GitHub).
7. **Datos y seguridad.** Qué datos maneja el sistema (agregados o personales),
   quién accede y bajo qué norma (Ley N.° 29733 de Protección de Datos
   Personales). Para Estadística es corto, porque trabaja con cifras agregadas,
   pero hay que dejarlo escrito.

## 5. Lo que no debe ir al portal

- Datos de pacientes, en ninguna forma (capturas, Excel de ejemplo, volcados).
- Credenciales, tokens o el contenido de `.env`.
- Copias del `README` o de `docs/` escritas a mano en el portal: se desincronizan.
- Estados escritos a mano («avance: 80 %»): mienten en cuanto pasa una semana.
  Lo que se pueda medir (calidad, componentes, documentos) se calcula.

## 6. Propuesta concreta

### Subportal de un proyecto

| Pestaña            | Muestra                                                  | Sale de                                      |
| ------------------ | -------------------------------------------------------- | -------------------------------------------- |
| Resumen            | Descripción, cifras, stack por capa, enlaces por entorno | Catálogo (ya existe)                         |
| Arquitectura       | Diagramas C4 y grafo del sistema                         | `docs/arquitectura.md` + catálogo            |
| Componentes · APIs | Piezas, contratos OpenAPI                                | Catálogo (ya existe; falta la entidad `API`) |
| Despliegue         | Diagrama, entornos, qué se expone, respaldos             | `docs/despliegue.md`                         |
| Procesos           | Negocio (AS-IS / TO-BE, estados) y técnicos              | `docs/procesos.md`                           |
| Documentación      | La documentación técnica completa                        | TechDocs (ya existe)                         |
| Documentos         | PDF, Word, Excel, actas en el Drive                      | `metadata.links` en `catalog-info.yaml`      |
| Equipo             | Personas y contacto                                      | Equipos de GitHub (pendiente)                |
| Calidad            | Nivel de cada pieza                                      | Catálogo (ya existe)                         |

### Estructura estándar de `docs/` en cada repo

```text
docs/
  index.md            qué es y para quién
  arquitectura.md     C4: contexto y contenedores (.drawio.svg)
  tecnologias.md      tabla por capa, con versiones
  despliegue.md       entornos, diagrama, variables, respaldos
  procesos.md         negocio (AS-IS, TO-BE) y técnicos
  datos.md            modelo ER y diccionario de datos
  api.md              cómo autenticarse; el contrato va en openapi.json
  operacion.md        runbooks
  decisiones.md       ADR
  glosario.md
  img/                diagramas .drawio.svg e imágenes
```

La plantilla _Nuevo repositorio HRL_ puede traer esta estructura vacía, para
que cada proyecto nazca igual.

### Orden sugerido (Estadística como piloto)

1. **Seguridad, antes que nada:** resolver el pendiente de seguridad del
   repositorio (detalle en las notas privadas del responsable del portal).
2. **Solo contenido, sin tocar el portal:** en el repo de Estadística, exportar
   `AS_IS 2.0` a `.drawio.svg`, pasar el diagrama de `DESPLIEGUE.md` a draw.io,
   agregar la base como `Resource`, la API como entidad `API` con su
   `openapi.json` y las relaciones que faltan. Con eso, el grafo, las pestañas
   _APIs_ y el stack ya se completan solos.
3. **Portal:** pestañas _Arquitectura_, _Despliegue_, _Procesos_ y
   _Documentos_ que leen esas páginas y enlaces.
4. **Después:** modelo de datos, runbooks, comprobaciones de calidad nuevas
   (versión del kit, OpenAPI publicado, diagramas presentes).

## 7. Decisiones pendientes

1. ¿Qué Drive se usa y quién lo administra? (unidad compartida de la Oficina
   de Estadística o de TI).
2. Pendiente de seguridad del repositorio: ver notas privadas.
3. ¿Se adopta la estructura estándar de `docs/` para todos los repos?
4. Revisión de los archivos de datos versionados: ver notas privadas.

## 8. Estado de la implementación (2026-10-14)

El subportal de cada proyecto tiene las pestañas _Resumen · Arquitectura ·
Tecnologías · Despliegue · Procesos · Componentes · APIs · Documentación ·
Documentos · Equipo · Calidad_. Las cinco nuevas leen la **ficha técnica** del
proyecto.

| Idea                       | Estado en Estadística                                                                    | Qué falta                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Tecnologías por capa       | ✅ Frontend, backend, base de datos, microservicios e infraestructura, con versión y uso | Fijar las versiones que el repo no fija (FastAPI, Uvicorn, PyJWT) y la de PostgreSQL del servidor |
| Arquitectura general       | ✅ Diagrama + cómo leerlo + enlace al grafo del catálogo                                 | —                                                                                                 |
| Arquitectura de despliegue | ✅ Diagrama, entornos, qué se expone, variables, comandos y enlace a `DESPLIEGUE.md`     | **Respaldos**, **acceso al servidor** y **dirección de producción**                               |
| Procesos                   | ✅ Ciclo mensual del reporte y estados de un reporte                                     | Canal y día de la remisión a DIRESA                                                               |
| Documentos                 | ✅ Lista agrupada por tipo, con formato                                                  | **Carpeta del Drive** y el **enlace de cada documento**                                           |

Lo pendiente no se esconde: el portal lo muestra como «Pendiente», con qué hay
que completar y dónde.

### Dónde vive cada cosa

| Qué                                       | Dónde                                                    |
| ----------------------------------------- | -------------------------------------------------------- |
| Objetivo general (tarjeta del proyecto)   | `metadata.description` del sistema en `catalog/hrl.yaml` |
| Ficha técnica                             | `packages/app/public/fichas/<sistema>/ficha.json`        |
| Diagramas publicados (HTML)               | `packages/app/public/fichas/<sistema>/*.html`            |
| Fuente de los diagramas (JSON de archify) | `catalog/proyectos/<sistema>/diagramas/*.json`           |
| Pestañas                                  | `packages/app/src/modules/proyectos/PestanasFicha.tsx`   |

La ficha repite datos que viven en el repositorio del proyecto (versiones,
despliegue). Es una etapa: cuando el repo publique esa información en un
formato que el portal pueda leer, la ficha debe pasar a leerse de allí. Mientras
tanto, al cambiar una versión o el despliegue en el repo, actualiza también la
ficha y su fecha (`actualizado`).

### Completar lo pendiente

En `ficha.json`, reemplazar el `null` por el dato:

- `despliegue.respaldos`: cada cuánto se respaldan la base y el volumen
  `cargas`, dónde se guardan y cómo se restaura.
- `despliegue.acceso`: quién entra al servidor y con qué permisos. **Sin
  contraseñas.**
- `despliegue.entornos[].url` del entorno _Producción_ (y quitar su `pendiente`).
- `documentos.drive`: enlace a la carpeta del proyecto en la unidad compartida.
- `documentos.lista[].url`: enlace de cada documento. Antes de subir los
  _Oficios del HRL_, revisar que no contengan datos de pacientes.
- `tecnologias[].version` que estén en `null`.

### Regenerar un diagrama

Los diagramas se hacen con la skill **archify**. Desde la carpeta de la skill:

```bash
node bin/archify.mjs validate <tipo> <fuente.json> --quality showcase --json
node bin/archify.mjs deliver  <tipo> <fuente.json> <salida.html> --quality showcase --json
node bin/archify.mjs visual-check <salida.html> --json
```

`<tipo>` es `architecture`, `workflow` o `lifecycle`. La fuente está en
`catalog/proyectos/<sistema>/diagramas/` y la salida va a
`packages/app/public/fichas/<sistema>/`. `visual-check` deja capturas junto al
HTML: **muévelas fuera de `public/`** para que no se publiquen. Si cambia el
tamaño del lienzo (`viewBox`), actualiza `ancho` y `alto` del diagrama en la
ficha.

El portal incrusta cada diagrama con `?embed=1&theme=…`: sin la barra del visor
y con el tema del portal. La tipografía de los diagramas es JetBrains Mono, la
misma que usa el portal para lo técnico. La barra del visor en pantalla
completa y la palabra «Legend» quedan en inglés: archify solo trae la interfaz
en inglés y chino.

### Agregar la ficha de otro proyecto

1. Copiar `public/fichas/reporte-estadistico/` como
   `public/fichas/<sistema>/` y reemplazar su contenido.
2. Escribir sus diagramas en `catalog/proyectos/<sistema>/diagramas/` y
   publicarlos con archify.
3. El proyecto debe existir como `System` en `catalog/hrl.yaml`.

Sin ficha, las pestañas nuevas explican qué falta en vez de quedar vacías.
