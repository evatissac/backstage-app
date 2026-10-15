import {
  createTranslationRef,
  createTranslationResource,
} from '@backstage/frontend-plugin-api';

/**
 * Textos que escribe el propio portal (no los plugins de Backstage).
 *
 * Los mensajes base van en inglés porque así los trata Backstage: son el
 * idioma de respaldo y lo que exporta `backstage-cli translations export`. El
 * español, que es el idioma por defecto, va en `textosHrlEs`. Una clave que
 * falte en español se muestra en inglés, nunca vacía.
 */
export const textosHrl = createTranslationRef({
  id: 'hrl',
  messages: {
    portal: {
      title: 'HRL Developer Portal',
    },
    ingreso: {
      github:
        'Sign in with your GitHub account, as a member of the DevHRL organization.',
      hospital: 'Hospital Regional de Loreto',
      lema: 'The systems the hospital builds, who owns each one and how they work, in one place.',
      puntoCatalogo: 'Catalog of projects and their components',
      puntoDocs: 'Technical documentation for every repository',
      puntoPacientes: 'No patient data: only code and documentation',
      titulo: 'Sign in',
      error: 'Could not sign in',
      comprobando: 'Checking your session…',
      conGithub: 'Continue with GitHub',
      invitado: 'Enter as guest (local only)',
      nota: 'Access is limited to members of the DevHRL organization on GitHub. If you cannot sign in, ask the portal owner to add you.',
      sinRespuesta: 'GitHub did not return an identity. Try again.',
    },
    barra: {
      search: 'Search',
      menu: 'Menu',
      settings: 'Settings',
      abrirMenu: 'Open menu',
      cerrarMenu: 'Close menu',
      buscarEnPortal: 'Search…',
      herramientas: 'Tools',
      contraer: 'Collapse sidebar',
      expandir: 'Expand sidebar',
      tusProyectos: 'Projects',
      explorar: 'Explore',
      hacer: 'Actions',
      estandares: 'Standards',
    },
    // Títulos de las páginas en la barra lateral (modules/nav/BarraLateral.tsx).
    paginas: {
      home: 'Home',
      proyectos: 'Projects',
      catalog: 'Catalog',
      scaffolder: 'Create',
      'api-docs': 'APIs',
      'catalog-graph': 'Catalog Graph',
      techdocs: 'Docs',
      autoservicio: 'Self-service',
      mapa: 'Map',
      'catalog-import': 'Register a component',
      notifications: 'Notifications',
      'app-visualizer': 'Visualizer',
      'user-settings': 'Settings',
      calidad: 'Quality',
      guia: 'Getting started',
    },
    portada: {
      queFalta: 'What is missing',
      verQueFalta: 'What is missing in {{nombre}}',
      saludoManana: 'Good morning, {{nombre}}',
      saludoTarde: 'Good afternoon, {{nombre}}',
      saludoNoche: 'Good evening, {{nombre}}',
      saludoSinNombre: 'Welcome',
      buscarEtiqueta: 'Search the portal',
      buscarPlaceholder: 'Search projects, components, docs…',
      buscarPista: 'Press Ctrl K from any page to search.',
      recientesVacioTitulo: 'Nothing visited yet',
      recientesVacioDescripcion:
        'The pages you open in the portal will appear here so you can get back to them.',
      recientes: 'What you viewed last',
      recientesError: 'Could not read your recent visits',
      claseDocs: 'Documentation',
      claseProyecto: 'Project',
      clasePagina: 'Portal page',
      tramo: {
        hoy: 'Today',
        ayer: 'Yesterday',
        semana: 'This week',
        antes: 'Earlier',
      },
    },
    proyectos: {
      titulo: 'Projects',
      intro:
        'Each project is a system of the catalog: open it to see what it is, how far along it is, how it is built and who works on it.',
      sinDescripcion: 'No description.',
      componentes: 'components',
      apis: 'APIs',
      documentos: 'docs',
      errorCarga: 'Could not load the projects',
      vacioTitulo: 'There are no projects yet',
      vacioDescripcion:
        'Projects are the systems defined in catalog/hrl.yaml. Once one is added there, it will appear here.',
      stack: 'Technology stack',
      abrir: 'Open',
    },
    proyecto: {
      pestanaResumen: 'Overview',
      pestanaComponentes: 'Components',
      pestanaDocumentacion: 'Documentation',
      pestanaApis: 'APIs',
      secciones: 'Project sections',
      responsable: 'Owner',
      dominio: 'Domain',
      enlace: 'Link',
      sinResponsable: 'No owner',
      personas: 'people',
      acerca: 'About',
      verEnCatalogo: 'View in catalog',
      errorCarga: 'Could not load the project',
      noExisteTitulo: 'There is no project called «{{nombre}}»',
      noExisteDescripcion:
        'It may have been renamed or removed from the catalog. Go back to the list to find it.',
      volver: 'Back to projects',
      sinPiezasTitulo: 'This project has nothing registered yet',
      sinPiezasDescripcion:
        'Components and APIs appear when a repository declares this system in its catalog-info.yaml (spec.system).',
      sinComponentesTitulo: 'No components',
      sinComponentesDescripcion:
        'No repository declares this system yet. Add catalog-info.yaml with spec.system to the repository and it will appear in up to 30 minutes.',
      sinApisTitulo: 'No APIs',
      sinApisDescripcion:
        'This project does not publish any API in the catalog. An API is declared as kind: API with spec.system.',
      sinDocsTitulo: 'No documentation published',
      sinDocsDescripcion:
        'A component publishes its documentation with mkdocs.yml, a docs/ folder and the backstage.io/techdocs-ref annotation.',
      columnaNombre: 'Name',
      columnaTipo: 'Type',
      columnaCiclo: 'Lifecycle',
      columnaResponsable: 'Owner',
      columnaDocs: 'Documentation',
      abrirDocs: 'Open',
      sinDocs: 'None',
      pestanaCalidad: 'Quality',
      stack: 'Stack',
      stackNota:
        'Taken from the tags of each component in its catalog-info.yaml.',
      capas: {
        frontend: 'Frontend',
        backend: 'Backend',
        datos: 'Data',
        infraestructura: 'Infrastructure',
        otras: 'Other',
      },
      pestanaArquitectura: 'Architecture',
      pestanaTecnologias: 'Technologies',
      pestanaDespliegue: 'Deployment',
      pestanaProcesos: 'Processes',
      pestanaDocumentos: 'Documents',
      verTecnologias: 'Versions and purpose of each technology',
      pestanaCalidadPruebas: 'Quality and tests',
      pestanaMiembros: 'Members',
      pestanaCatalogoVisual: 'Visual catalog',
      repositorios: 'Repositories',
      repositoriosAyuda:
        'The project code. Its README is the first read: what it is, how to run it and who to ask.',
      leerReadme: 'Read the README',
      sinReposTitulo: 'No repositories found',
      sinReposDescripcion:
        'The portal looks for repositories in the System links and in the source annotation of its components.',
      wikiGithub: '{{repo}} wiki',
      wikiGithubAyuda: 'Repository wiki on GitHub',
      pestanaFicha: 'Technical sheet',
      pestanaPiezas: 'Components and APIs',
      seccionesFicha: 'Technical sheet sections',
      columnaClase: 'Kind',
      clase: {
        component: 'Component',
        api: 'API',
        resource: 'Resource',
      },
      conDocs: 'Published',
      abrir: 'Open',
      abrirFicha: 'Open {{nombre}}',
      docsTecnicos: 'Technical documentation',
      docsTecnicosAyuda:
        'Published from each repository with TechDocs (mkdocs.yml and docs/).',
      docsInstitucionales: 'Institutional documents',
      docsInstitucionalesAyuda:
        'Regulations, forms, manuals and minutes of the project, kept in the institutional Drive.',
    },
    calidad: {
      titulo: 'Quality',
      intro:
        'Each component and API is measured by how many basic checks it meets: documentation, a README, automated tests, no credentials in the repository. The server evaluates them and keeps the history.',
      nota: 'The checks read the catalog-info.yaml of each repository (every 30 minutes) and some files of the repository itself (every 6 hours); they do not run the code.',
      filtroProyecto: 'Filter by project',
      todos: 'All',
      errorCarga: 'Could not evaluate quality',
      vacioTitulo: 'Nothing to evaluate',
      vacioDescripcion:
        'There are no components or APIs here yet. They appear when a repository declares them in its catalog-info.yaml.',
      progreso: '{{cumplidas}} of {{total}} checks',
      faltanEvaluar: '{{cuenta}} not evaluated yet',
      cumple: '(met)',
      noCumple: '(pending)',
      columnaProyecto: 'Project',
      columnaPuntaje: 'Checks',
      columnaFaltan: 'Missing',
      columnaCategoria: 'Category',
      todoCumplido: 'Everything met',
      sinDatos: 'No data',
      cifraCumplidas: 'checks met',
      ayudaCumplidas:
        'Checks met out of those that could be evaluated, adding up every component and API.',
      cifraDocs: 'with documentation',
      ayudaDocs: 'Share that publish their docs in the portal.',
      cifraReadme: 'with README',
      ayudaReadme: 'Share whose repository has a README at the root.',
      cifraSinEvaluar: 'not evaluated yet',
      ayudaSinEvaluar:
        'Components and APIs without any result yet: the portal has not read their repository or catalog entry.',
      categoria: {
        identificacion: 'Identification',
        documentacion: 'Documentation',
        repositorio: 'Repository',
        operacion: 'Operation',
      },
      reglas: {
        proyecto: {
          titulo: 'Belongs to a project',
          porque: 'It shows up in its project page and in its counts.',
          arreglo: 'Add spec.system, e.g. system: reporte-estadistico.',
        },
        descripcion: {
          titulo: 'Has a description',
          porque:
            'One sentence saves opening the repository to know what it does.',
          arreglo: 'Add metadata.description with at least one sentence.',
        },
        documentacion: {
          titulo: 'Publishes documentation',
          porque: 'The docs live next to the code and are read in the portal.',
          arreglo:
            'Add mkdocs.yml, a docs/ folder and the annotation backstage.io/techdocs-ref: dir:.',
        },
        repositorio: {
          titulo: 'Links its repository',
          porque: 'From the portal you can jump straight to the code.',
          arreglo: 'Add the annotation github.com/project-slug: DevHRL/<repo>.',
        },
        cicloDeVida: {
          titulo: 'Declares its lifecycle',
          porque:
            'It tells whether it is an experiment, in use, or being retired.',
          arreglo:
            'Add spec.lifecycle: experimental, production or deprecated.',
        },
        etiquetas: {
          titulo: 'Has technology tags',
          porque:
            'They let you find everything that uses, say, FastAPI or React.',
          arreglo: 'Add metadata.tags, e.g. tags: [react, vite].',
        },
        produccion: {
          titulo: 'Is in production',
          porque: 'It says whether the hospital already uses it every day.',
          arreglo: 'When it is in use, change spec.lifecycle to production.',
        },
        pruebas: {
          titulo: 'Has automated tests',
          porque:
            'Each change is checked on its own; without it, regressions are found by the users.',
          arreglo:
            'Add a GitHub Actions workflow in .github/workflows/ that runs the tests (or the smoke test) on each push.',
        },
        readme: {
          titulo: 'Has a README',
          porque:
            'It is the first thing anyone opens: what it is, how to run it and who to ask.',
          arreglo:
            'Add README.md at the root of the repository with those three answers.',
        },
        sinCredenciales: {
          titulo: 'No credentials in the repository',
          porque:
            'A password in git stays in the history even after deleting the file, and anyone with access can read it.',
          arreglo:
            'Rotate the exposed keys first, then remove the file and add it to .gitignore. Keep values in the server environment, never in the repository.',
        },
        codeowners: {
          titulo: 'Has CODEOWNERS',
          porque:
            'GitHub asks the right people to review each change automatically.',
          arreglo:
            'Add CODEOWNERS at the root, in .github/ or in docs/, e.g. «* @DevHRL/equipo-estadistica».',
        },
        kitFijado: {
          titulo: 'UI kit pinned to a version',
          porque:
            'With @hrl/core-ui pinned to a tag, a kit change never reaches the system until someone decides it.',
          arreglo:
            'Use the dependency with a tag (…hrl-core-ui.git#v1.2.3) and update it with npx hrl-core-ui upgrade.',
        },
      },
      sinEvaluar: 'Not evaluated',
      sinEvaluarRegla: '(not evaluated yet)',
      sinEvaluarAyuda:
        'There is no data for this check yet. The portal reads the catalog every 30 minutes and repositories every 6 hours; if it persists, the repository could not be read.',
      vistas: 'Quality views',
      vistaComponentes: 'By component',
      vistaReglas: 'By check',
      columnaRegla: 'Check',
      columnaCumplen: 'Meet it',
      cumplenDe: '{{cumplen}} of {{total}}',
      columnaSinEvaluar: 'Not evaluated',
      columnaArreglo: 'How to meet it',
    },
    guia: {
      listaTitulo: 'Getting started',
      listaProgreso: '{{hechos}} of {{total}} done',
      verGuia: 'Read the guide',
      ocultar: 'Hide getting started',
      pasos: {
        proyecto: 'Open a project',
        documentacion: 'Read some documentation',
        favorito: 'Star something in the catalog',
        calidad: 'Check the quality levels',
        plantilla: 'Create or document a repo with a template',
      },
      titulo: 'Getting started',
      intro:
        'How to find your way around the portal and how to bring your repository in. Six steps, from reading to publishing.',
      p1Titulo: 'Find your project',
      p1Texto:
        'Each hospital system has its own page: what it is, its progress, its documentation and its members.',
      p1Accion: 'Go to projects',
      p2Titulo: 'Read the documentation',
      p2Texto:
        'The docs are written in each repository and published here. Search with Ctrl K from any page.',
      p2Accion: 'Go to documentation',
      p3Titulo: 'Bring your repository in',
      p3Texto:
        'The recommended way is a template: it creates the files for you and leaves the change ready.',
      recomendado: 'Golden path',
      p3NuevoTitulo: 'New HRL repository',
      p3NuevoTexto:
        'For something that does not exist yet: creates the repo in DevHRL, already registered and documented.',
      p3ExistenteTitulo: 'Document an existing repository',
      p3ExistenteTexto:
        'For a repo that already exists: opens a pull request with the catalog file and the docs skeleton.',
      p3Manual:
        'If you prefer to do it by hand, add this file to the root of the repository:',
      p4Titulo: 'Publish the documentation',
      p4Texto:
        'Add mkdocs.yml next to catalog-info.yaml and write in the docs/ folder, starting with docs/index.md.',
      p4Nota:
        'Diagrams go as .drawio.svg files: the portal lets you zoom them.',
      p5Titulo: 'Raise your quality level',
      p5Texto:
        'Each component shows how many quality checks it meets and which are missing. Each check says how to fix it.',
      p5Accion: 'See quality',
      p6Titulo: 'Rules that are never broken',
      p6Regla1:
        'No patient data in the portal or the repositories: no names, no screenshots with data, no sample Excel files.',
      p6Regla2:
        'Passwords and keys go in .env, which git ignores. Never in the code or the docs.',
      p6Regla3: 'Every repository has a README that says how to run it.',
    },
    entidad: {
      contexto: 'Context',
      clase: 'Kind',
      tecnologias: 'Technologies',
      calidad: 'Quality',
      verDocumentacion: 'Documentation',
      verCodigo: 'Source code',
      editarFicha: 'Edit catalog entry',
      acciones: 'Actions',
      comprobaciones: 'Checks',
      verCalidad: 'All checks and how to meet them',
      proyecto: 'Project',
      sinProyecto: 'Not part of any project',
      ciclo: 'Lifecycle',
      favorito: 'Add to favorites',
      quitarFavorito: 'Remove from favorites',
      masAcciones: 'More actions',
      inspeccionar: 'Inspect entity',
      copiarEnlace: 'Copy link',
      enlaceCopiado: 'Link copied',
      enlaceNoCopiado: 'Could not copy the link',
      darDeBaja: 'Unregister entity',
    },
    catalogo: {
      titulo: 'Catalog',
      descripcion:
        'Everything registered in the portal: components, APIs, systems and resources.',
      crear: 'Create',
      tituloTodos: '{{tipo}}',
      tituloPropios: '{{tipo}} · owned by you',
      tituloFavoritos: '{{tipo}} · favorites',
      tipos: {
        component: 'Components',
        api: 'APIs',
        system: 'Systems',
        domain: 'Domains',
        resource: 'Resources',
        group: 'Teams',
        user: 'People',
        template: 'Templates',
        location: 'Locations',
      },
    },
    ficha: {
      errorCarga: "Could not load the project's technical sheet",
      sinFichaTitulo: 'This project has no technical sheet yet',
      sinFichaDescripcion:
        'Technologies, diagrams, deployment and documents are read from {{ruta}}. Copy the one from reporte-estadistico as a template.',
      pendiente: 'Pending',
      pantallaCompleta: 'Open full screen',
      fuentes: 'Updated on {{fecha}} from:',
      arquitecturaTitulo: 'General architecture',
      comoLeerlo: 'How to read it',
      grafoTitulo: 'Catalog graph',
      grafoTexto:
        "The same relationships, drawn automatically from each repository's catalog-info.yaml. It never goes out of date, but it only shows what is declared.",
      verGrafo: 'Open the graph',
      faltaDiagrama: 'Architecture diagram',
      faltaDiagramaDetalle:
        "Generate it with archify from catalog/proyectos/<project>/diagramas/ and add it to the project's ficha.json.",
      tecnologiasIntro:
        'What each part of the system is built with, its version and what it is used for.',
      capas: {
        frontend: 'Frontend',
        backend: 'Backend',
        'base-de-datos': 'Database',
        microservicios: 'Microservices',
        infraestructura: 'Infrastructure',
      },
      sinVersion: 'not pinned',
      sinVersionNota:
        '«Not pinned» means the repository does not fix the version: it installs the latest one available when building. Pinning it avoids surprises between environments.',
      faltaDespliegue: 'Deployment information',
      despliegueTitulo: 'Deployment architecture',
      entornos: 'Environments',
      exposicion: 'What is exposed',
      expuesto: 'Published',
      interno: 'Internal only',
      variables: 'Environment variables',
      variablesNota:
        "Only the names. The values live in the server's .env, never in the repository or in this portal.",
      comoDesplegar: 'How to deploy',
      respaldos: 'Backups and restore',
      faltaRespaldos:
        'Define how often the PostgreSQL database and the cargas volume are backed up, where the copies are kept and how to restore them. Then write it in the «respaldos» field of ficha.json.',
      acceso: 'Server access',
      faltaAcceso:
        'Write down who can enter the server and with what permissions (no passwords). Field «acceso» of ficha.json.',
      porConfirmar: 'To be confirmed',
      faltaProcesos: 'Process diagrams',
      abrirDrive: "Open the project's Drive folder",
      faltaDrive: 'Project folder in the Drive',
      faltaDriveDetalle:
        'Create it in an institutional shared drive (not a personal account), share it only with the organization and paste its link in «documentos.drive» of ficha.json. Nothing with patient data goes there.',
      sinDocumentosTitulo: 'No documents yet',
      sinDocumentosDescripcion:
        'Add each document to «documentos.lista» in ficha.json, with its type, format and Drive link.',
      tiposDocumento: {
        normativa: 'Regulations',
        formato: 'Forms',
        manual: 'Manuals',
        acta: 'Minutes',
        oficio: 'Official letters',
      },
      formato: '{{formato}} file',
      abrir: 'Open',
      faltaEnlace: 'Missing Drive link',
      pistaMovil:
        'On a small screen the diagram is hard to read: open it full screen to zoom in.',
    },
    tabla: {
      herramientas: 'Table tools',
      buscar: 'Search…',
      buscarEtiqueta: 'Search in {{tabla}}',
      filtrarPor: 'Filter by {{columna}}',
      todos: '{{columna}}: all',
      agruparPor: 'Group by',
      sinAgrupar: 'No grouping',
      agruparPorColumna: 'Group by {{columna}}',
      columnas: 'Show or hide columns',
      columnasVisibles: 'Visible columns',
      exportar: 'Export to CSV (what is shown)',
      acciones: 'Actions',
      sinValor: 'No value',
      resultados: '{{cuenta}} of {{total}} results',
      cargando: 'Loading…',
      rango: '{{desde}}–{{hasta}} of {{total}}',
      limpiar: 'Clear filters',
      sinCoincidenciasTitulo: 'Nothing matches the filters',
      sinCoincidenciasDescripcion:
        'There are records, but none matches the search or the selected filters. Clear them to see everything.',
    },
    migas: {
      etiqueta: 'Breadcrumb',
    },
    cifra: {
      sinDatos: 'No data',
      queEs: 'What does «{{cifra}}» count?',
    },
    autoservicio: {
      titulo: 'Self-service',
      intro:
        'What you can do on your own, without asking anyone: each action opens a short form and leaves a record in the run history.',
      historial: 'Run history',
      buscar: 'Search actions',
      empezar: 'Start',
      documentacion: 'How it works',
      masOpciones: 'More options for {{accion}}',
      copiarEnlace: 'Copy link to the form',
      enlaceCopiado: 'Link to the form copied',
      verEnCatalogo: 'View the template in the catalog',
      categoria: {
        proyecto: 'Create',
        documentacion: 'Document',
      },
      errorCarga: 'Could not load the actions',
      vacioTitulo: 'There are no actions yet',
      vacioDescripcion:
        'Actions are scaffolder templates registered in the catalog. Add one under plantillas/ in the portal repository and register it in app-config.yaml.',
      sinResultadosTitulo: 'No action matches the search',
      sinResultadosDescripcion:
        'Search by what you want to do (create, document) or by technology.',
      accionesDe: 'Actions for {{nombre}}',
      verTodas: 'All self-service actions',
    },
    docs: {
      intro:
        'All the documentation published in the portal, grouped by project. Each one is written in its repository (docs/ and mkdocs.yml).',
      columnaDocumento: 'Document',
      leer: 'Read',
      leerDe: 'Read {{nombre}}',
    },
    mapa: {
      titulo: 'Map',
      intro:
        'How the hospital projects relate to their components, APIs and resources. Everything comes from the catalog.',
      vistas: 'Map views',
      grafo: 'Graph',
      tarjetas: 'Cards',
      pista:
        'Click a node to open its entry. Click the graph to enable zoom with the mouse wheel.',
      errorCarga: 'Could not load the map',
      sinDominioTitulo: 'The hospital domain is not in the catalog',
      sinDominioDescripcion:
        'The map starts from the salud-hrl domain declared in catalog/hrl.yaml. Check that the file is registered in app-config.yaml.',
      clases: {
        domain: {
          titulo: 'Domains',
          ayuda:
            'The big area the systems belong to. Today there is one: the hospital systems.',
        },
        system: {
          titulo: 'Projects',
          ayuda:
            'Each system the hospital builds (System in the catalog). Each one has its own page.',
        },
        component: {
          titulo: 'Components',
          ayuda:
            'A piece of software with its own repository or folder: a website, a service, a library.',
        },
        api: {
          titulo: 'APIs',
          ayuda:
            'An interface a component offers to others, described with its definition (OpenAPI).',
        },
        resource: {
          titulo: 'Resources',
          ayuda: 'Infrastructure a project needs: databases, servers, storage.',
        },
        group: {
          titulo: 'Teams',
          ayuda:
            'Teams that own projects and components. They come from GitHub (DevHRL) or catalog/hrl.yaml.',
        },
      },
    },
    avance: {
      resumen: '{{completadas}} of {{total}} functions done',
      fuente: 'Open the plan',
      ayuda:
        'Read from the project plan in its repository: each deliverable marked [done] counts as complete; partially done, in progress or blocked counts as pending.',
      retiradas: '{{cuenta}} withdrawn deliverables are not counted.',
      pendientes: 'Pending',
      completadas: 'Done',
      ningunaPendiente: 'Nothing pending in the plan.',
      ningunaCompletada: 'Nothing completed yet.',
      errorCarga: 'Could not load the progress',
      sinPlanTitulo: 'This project does not declare its plan yet',
      sinPlanDescripcion:
        'Add the hrl/avance annotation to the System in catalog/hrl.yaml with the URL of its plan (e.g. docs/PLAN.md), with stages as «## Stage · **[done]**» and deliverables as table rows.',
      noLeidoTitulo: 'The plan could not be read',
      noLeidoDescripcion:
        'The portal could not read the declared plan: {{error}}',
    },
    miembros: {
      errorCarga: 'Could not load the members',
      resumenGrupos: 'Groups: {{grupos}} · People: {{personas}}',
      actualizado: 'updated by {{quien}} on {{fecha}}',
      sinGruposTitulo: 'This project has no groups yet',
      sinGruposDescripcion:
        'Create the groups of people who work on the project (e.g. Development, Statistics) and pick their members from the organization.',
      sinGruposSinPermiso:
        'An administrator of the organization on GitHub can create the groups of people who work on the project.',
      crearGrupos: 'Create groups',
      editarGrupos: 'Edit groups',
      editarTitulo: 'Project groups',
      editarAyuda:
        'Each group has a name and its people, chosen among the members of the organization on GitHub. Nothing is saved until you press Save.',
      filtrarPersonas: 'Filter people',
      nombreGrupo: 'Group name',
      grupoInicial: 'Development',
      quitarGrupo: 'Remove group {{grupo}}',
      agregarGrupo: 'Add group',
      grupoVacio: 'Nobody in this group yet.',
      guardar: 'Save',
      cancelar: 'Cancel',
      guardado: 'Groups saved',
      errorGuardar: 'Could not save the groups',
    },
    pruebas: {
      titulo: 'Automated tests',
      ayuda:
        'The latest run of each GitHub Actions workflow in the project repositories.',
      sinCi: 'This repository has no automated test runs.',
      sinCiCorto: 'No automated tests',
      sinCiTitulo: 'There are no automated tests yet',
      sinCiDescripcion:
        'None of the project repositories runs GitHub Actions. Add a workflow in .github/workflows/ that runs the tests on each push and the result will appear here.',
      errorCarga: 'Could not load the test results',
      resultado: {
        success: 'Passed',
        failure: 'Failed',
        en_curso: 'Running',
        otro: 'No result',
      },
    },
    catalogoVisual: {
      navegacion: 'Components of the visual catalog',
      buscar: 'Search components',
      sinResultados: 'No component matches',
      sinResultadosAyuda:
        'Search by group (Primitives, Layout…) or by component name.',
      vacioTitulo: 'The catalog has no stories',
      vacioDescripcion:
        'The published Ladle site does not list any story in its meta.json.',
      errorCarga: 'Could not load the visual catalog',
      verCodigo: 'Story code',
      pantallaCompleta: 'Open in Ladle',
      marco: 'Live preview: {{historia}}',
    },
  },
});

