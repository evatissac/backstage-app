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
      // El nombre en dos líneas, junto al sello de la barra lateral.
      titleLine1: 'Developer Portal',
      titleLine2: 'HRL',
    },
    ingreso: {
      github:
        'Sign in with your GitHub account, as a member of the DevHRL organization.',
      hospital: 'Hospital Regional de Loreto',
      lema: 'The systems the hospital builds, who owns each one and how they work, in one place.',
      puntoCatalogo: 'Catalog of projects, components and teams',
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
      'catalog-import': 'Register a component',
      notifications: 'Notifications',
      'app-visualizer': 'Visualizer',
      'user-settings': 'Settings',
      calidad: 'Quality',
      guia: 'Getting started',
    },
    portada: {
      saludoManana: 'Good morning, {{nombre}}',
      saludoTarde: 'Good afternoon, {{nombre}}',
      saludoNoche: 'Good evening, {{nombre}}',
      saludoSinNombre: 'Welcome',
      subtitulo:
        'Everything the hospital builds: projects, components, APIs and their documentation.',
      buscarEtiqueta: 'Search the portal',
      buscarPlaceholder: 'Search projects, components, docs…',
      buscarPista: 'Press Ctrl K from any page to search.',
      cifraProyectos: 'Projects',
      cifraComponentes: 'Components',
      cifraApis: 'APIs',
      cifraPersonas: 'People',
      accesoProyectos: 'A home for each system',
      accesoCatalogo: 'Everything registered, with owners',
      accesoDocs: 'Technical docs of each repo',
      accesoApis: 'Contracts between systems',
      verTodos: 'See all',
      favoritos: 'Your favorites',
      favoritosVacioTitulo: 'No favorites yet',
      favoritosVacioDescripcion:
        'Mark an entity with the star on its page in the catalog and it will appear here.',
      recientes: 'Recently visited',
      recientesVacioTitulo: 'Nothing visited yet',
      recientesVacioDescripcion:
        'The pages you open in the portal will appear here so you can get back to them.',
      avisoPacientes:
        'No patient data belongs in this portal or in the repositories.',
      salud: 'Catalog health',
      verDetalle: 'See details',
    },
    proyectos: {
      titulo: 'Projects',
      intro:
        'Each project is a system of the catalog: its components, APIs, documentation and the team that owns it.',
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
      pestanaEquipo: 'Team',
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
      sinMiembrosTitulo: '{{equipo}} has no members in the catalog',
      sinMiembrosDescripcion:
        'Teams will be imported from GitHub (DevHRL) once they are created there.',
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
    },
    calidad: {
      titulo: 'Quality',
      intro:
        'Each component and API earns a level as it meets basic practices: an owner, documentation, a linked repository. Like Soundcheck, but measured only with what the catalog knows.',
      nota: 'The checks read the catalog-info.yaml of each repository; they do not inspect the code. To raise a level, edit that file and wait up to 30 minutes for the portal to read it again.',
      filtroProyecto: 'Filter by project',
      todos: 'All',
      errorCarga: 'Could not evaluate quality',
      vacioTitulo: 'Nothing to evaluate',
      vacioDescripcion:
        'There are no components or APIs here yet. They appear when a repository declares them in its catalog-info.yaml.',
      sinNivel: 'No level',
      nivel: {
        bronce: 'Bronze',
        plata: 'Silver',
        oro: 'Gold',
      },
      descripcionNivel: {
        bronce: 'We know what it is and who owns it.',
        plata: 'Someone new can work on it without asking.',
        oro: 'Ready for production, with a real team behind it.',
      },
      progreso: '{{cumplidas}} of {{total}} checks',
      cumple: '(met)',
      noCumple: '(pending)',
      columnaProyecto: 'Project',
      columnaNivel: 'Level',
      columnaProgreso: 'Progress',
      columnaSiguiente: 'To level up',
      todoCumplido: 'Everything met',
      sinDatos: 'No data',
      cifraResponsable: 'with an owner',
      ayudaResponsable: 'Share of components and APIs with an owning team.',
      cifraDocs: 'with documentation',
      ayudaDocs: 'Share that publish their docs in the portal.',
      cifraNivel: 'at {{nivel}} or above',
      nivelActual: 'Current level',
      reglas: {
        responsable: {
          titulo: 'Has an owner',
          porque:
            'Without an owner nobody answers when it fails or needs a change.',
          arreglo:
            'Add spec.owner with the team, e.g. owner: equipo-estadistica.',
        },
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
        equipo: {
          titulo: 'Its team has people',
          porque: 'An empty team is the same as no owner.',
          arreglo:
            'Teams are imported from GitHub (DevHRL). Create the team there and add its members.',
        },
        produccion: {
          titulo: 'Is in production',
          porque: 'Gold is for what the hospital already uses every day.',
          arreglo: 'When it is in use, change spec.lifecycle to production.',
        },
      },
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
        'Each hospital system has its own page with its components, documentation, APIs and team.',
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
        'Every component earns Bronze, Silver and Gold as it meets basic practices. Each check says how to fix it.',
      p5Accion: 'See quality',
      p6Titulo: 'Rules that are never broken',
      p6Regla1:
        'No patient data in the portal or the repositories: no names, no screenshots with data, no sample Excel files.',
      p6Regla2:
        'Passwords and keys go in .env, which git ignores. Never in the code or the docs.',
      p6Regla3: 'Every repository has an owning team.',
    },
    entidad: {
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
        'Everything registered in the portal: components, APIs, systems and teams.',
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
  },
});