const es = {
  'portal.title': 'Portal de Desarrollo HRL',
  'ingreso.github':
    'Ingresa con tu cuenta de GitHub, como miembro de la organización DevHRL.',
  'ingreso.hospital': 'Hospital Regional de Loreto',
  'ingreso.lema':
    'Los sistemas que construye el hospital, quién responde por cada uno y cómo funcionan, en un solo lugar.',
  'ingreso.puntoCatalogo': 'Catálogo de proyectos y sus componentes',
  'ingreso.puntoDocs': 'Documentación técnica de cada repositorio',
  'ingreso.puntoPacientes':
    'Sin datos de pacientes: solo código y documentación',
  'ingreso.titulo': 'Ingresar',
  'ingreso.error': 'No se pudo ingresar',
  'ingreso.comprobando': 'Comprobando tu sesión…',
  'ingreso.conGithub': 'Continuar con GitHub',
  'ingreso.invitado': 'Entrar como invitado (solo en local)',
  'ingreso.nota':
    'El acceso es solo para miembros de la organización DevHRL en GitHub. Si no puedes entrar, pide al responsable del portal que te agregue.',
  'ingreso.sinRespuesta':
    'GitHub no devolvió una identidad. Inténtalo de nuevo.',
  'barra.search': 'Buscar',
  'barra.menu': 'Menú',
  'barra.settings': 'Ajustes',
  'barra.abrirMenu': 'Abrir menú',
  'barra.cerrarMenu': 'Cerrar menú',
  'barra.buscarEnPortal': 'Buscar…',
  'barra.herramientas': 'Herramientas',
  'barra.contraer': 'Contraer barra',
  'barra.expandir': 'Expandir barra',
  'paginas.home': 'Inicio',
  'paginas.proyectos': 'Proyectos',
  'paginas.catalog': 'Catálogo',
  'paginas.scaffolder': 'Crear',
  'paginas.api-docs': 'APIs',
  'paginas.catalog-graph': 'Grafo del catálogo',
  'paginas.techdocs': 'Documentación',
  'paginas.catalog-import': 'Registrar un componente',
  'paginas.notifications': 'Notificaciones',
  'paginas.app-visualizer': 'Visualizador',
  'paginas.user-settings': 'Ajustes',
  'portada.saludoManana': 'Buenos días, {{nombre}}',
  'portada.saludoTarde': 'Buenas tardes, {{nombre}}',
  'portada.saludoNoche': 'Buenas noches, {{nombre}}',
  'portada.saludoSinNombre': 'Te damos la bienvenida',
  'portada.buscarEtiqueta': 'Buscar en el portal',
  'portada.buscarPlaceholder': 'Busca proyectos, componentes, documentación…',
  'portada.buscarPista': 'Pulsa Ctrl K desde cualquier página para buscar.',
  'portada.recientesVacioTitulo': 'Todavía no has visitado nada',
  'portada.recientesVacioDescripcion':
    'Las páginas que abras en el portal aparecerán aquí para volver a ellas.',
  'proyectos.titulo': 'Proyectos',
  'proyectos.intro':
    'Cada proyecto es un sistema del catálogo: entra para ver qué es, en qué va, cómo está hecho y quiénes trabajan en él.',
  'proyectos.sinDescripcion': 'Sin descripción.',
  'proyectos.componentes': 'componentes',
  'proyectos.apis': 'APIs',
  'proyectos.documentos': 'documentos',
  'proyectos.errorCarga': 'No se pudieron cargar los proyectos',
  'proyectos.vacioTitulo': 'Todavía no hay proyectos',
  'proyectos.vacioDescripcion':
    'Los proyectos son los sistemas definidos en catalog/hrl.yaml. Cuando se agregue uno allí, aparecerá aquí.',
  'proyecto.pestanaResumen': 'Resumen',
  'proyecto.pestanaComponentes': 'Componentes',
  'proyecto.pestanaDocumentacion': 'Documentación',
  'proyecto.pestanaApis': 'APIs',
  'proyecto.secciones': 'Secciones del proyecto',
  'proyecto.responsable': 'Responsable',
  'proyecto.dominio': 'Dominio',
  'proyecto.enlace': 'Enlace',
  'proyecto.sinResponsable': 'Sin responsable',
  'proyecto.personas': 'personas',
  'proyecto.acerca': 'Acerca del proyecto',
  'proyecto.verEnCatalogo': 'Ver en el catálogo',
  'proyecto.errorCarga': 'No se pudo cargar el proyecto',
  'proyecto.noExisteTitulo': 'No hay ningún proyecto llamado «{{nombre}}»',
  'proyecto.noExisteDescripcion':
    'Puede que haya cambiado de nombre o que se haya quitado del catálogo. Vuelve a la lista para buscarlo.',
  'proyecto.volver': 'Volver a proyectos',
  'proyecto.sinPiezasTitulo': 'Este proyecto aún no tiene nada registrado',
  'proyecto.sinPiezasDescripcion':
    'Los componentes y las APIs aparecen cuando un repositorio declara este sistema en su catalog-info.yaml (spec.system).',
  'proyecto.sinComponentesTitulo': 'Sin componentes',
  'proyecto.sinComponentesDescripcion':
    'Ningún repositorio declara este sistema todavía. Agrega catalog-info.yaml con spec.system al repositorio y aparecerá en un máximo de 30 minutos.',
  'proyecto.sinApisTitulo': 'Sin APIs',
  'proyecto.sinApisDescripcion':
    'Este proyecto no publica ninguna API en el catálogo. Una API se declara como kind: API con spec.system.',
  'proyecto.sinDocsTitulo': 'Sin documentación publicada',
  'proyecto.sinDocsDescripcion':
    'Un componente publica su documentación con mkdocs.yml, una carpeta docs/ y la anotación backstage.io/techdocs-ref.',
  'proyecto.columnaNombre': 'Nombre',
  'proyecto.columnaTipo': 'Tipo',
  'proyecto.columnaCiclo': 'Ciclo de vida',
  'proyecto.columnaResponsable': 'Responsable',
  'proyecto.columnaDocs': 'Documentación',
  'proyecto.abrirDocs': 'Abrir',
  'proyecto.sinDocs': 'Ninguna',
  'paginas.calidad': 'Calidad',
  'paginas.guia': 'Primeros pasos',
  'barra.tusProyectos': 'Proyectos',
  'proyecto.pestanaCalidad': 'Calidad',
  'calidad.titulo': 'Calidad',
  'calidad.intro':
    'Cada componente y API se mide por cuántas comprobaciones básicas cumple: documentación, un README, pruebas automáticas, nada de credenciales en el repositorio. Las evalúa el servidor y guarda el historial.',
  'calidad.nota':
    'Las comprobaciones leen el catalog-info.yaml de cada repositorio (cada 30 minutos) y algunos archivos del propio repositorio (cada 6 horas); no ejecutan el código.',
  'calidad.filtroProyecto': 'Filtrar por proyecto',
  'calidad.todos': 'Todos',
  'calidad.errorCarga': 'No se pudo evaluar la calidad',
  'calidad.vacioTitulo': 'Nada que evaluar',
  'calidad.vacioDescripcion':
    'Aquí aún no hay componentes ni APIs. Aparecen cuando un repositorio los declara en su catalog-info.yaml.',
  'calidad.progreso': '{{cumplidas}} de {{total}} comprobaciones',
  'calidad.cumple': '(cumplida)',
  'calidad.noCumple': '(pendiente)',
  'calidad.columnaProyecto': 'Proyecto',
  'calidad.todoCumplido': 'Todo cumplido',
  'calidad.sinDatos': 'Sin datos',
  'calidad.cifraDocs': 'con documentación',
  'calidad.ayudaDocs': 'Porcentaje que publica su documentación en el portal.',
  'calidad.reglas.proyecto.titulo': 'Pertenece a un proyecto',
  'calidad.reglas.proyecto.porque':
    'Así aparece en la portada de su proyecto y en sus cifras.',
  'calidad.reglas.proyecto.arreglo':
    'Agrega spec.system, por ejemplo system: reporte-estadistico.',
  'calidad.reglas.descripcion.titulo': 'Tiene descripción',
  'calidad.reglas.descripcion.porque':
    'Una frase evita abrir el repositorio para saber qué hace.',
  'calidad.reglas.descripcion.arreglo':
    'Agrega metadata.description con al menos una frase.',
  'calidad.reglas.documentacion.titulo': 'Publica documentación',
  'calidad.reglas.documentacion.porque':
    'La documentación vive junto al código y se lee en el portal.',
  'calidad.reglas.documentacion.arreglo':
    'Agrega mkdocs.yml, una carpeta docs/ y la anotación backstage.io/techdocs-ref: dir:.',
  'calidad.reglas.repositorio.titulo': 'Enlaza su repositorio',
  'calidad.reglas.repositorio.porque':
    'Desde el portal se llega directo al código.',
  'calidad.reglas.repositorio.arreglo':
    'Agrega la anotación github.com/project-slug: DevHRL/<repo>.',
  'calidad.reglas.cicloDeVida.titulo': 'Declara su ciclo de vida',
  'calidad.reglas.cicloDeVida.porque':
    'Dice si es un experimento, si está en uso o si se está retirando.',
  'calidad.reglas.cicloDeVida.arreglo':
    'Agrega spec.lifecycle: experimental, production o deprecated.',
  'calidad.reglas.etiquetas.titulo': 'Tiene etiquetas de tecnología',
  'calidad.reglas.etiquetas.porque':
    'Permiten encontrar todo lo que usa, por ejemplo, FastAPI o React.',
  'calidad.reglas.etiquetas.arreglo':
    'Agrega metadata.tags, por ejemplo tags: [react, vite].',
  'calidad.reglas.produccion.titulo': 'Está en producción',
  'calidad.reglas.produccion.porque':
    'Dice si el hospital ya lo usa todos los días.',
  'calidad.reglas.produccion.arreglo':
    'Cuando esté en uso, cambia spec.lifecycle a production.',
  'calidad.reglas.readme.titulo': 'Tiene README',
  'calidad.reglas.readme.porque':
    'Es lo primero que cualquiera abre: qué es, cómo se ejecuta y a quién preguntar.',
  'calidad.reglas.readme.arreglo':
    'Agrega README.md en la raíz del repositorio con esas tres respuestas.',
  'calidad.reglas.sinCredenciales.titulo': 'Sin credenciales en el repositorio',
  'calidad.reglas.sinCredenciales.porque':
    'Una contraseña en git queda en el historial aunque se borre el archivo, y cualquiera con acceso puede leerla.',
  'calidad.reglas.sinCredenciales.arreglo':
    'Primero rota las claves expuestas, luego quita el archivo y agrégalo a .gitignore. Los valores van en el entorno del servidor, nunca en el repositorio.',
  'calidad.reglas.codeowners.titulo': 'Tiene CODEOWNERS',
  'calidad.reglas.codeowners.porque':
    'GitHub pide revisión a las personas correctas en cada cambio, sin que nadie tenga que acordarse.',
  'calidad.reglas.codeowners.arreglo':
    'Agrega CODEOWNERS en la raíz, en .github/ o en docs/, p. ej. «* @DevHRL/equipo-estadistica».',
  'calidad.reglas.kitFijado.titulo': 'Kit de UI fijado a una versión',
  'calidad.reglas.kitFijado.porque':
    'Con @hrl/core-ui fijado a un tag, un cambio del kit no llega al sistema hasta que alguien lo decide.',
  'calidad.reglas.kitFijado.arreglo':
    'Usa la dependencia con un tag (…hrl-core-ui.git#v1.2.3) y actualízala con npx hrl-core-ui upgrade.',
  'calidad.sinEvaluar': 'Sin evaluar',
  'calidad.sinEvaluarRegla': '(aún sin evaluar)',
  'calidad.sinEvaluarAyuda':
    'Todavía no hay datos para esta comprobación. El portal lee el catálogo cada 30 minutos y los repositorios cada 6 horas; si sigue así, no se pudo leer el repositorio.',
  'calidad.vistas': 'Vistas de calidad',
  'calidad.vistaComponentes': 'Por componente',
  'calidad.vistaReglas': 'Por comprobación',
  'calidad.columnaRegla': 'Comprobación',
  'calidad.columnaCumplen': 'La cumplen',
  'calidad.cumplenDe': '{{cumplen}} de {{total}}',
  'calidad.columnaSinEvaluar': 'Sin evaluar',
  'calidad.columnaArreglo': 'Cómo cumplirla',
  'guia.listaTitulo': 'Primeros pasos',
  'guia.listaProgreso': '{{hechos}} de {{total}} hechos',
  'guia.verGuia': 'Ver la guía',
  'guia.ocultar': 'Ocultar primeros pasos',
  'guia.pasos.proyecto': 'Abre un proyecto',
  'guia.pasos.documentacion': 'Lee una documentación',
  'guia.pasos.favorito': 'Marca algo como favorito en el catálogo',
  'guia.pasos.calidad': 'Revisa los niveles de calidad',
  'guia.pasos.plantilla': 'Crea o documenta un repo con una plantilla',
  'guia.titulo': 'Primeros pasos',
  'guia.intro':
    'Cómo orientarte en el portal y cómo sumar tu repositorio. Seis pasos, de leer a publicar.',
  'guia.p1Titulo': 'Encuentra tu proyecto',
  'guia.p1Texto':
    'Cada sistema del hospital tiene su portada: qué es, en qué va, su documentación y sus miembros.',
  'guia.p1Accion': 'Ir a proyectos',
  'guia.p2Titulo': 'Lee la documentación',
  'guia.p2Texto':
    'La documentación se escribe en cada repositorio y se publica aquí. Busca con Ctrl K desde cualquier página.',
  'guia.p2Accion': 'Ir a documentación',
  'guia.p3Titulo': 'Suma tu repositorio',
  'guia.p3Texto':
    'El camino recomendado es una plantilla: crea los archivos por ti y deja el cambio listo.',
  'guia.recomendado': 'Camino dorado',
  'guia.p3NuevoTitulo': 'Nuevo repositorio HRL',
  'guia.p3NuevoTexto':
    'Para algo que aún no existe: crea el repo en DevHRL, ya registrado y documentado.',
  'guia.p3ExistenteTitulo': 'Documentar un repositorio existente',
  'guia.p3ExistenteTexto':
    'Para un repo que ya existe: abre un pull request con la ficha del catálogo y el esqueleto de la documentación.',
  'guia.p3Manual':
    'Si prefieres hacerlo a mano, agrega este archivo en la raíz del repositorio:',
  'guia.p4Titulo': 'Publica la documentación',
  'guia.p4Texto':
    'Agrega mkdocs.yml junto a catalog-info.yaml y escribe en la carpeta docs/, empezando por docs/index.md.',
  'guia.p4Nota':
    'Los diagramas van como archivos .drawio.svg: el portal permite ampliarlos.',
  'guia.p5Titulo': 'Sube de nivel de calidad',
  'guia.p5Texto':
    'Cada componente muestra cuántas comprobaciones de calidad cumple y cuáles le faltan. Cada comprobación dice cómo resolverla.',
  'guia.p5Accion': 'Ver calidad',
  'guia.p6Titulo': 'Reglas que no se rompen',
  'guia.p6Regla1':
    'Ningún dato de pacientes en el portal ni en los repositorios: ni nombres, ni capturas con datos, ni Excel de ejemplo.',
  'guia.p6Regla2':
    'Las contraseñas y claves van en .env, que git ignora. Nunca en el código ni en la documentación.',
  'guia.p6Regla3': 'Todo repositorio tiene un README que dice cómo ejecutarlo.',
  'entidad.proyecto': 'Proyecto',
  'entidad.sinProyecto': 'No pertenece a ningún proyecto',
  'entidad.ciclo': 'Ciclo de vida',
  'entidad.favorito': 'Agregar a favoritos',
  'entidad.quitarFavorito': 'Quitar de favoritos',
  'entidad.masAcciones': 'Más acciones',
  'entidad.inspeccionar': 'Inspeccionar entidad',
  'entidad.copiarEnlace': 'Copiar enlace',
  'entidad.enlaceCopiado': 'Enlace copiado',
  'entidad.enlaceNoCopiado': 'No se pudo copiar el enlace',
  'entidad.darDeBaja': 'Dar de baja la entidad',
  'catalogo.titulo': 'Catálogo',
  'catalogo.descripcion':
    'Todo lo registrado en el portal: componentes, APIs, sistemas y recursos.',
  'catalogo.crear': 'Crear',
  'catalogo.tituloTodos': '{{tipo}}',
  'catalogo.tituloPropios': '{{tipo}} · a tu cargo',
  'catalogo.tituloFavoritos': '{{tipo}} · favoritos',
  'catalogo.tipos.component': 'Componentes',
  'catalogo.tipos.api': 'APIs',
  'catalogo.tipos.system': 'Sistemas',
  'catalogo.tipos.domain': 'Dominios',
  'catalogo.tipos.resource': 'Recursos',
  'catalogo.tipos.group': 'Equipos',
  'catalogo.tipos.user': 'Personas',
  'catalogo.tipos.template': 'Plantillas',
  'catalogo.tipos.location': 'Ubicaciones',
  'proyectos.stack': 'Tecnologías',
  'proyectos.abrir': 'Abrir',
  'proyecto.stack': 'Stack',
  'proyecto.stackNota':
    'Sale de las etiquetas (tags) de cada componente en su catalog-info.yaml.',
  'proyecto.capas.frontend': 'Frontend',
  'proyecto.capas.backend': 'Backend',
  'proyecto.capas.datos': 'Datos',
  'proyecto.capas.infraestructura': 'Infraestructura',
  'proyecto.capas.otras': 'Otras',
  'proyecto.pestanaArquitectura': 'Arquitectura',
  'proyecto.pestanaTecnologias': 'Tecnologías',
  'proyecto.pestanaDespliegue': 'Despliegue',
  'proyecto.pestanaProcesos': 'Procesos',
  'proyecto.pestanaDocumentos': 'Documentos',
  'proyecto.verTecnologias': 'Versiones y para qué se usa cada tecnología',
  'ficha.errorCarga': 'No se pudo cargar la ficha técnica del proyecto',
  'ficha.sinFichaTitulo': 'Este proyecto aún no tiene ficha técnica',
  'ficha.sinFichaDescripcion':
    'Las tecnologías, los diagramas, el despliegue y los documentos se leen de {{ruta}}. Copia la de reporte-estadistico como plantilla.',
  'ficha.pendiente': 'Pendiente',
  'ficha.pantallaCompleta': 'Abrir en pantalla completa',
  'ficha.fuentes': 'Actualizado el {{fecha}} a partir de:',
  'ficha.arquitecturaTitulo': 'Arquitectura general',
  'ficha.comoLeerlo': 'Cómo leerlo',
  'ficha.grafoTitulo': 'Grafo del catálogo',
  'ficha.grafoTexto':
    'Las mismas relaciones, dibujadas solas a partir del catalog-info.yaml de cada repositorio. Nunca se desactualiza, pero solo muestra lo que está declarado.',
  'ficha.verGrafo': 'Abrir el grafo',
  'ficha.faltaDiagrama': 'Diagrama de arquitectura',
  'ficha.faltaDiagramaDetalle':
    'Genéralo con archify desde catalog/proyectos/<proyecto>/diagramas/ y agrégalo al ficha.json del proyecto.',
  'ficha.tecnologiasIntro':
    'Con qué está hecha cada parte del sistema, en qué versión y para qué se usa.',
  'ficha.capas.frontend': 'Frontend',
  'ficha.capas.backend': 'Backend',
  'ficha.capas.base-de-datos': 'Base de datos',
  'ficha.capas.microservicios': 'Microservicios',
  'ficha.capas.infraestructura': 'Infraestructura',
  'ficha.sinVersion': 'sin fijar',
  'ficha.sinVersionNota':
    '«Sin fijar» significa que el repositorio no fija la versión: instala la última disponible al compilar. Fijarla evita sorpresas entre entornos.',
  'ficha.faltaDespliegue': 'Información de despliegue',
  'ficha.despliegueTitulo': 'Arquitectura de despliegue',
  'ficha.entornos': 'Entornos',
  'ficha.exposicion': 'Qué se expone',
  'ficha.expuesto': 'Publicado',
  'ficha.interno': 'Solo interno',
  'ficha.variables': 'Variables de entorno',
  'ficha.variablesNota':
    'Solo los nombres. Los valores viven en el .env del servidor, nunca en el repositorio ni en este portal.',
  'ficha.comoDesplegar': 'Cómo se despliega',
  'ficha.respaldos': 'Respaldos y restauración',
  'ficha.faltaRespaldos':
    'Definir cada cuánto se respalda la base PostgreSQL y el volumen cargas, dónde se guardan las copias y cómo se restauran. Luego escribirlo en el campo «respaldos» de ficha.json.',
  'ficha.acceso': 'Acceso al servidor',
  'ficha.faltaAcceso':
    'Anotar quién puede entrar al servidor y con qué permisos (sin contraseñas). Campo «acceso» de ficha.json.',
  'ficha.porConfirmar': 'Por confirmar',
  'ficha.faltaProcesos': 'Diagramas de procesos',
  'ficha.abrirDrive': 'Abrir la carpeta del proyecto en el Drive',
  'ficha.faltaDrive': 'Carpeta del proyecto en el Drive',
  'ficha.faltaDriveDetalle':
    'Crearla en una unidad compartida institucional (no en una cuenta personal), compartirla solo con la organización y pegar su enlace en «documentos.drive» de ficha.json. Nada con datos de pacientes va allí.',
  'ficha.sinDocumentosTitulo': 'Aún no hay documentos',
  'ficha.sinDocumentosDescripcion':
    'Agrega cada documento a «documentos.lista» en ficha.json, con su tipo, formato y enlace del Drive.',
  'ficha.tiposDocumento.normativa': 'Normativa',
  'ficha.tiposDocumento.formato': 'Formatos',
  'ficha.tiposDocumento.manual': 'Manuales',
  'ficha.tiposDocumento.acta': 'Actas',
  'ficha.tiposDocumento.oficio': 'Oficios',
  'ficha.formato': 'archivo {{formato}}',
  'ficha.abrir': 'Abrir',
  'ficha.faltaEnlace': 'Falta el enlace del Drive',
  'ficha.pistaMovil':
    'En una pantalla pequeña el diagrama se lee mal: ábrelo en pantalla completa para ampliarlo.',
  'tabla.herramientas': 'Herramientas de la tabla',
  'tabla.buscar': 'Buscar…',
  'tabla.buscarEtiqueta': 'Buscar en {{tabla}}',
  'tabla.filtrarPor': 'Filtrar por {{columna}}',
  'tabla.todos': '{{columna}}: todos',
  'tabla.agruparPor': 'Agrupar por',
  'tabla.sinAgrupar': 'Sin agrupar',
  'tabla.agruparPorColumna': 'Agrupar por {{columna}}',
  'tabla.columnas': 'Mostrar u ocultar columnas',
  'tabla.columnasVisibles': 'Columnas visibles',
  'tabla.exportar': 'Exportar a CSV (lo que se ve)',
  'tabla.acciones': 'Acciones',
  'tabla.sinValor': 'Sin valor',
  'tabla.resultados': '{{cuenta}} de {{total}} resultados',
  'tabla.cargando': 'Cargando…',
  'tabla.rango': '{{desde}}–{{hasta}} de {{total}}',
  'tabla.limpiar': 'Quitar filtros',
  'tabla.sinCoincidenciasTitulo': 'Nada coincide con los filtros',
  'tabla.sinCoincidenciasDescripcion':
    'Hay registros, pero ninguno coincide con la búsqueda o los filtros elegidos. Quítalos para ver todo.',
  'cifra.sinDatos': 'Sin datos',
  'cifra.queEs': '¿Qué cuenta «{{cifra}}»?',
  'proyecto.pestanaFicha': 'Ficha técnica',
  'proyecto.pestanaPiezas': 'Componentes y APIs',
  'proyecto.seccionesFicha': 'Secciones de la ficha técnica',
  'proyecto.columnaClase': 'Clase',
  'proyecto.clase.component': 'Componente',
  'proyecto.clase.api': 'API',
  'proyecto.clase.resource': 'Recurso',
  'proyecto.conDocs': 'Publicada',
  'proyecto.abrir': 'Abrir',
  'proyecto.abrirFicha': 'Abrir {{nombre}}',
  'proyecto.docsTecnicos': 'Documentación técnica',
  'proyecto.docsTecnicosAyuda':
    'Se publica desde cada repositorio con TechDocs (mkdocs.yml y docs/).',
  'proyecto.docsInstitucionales': 'Documentos institucionales',
  'proyecto.docsInstitucionalesAyuda':
    'Normativa, formatos, manuales y actas del proyecto, guardados en el Drive institucional.',
  'migas.etiqueta': 'Ruta de navegación',
  'barra.explorar': 'Explorar',
  'barra.hacer': 'Acciones',
  'barra.estandares': 'Estándares',
  'paginas.autoservicio': 'Autoservicio',
  'paginas.mapa': 'Mapa',
  'autoservicio.titulo': 'Autoservicio',
  'autoservicio.intro':
    'Lo que puedes hacer por tu cuenta, sin pedírselo a nadie: cada acción abre un formulario corto y deja constancia en el historial de ejecuciones.',
  'autoservicio.historial': 'Historial de ejecuciones',
  'autoservicio.buscar': 'Buscar acciones',
  'autoservicio.empezar': 'Empezar',
  'autoservicio.documentacion': 'Cómo funciona',
  'autoservicio.masOpciones': 'Más opciones de {{accion}}',
  'autoservicio.copiarEnlace': 'Copiar enlace al formulario',
  'autoservicio.enlaceCopiado': 'Enlace al formulario copiado',
  'autoservicio.verEnCatalogo': 'Ver la plantilla en el catálogo',
  'autoservicio.categoria.proyecto': 'Crear',
  'autoservicio.categoria.documentacion': 'Documentar',
  'autoservicio.errorCarga': 'No se pudieron cargar las acciones',
  'autoservicio.vacioTitulo': 'Todavía no hay acciones',
  'autoservicio.vacioDescripcion':
    'Las acciones son plantillas del scaffolder registradas en el catálogo. Agrega una en plantillas/ del repositorio del portal y regístrala en app-config.yaml.',
  'autoservicio.sinResultadosTitulo': 'Ninguna acción coincide con la búsqueda',
  'autoservicio.sinResultadosDescripcion':
    'Busca por lo que quieres hacer (crear, documentar) o por tecnología.',
  'autoservicio.accionesDe': 'Acciones de {{nombre}}',
  'autoservicio.verTodas': 'Todas las acciones de Autoservicio',
  'entidad.contexto': 'Contexto',
  'entidad.clase': 'Clase',
  'entidad.tecnologias': 'Tecnologías',
  'entidad.calidad': 'Calidad',
  'entidad.verDocumentacion': 'Documentación',
  'entidad.verCodigo': 'Código fuente',
  'entidad.editarFicha': 'Editar la ficha',
  'entidad.acciones': 'Acciones',
  'entidad.comprobaciones': 'Comprobaciones',
  'entidad.verCalidad': 'Todas las comprobaciones y cómo cumplirlas',
  'portada.queFalta': 'Qué falta',
  'portada.verQueFalta': 'Qué le falta a {{nombre}}',
  'mapa.titulo': 'Mapa',
  'mapa.intro':
    'Cómo se relacionan los proyectos del hospital con sus componentes, APIs y recursos. Todo sale del catálogo.',
  'mapa.vistas': 'Vistas del mapa',
  'mapa.grafo': 'Grafo',
  'mapa.tarjetas': 'Tarjetas',
  'mapa.pista':
    'Haz clic en un nodo para abrir su ficha. Haz clic en el grafo para activar el zoom con la rueda.',
  'mapa.errorCarga': 'No se pudo cargar el mapa',
  'mapa.sinDominioTitulo': 'El dominio del hospital no está en el catálogo',
  'mapa.sinDominioDescripcion':
    'El mapa parte del dominio salud-hrl declarado en catalog/hrl.yaml. Revisa que el archivo esté registrado en app-config.yaml.',
  'mapa.clases.domain.titulo': 'Dominios',
  'mapa.clases.domain.ayuda':
    'El área grande a la que pertenecen los sistemas. Hoy hay uno: los sistemas del hospital.',
  'mapa.clases.system.titulo': 'Proyectos',
  'mapa.clases.system.ayuda':
    'Cada sistema que construye el hospital (System en el catálogo). Cada uno tiene su propia página.',
  'mapa.clases.component.titulo': 'Componentes',
  'mapa.clases.component.ayuda':
    'Una pieza de software con su propio repositorio o carpeta: un sitio web, un servicio, una biblioteca.',
  'mapa.clases.api.titulo': 'APIs',
  'mapa.clases.api.ayuda':
    'Una interfaz que un componente ofrece a otros, descrita con su definición (OpenAPI).',
  'mapa.clases.resource.titulo': 'Recursos',
  'mapa.clases.resource.ayuda':
    'Infraestructura que necesita un proyecto: bases de datos, servidores, almacenamiento.',
  'mapa.clases.group.titulo': 'Equipos',
  'mapa.clases.group.ayuda':
    'Equipos responsables de proyectos y componentes. Vienen de GitHub (DevHRL) o de catalog/hrl.yaml.',
  'calidad.faltanEvaluar': '{{cuenta}} aún sin evaluar',
  'calidad.columnaPuntaje': 'Comprobaciones',
  'calidad.columnaFaltan': 'Le falta',
  'calidad.columnaCategoria': 'Categoría',
  'calidad.cifraCumplidas': 'comprobaciones cumplidas',
  'calidad.ayudaCumplidas':
    'Comprobaciones cumplidas sobre las que se pudieron evaluar, sumando todos los componentes y APIs.',
  'calidad.cifraReadme': 'con README',
  'calidad.ayudaReadme':
    'Parte de los componentes y APIs cuyo repositorio tiene un README en la raíz.',
  'calidad.cifraSinEvaluar': 'aún sin evaluar',
  'calidad.ayudaSinEvaluar':
    'Componentes y APIs sin ningún resultado todavía: el portal aún no leyó su repositorio ni su ficha.',
  'calidad.categoria.identificacion': 'Identificación',
  'calidad.categoria.documentacion': 'Documentación',
  'calidad.categoria.repositorio': 'Repositorio',
  'calidad.categoria.operacion': 'Operación',
  'calidad.reglas.pruebas.titulo': 'Tiene pruebas automáticas',
  'calidad.reglas.pruebas.porque':
    'Cada cambio se comprueba solo; sin ellas, los errores los encuentran los usuarios.',
  'calidad.reglas.pruebas.arreglo':
    'Agrega un flujo de GitHub Actions en .github/workflows/ que ejecute las pruebas (o la prueba de humo) en cada push.',
  'avance.resumen': '{{completadas}} de {{total}} funciones completadas',
  'avance.fuente': 'Abrir el plan',
  'avance.ayuda':
    'Se lee del plan del proyecto en su repositorio: cada entrega marcada [hecho] cuenta como completada; lo hecho en parte, en curso o bloqueado cuenta como pendiente.',
  'avance.retiradas': 'No se cuentan {{cuenta}} entregas retiradas.',
  'avance.pendientes': 'Pendientes',
  'avance.completadas': 'Completadas',
  'avance.ningunaPendiente': 'Nada pendiente en el plan.',
  'avance.ningunaCompletada': 'Aún no hay nada completado.',
  'avance.errorCarga': 'No se pudo cargar el avance',
  'avance.sinPlanTitulo': 'Este proyecto aún no declara su plan',
  'avance.sinPlanDescripcion':
    'Agrega la anotación hrl/avance al System en catalog/hrl.yaml con la URL de su plan (p. ej. docs/PLAN.md), con las etapas como «## Etapa · **[hecho]**» y las entregas como filas de tabla.',
  'avance.noLeidoTitulo': 'No se pudo leer el plan',
  'avance.noLeidoDescripcion':
    'El portal no pudo leer el plan declarado: {{error}}',
  'pruebas.titulo': 'Pruebas automáticas',
  'pruebas.ayuda':
    'La última ejecución de cada flujo de GitHub Actions en los repositorios del proyecto.',
  'pruebas.sinCi':
    'Este repositorio no tiene ejecuciones de pruebas automáticas.',
  'pruebas.sinCiCorto': 'Sin pruebas automáticas',
  'pruebas.sinCiTitulo': 'Todavía no hay pruebas automáticas',
  'pruebas.sinCiDescripcion':
    'Ningún repositorio del proyecto ejecuta GitHub Actions. Agrega un flujo en .github/workflows/ que corra las pruebas en cada push y su resultado aparecerá aquí.',
  'pruebas.errorCarga': 'No se pudieron cargar los resultados de las pruebas',
  'pruebas.resultado.success': 'Pasó',
  'pruebas.resultado.failure': 'Falló',
  'pruebas.resultado.en_curso': 'En curso',
  'pruebas.resultado.otro': 'Sin resultado',
  'proyecto.pestanaCalidadPruebas': 'Calidad y pruebas',
  'proyecto.pestanaMiembros': 'Miembros',
  'proyecto.repositorios': 'Repositorios',
  'proyecto.repositoriosAyuda':
    'El código del proyecto. Su README es la primera lectura: qué es, cómo se ejecuta y a quién preguntar.',
  'proyecto.leerReadme': 'Leer el README',
  'proyecto.sinReposTitulo': 'No se encontraron repositorios',
  'proyecto.sinReposDescripcion':
    'El portal busca los repositorios en los enlaces del System y en la anotación de código fuente de sus componentes.',
  'proyecto.wikiGithub': 'Wiki de {{repo}}',
  'proyecto.wikiGithubAyuda': 'Wiki del repositorio en GitHub',
  'docs.intro':
    'Toda la documentación publicada en el portal, agrupada por proyecto. Cada una se escribe en su repositorio (docs/ y mkdocs.yml).',
  'docs.columnaDocumento': 'Documento',
  'docs.leer': 'Leer',
  'docs.leerDe': 'Leer {{nombre}}',
  'miembros.errorCarga': 'No se pudieron cargar los miembros',
  'miembros.resumenGrupos': 'Grupos: {{grupos}} · Personas: {{personas}}',
  'miembros.actualizado': 'actualizado por {{quien}} el {{fecha}}',
  'miembros.sinGruposTitulo': 'Este proyecto aún no tiene grupos',
  'miembros.sinGruposDescripcion':
    'Crea los grupos de personas que trabajan en el proyecto (p. ej. Desarrollo, Estadística) y elige a sus miembros entre los de la organización.',
  'miembros.sinGruposSinPermiso':
    'Un administrador de la organización en GitHub puede crear los grupos de personas que trabajan en el proyecto.',
  'miembros.crearGrupos': 'Crear grupos',
  'miembros.editarGrupos': 'Editar grupos',
  'miembros.editarTitulo': 'Grupos del proyecto',
  'miembros.editarAyuda':
    'Cada grupo tiene un nombre y sus personas, elegidas entre los miembros de la organización en GitHub. Nada se guarda hasta pulsar Guardar.',
  'miembros.filtrarPersonas': 'Filtrar personas',
  'miembros.nombreGrupo': 'Nombre del grupo',
  'miembros.grupoInicial': 'Desarrollo',
  'miembros.quitarGrupo': 'Quitar el grupo {{grupo}}',
  'miembros.agregarGrupo': 'Agregar grupo',
  'miembros.grupoVacio': 'Todavía nadie en este grupo.',
  'miembros.guardar': 'Guardar',
  'miembros.cancelar': 'Cancelar',
  'miembros.guardado': 'Grupos guardados',
  'miembros.errorGuardar': 'No se pudieron guardar los grupos',
  'portada.recientes': 'Lo último que viste',
  'portada.recientesError': 'No se pudieron leer tus visitas recientes',
  'portada.claseDocs': 'Documentación',
  'portada.claseProyecto': 'Proyecto',
  'portada.clasePagina': 'Página del portal',
  'portada.tramo.hoy': 'Hoy',
  'portada.tramo.ayer': 'Ayer',
  'portada.tramo.semana': 'Esta semana',
  'portada.tramo.antes': 'Antes',
  'catalogoVisual.navegacion': 'Componentes del catálogo visual',
  'catalogoVisual.buscar': 'Buscar componentes',
  'catalogoVisual.sinResultados': 'Ningún componente coincide',
  'catalogoVisual.sinResultadosAyuda':
    'Busca por grupo (Primitivos, Layout…) o por el nombre del componente.',
  'catalogoVisual.vacioTitulo': 'El catálogo no tiene historias',
  'catalogoVisual.vacioDescripcion':
    'El sitio de Ladle publicado no lista ninguna historia en su meta.json.',
  'catalogoVisual.errorCarga': 'No se pudo cargar el catálogo visual',
  'catalogoVisual.verCodigo': 'Código de la historia',
  'catalogoVisual.pantallaCompleta': 'Abrir en Ladle',
  'catalogoVisual.marco': 'Vista en vivo: {{historia}}',
  'proyecto.pestanaCatalogoVisual': 'Catálogo visual',
} as const;

export const textosHrlEs = createTranslationResource({
  ref: textosHrl,
  translations: {
    es: async () => ({ default: es }),
  },
});