const es = {
  'portal.title': 'Portal de Desarrollo HRL',
  'portal.titleLine1': 'Portal de Desarrollo',
  'portal.titleLine2': 'HRL',
  'ingreso.github':
    'Ingresa con tu cuenta de GitHub, como miembro de la organización DevHRL.',
  'ingreso.hospital': 'Hospital Regional de Loreto',
  'ingreso.lema':
    'Los sistemas que construye el hospital, quién responde por cada uno y cómo funcionan, en un solo lugar.',
  'ingreso.puntoCatalogo': 'Catálogo de proyectos, componentes y equipos',
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
  'portada.subtitulo':
    'Todo lo que construye el hospital: proyectos, componentes, APIs y su documentación.',
  'portada.buscarEtiqueta': 'Buscar en el portal',
  'portada.buscarPlaceholder': 'Busca proyectos, componentes, documentación…',
  'portada.buscarPista': 'Pulsa Ctrl K desde cualquier página para buscar.',
  'portada.cifraProyectos': 'Proyectos',
  'portada.cifraComponentes': 'Componentes',
  'portada.cifraApis': 'APIs',
  'portada.cifraPersonas': 'Personas',
  'portada.accesoProyectos': 'La portada de cada sistema',
  'portada.accesoCatalogo': 'Todo lo registrado, con responsables',
  'portada.accesoDocs': 'La documentación técnica de cada repo',
  'portada.accesoApis': 'Los contratos entre sistemas',
  'portada.verTodos': 'Ver todos',
  'portada.favoritos': 'Tus favoritos',
  'portada.favoritosVacioTitulo': 'Aún no tienes favoritos',
  'portada.favoritosVacioDescripcion':
    'Marca una entidad con la estrella en su ficha del catálogo y aparecerá aquí.',
  'portada.recientes': 'Visitados recientemente',
  'portada.recientesVacioTitulo': 'Todavía no has visitado nada',
  'portada.recientesVacioDescripcion':
    'Las páginas que abras en el portal aparecerán aquí para volver a ellas.',
  'portada.avisoPacientes':
    'En este portal y en los repositorios no va ningún dato de pacientes.',
  'proyectos.titulo': 'Proyectos',
  'proyectos.intro':
    'Cada proyecto es un sistema del catálogo: sus componentes, APIs, documentación y el equipo que responde por él.',
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
  'proyecto.pestanaEquipo': 'Equipo',
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
  'proyecto.sinMiembrosTitulo': '{{equipo}} no tiene miembros en el catálogo',
  'proyecto.sinMiembrosDescripcion':
    'Los equipos se importarán desde GitHub (DevHRL) cuando se creen allí.',
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
  'portada.salud': 'Salud del catálogo',
  'portada.verDetalle': 'Ver detalle',
  'proyecto.pestanaCalidad': 'Calidad',
  'calidad.titulo': 'Calidad',
  'calidad.intro':
    'Cada componente y API sube de nivel a medida que cumple prácticas básicas: un responsable, documentación, el repositorio enlazado. Como Soundcheck, pero medido solo con lo que sabe el catálogo.',
  'calidad.nota':
    'Las comprobaciones leen el catalog-info.yaml de cada repositorio; no revisan el código. Para subir de nivel, edita ese archivo y espera hasta 30 minutos a que el portal lo vuelva a leer.',
  'calidad.filtroProyecto': 'Filtrar por proyecto',
  'calidad.todos': 'Todos',
  'calidad.errorCarga': 'No se pudo evaluar la calidad',
  'calidad.vacioTitulo': 'Nada que evaluar',
  'calidad.vacioDescripcion':
    'Aquí aún no hay componentes ni APIs. Aparecen cuando un repositorio los declara en su catalog-info.yaml.',
  'calidad.sinNivel': 'Sin nivel',
  'calidad.nivel.bronce': 'Bronce',
  'calidad.nivel.plata': 'Plata',
  'calidad.nivel.oro': 'Oro',
  'calidad.descripcionNivel.bronce': 'Se sabe qué es y quién responde por él.',
  'calidad.descripcionNivel.plata':
    'Alguien nuevo puede trabajar con él sin preguntar.',
  'calidad.descripcionNivel.oro':
    'Listo para producción y con un equipo real detrás.',
  'calidad.progreso': '{{cumplidas}} de {{total}} comprobaciones',
  'calidad.cumple': '(cumplida)',
  'calidad.noCumple': '(pendiente)',
  'calidad.columnaProyecto': 'Proyecto',
  'calidad.columnaNivel': 'Nivel',
  'calidad.columnaProgreso': 'Progreso',
  'calidad.columnaSiguiente': 'Para subir de nivel',
  'calidad.todoCumplido': 'Todo cumplido',
  'calidad.sinDatos': 'Sin datos',
  'calidad.cifraResponsable': 'con responsable',
  'calidad.ayudaResponsable':
    'Porcentaje de componentes y APIs con un equipo responsable.',
  'calidad.cifraDocs': 'con documentación',
  'calidad.ayudaDocs': 'Porcentaje que publica su documentación en el portal.',
  'calidad.cifraNivel': 'con {{nivel}} o más',
  'calidad.nivelActual': 'Nivel actual',
  'calidad.reglas.responsable.titulo': 'Tiene responsable',
  'calidad.reglas.responsable.porque':
    'Sin responsable, nadie contesta cuando falla o hay que cambiarlo.',
  'calidad.reglas.responsable.arreglo':
    'Agrega spec.owner con el equipo, por ejemplo owner: equipo-estadistica.',
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
  'calidad.reglas.equipo.titulo': 'Su equipo tiene personas',
  'calidad.reglas.equipo.porque':
    'Un equipo vacío es lo mismo que no tener responsable.',
  'calidad.reglas.equipo.arreglo':
    'Los equipos se importan desde GitHub (DevHRL). Crea el equipo allí y agrega a sus miembros.',
  'calidad.reglas.produccion.titulo': 'Está en producción',
  'calidad.reglas.produccion.porque':
    'El Oro es para lo que el hospital ya usa todos los días.',
  'calidad.reglas.produccion.arreglo':
    'Cuando esté en uso, cambia spec.lifecycle a production.',
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
    'Cada sistema del hospital tiene su portada, con sus componentes, documentación, APIs y equipo.',
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
    'Cada componente gana Bronce, Plata y Oro a medida que cumple prácticas básicas. Cada comprobación dice cómo resolverla.',
  'guia.p5Accion': 'Ver calidad',
  'guia.p6Titulo': 'Reglas que no se rompen',
  'guia.p6Regla1':
    'Ningún dato de pacientes en el portal ni en los repositorios: ni nombres, ni capturas con datos, ni Excel de ejemplo.',
  'guia.p6Regla2':
    'Las contraseñas y claves van en .env, que git ignora. Nunca en el código ni en la documentación.',
  'guia.p6Regla3': 'Todo repositorio tiene un equipo responsable.',
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
    'Todo lo registrado en el portal: componentes, APIs, sistemas y equipos.',
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
} as const;

export const textosHrlEs = createTranslationResource({
  ref: textosHrl,
  translations: {
    es: async () => ({ default: es }),
  },
});
