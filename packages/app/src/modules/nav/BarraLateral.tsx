import { ReactNode, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  NavContentBlueprint,
  type NavContentNavItem,
} from '@backstage/plugin-app-react';
import {
  identityApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { SearchModal, useSearchModal } from '@backstage/plugin-search';
import { Avatar } from '@backstage/ui';
import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import PersonIcon from '@material-ui/icons/PersonOutlineOutlined';
import NotificationsIcon from '@material-ui/icons/NotificationsNoneOutlined';
import { textosHrl } from '../idioma';
import { useCarga } from '../comun/useCarga';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  colorProyecto,
  iniciales,
  nombreCorto,
  rutaProyecto,
  tituloDe,
} from '../comun/entidades';
import { Marca } from './Marca';
import { useMarco } from './Marco';

// Orden y agrupación de las páginas. Lo que no está aquí cae en «Herramientas».
const PRINCIPALES = [
  'page:home',
  'page:proyectos',
  'page:catalog',
  'page:techdocs',
  'page:api-docs',
  'page:calidad',
];

const esMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.platform);

const Enlace = (props: {
  href: string;
  icono: ReactNode;
  texto: string;
  exacto?: boolean;
}) => (
  <NavLink
    to={props.href}
    end={props.exacto}
    className="hrl-nav__item"
    data-etiqueta={props.texto}
  >
    <span className="hrl-nav__icono" aria-hidden>
      {props.icono}
    </span>
    <span className="hrl-nav__texto">{props.texto}</span>
  </NavLink>
);

const Perfil = (props: { href: string; texto: string }) => {
  const identityApi = useApi(identityApiRef);
  const perfil = useCarga(() => identityApi.getProfileInfo(), [identityApi]);
  const nombre =
    perfil.estado === 'listo' ? perfil.datos.displayName ?? '' : '';
  const foto = perfil.estado === 'listo' ? perfil.datos.picture ?? '' : '';
  return (
    <NavLink
      to={props.href}
      className="hrl-nav__item hrl-nav__perfil"
      data-etiqueta={props.texto}
    >
      <span className="hrl-nav__icono" aria-hidden>
        {nombre ? (
          <Avatar
            src={foto}
            name={nombre}
            size="x-small"
            purpose="decoration"
          />
        ) : (
          <PersonIcon />
        )}
      </span>
      <span className="hrl-nav__texto">
        {nombre ? (
          <>
            <span className="hrl-nav__perfil-nombre">{nombre}</span>
            <span className="hrl-nav__perfil-sub">{props.texto}</span>
          </>
        ) : (
          props.texto
        )}
      </span>
    </NavLink>
  );
};

/** Selector de proyecto: un acceso directo a cada subportal, con su color. */
const ProyectosBarra = () => {
  const { t } = useTranslationRef(textosHrl);
  const catalogo = useApi(catalogApiRef);
  const sistemas = useCarga(
    async () =>
      (
        await catalogo.getEntities({
          filter: { kind: 'System' },
          fields: [
            'kind',
            'metadata.name',
            'metadata.title',
            'metadata.annotations',
          ],
          order: { field: 'metadata.title', order: 'asc' },
        })
      ).items,
    [catalogo],
  );
  if (sistemas.estado !== 'listo' || sistemas.datos.length === 0) return null;
  return (
    <>
      <p className="hrl-nav__titulo">{t('barra.tusProyectos')}</p>
      <ul className="hrl-nav__grupo">
        {sistemas.datos.map(s => (
          <li key={s.metadata.name}>
            <Enlace
              href={rutaProyecto(s)}
              texto={nombreCorto(tituloDe(s))}
              icono={
                <span
                  className="hrl-nav__proyecto"
                  style={{ background: colorProyecto(s) }}
                >
                  {iniciales(tituloDe(s))}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </>
  );
};

const Barra = (props: {
  principales: NavContentNavItem[];
  herramientas: NavContentNavItem[];
  notificaciones?: NavContentNavItem;
  ajustes?: NavContentNavItem;
  titulos: Record<string, string>;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const { plegada, alternarPlegada, cajonAbierto, setCajonAbierto } =
    useMarco();
  const { state, toggleModal, setOpen } = useSearchModal();

  // Ctrl+K (⌘K en Mac) abre la búsqueda desde cualquier página.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [setOpen]);

  const titulo = (item: NavContentNavItem) =>
    props.titulos[item.node.spec.id] ?? item.title;

  const enlace = (item: NavContentNavItem) => (
    <li key={item.node.spec.id}>
      <Enlace
        href={item.href}
        icono={item.icon}
        texto={titulo(item)}
        exacto={item.href === '/'}
      />
    </li>
  );

  return (
    <>
      {/* Pantallas estrechas: barra superior con el botón del cajón. */}
      <header className="hrl-movil">
        <button
          type="button"
          className="hrl-movil__boton"
          onClick={() => setCajonAbierto(!cajonAbierto)}
          aria-label={
            cajonAbierto ? t('barra.cerrarMenu') : t('barra.abrirMenu')
          }
          aria-expanded={cajonAbierto}
          aria-controls="hrl-nav"
        >
          {cajonAbierto ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Marca />
        <button
          type="button"
          className="hrl-movil__boton"
          onClick={() => setOpen(true)}
          aria-label={t('barra.search')}
        >
          <SearchIcon />
        </button>
      </header>

      <nav id="hrl-nav" className="hrl-nav" aria-label={t('barra.menu')}>
        <div className="hrl-nav__cabecera">
          <Marca plegada={plegada} />
        </div>

        <button
          type="button"
          className="hrl-nav__buscar"
          onClick={() => setOpen(true)}
          data-etiqueta={t('barra.search')}
        >
          <SearchIcon aria-hidden />
          <span className="hrl-nav__texto">{t('barra.buscarEnPortal')}</span>
          <kbd className="hrl-nav__atajo" aria-hidden>
            {esMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>

        <div className="hrl-nav__desplazable">
          <ul className="hrl-nav__grupo">{props.principales.map(enlace)}</ul>

          <ProyectosBarra />

          {props.herramientas.length > 0 && (
            <>
              <p className="hrl-nav__titulo">{t('barra.herramientas')}</p>
              <ul className="hrl-nav__grupo">
                {props.herramientas.map(enlace)}
              </ul>
            </>
          )}
        </div>

        <ul className="hrl-nav__grupo hrl-nav__pie">
          {props.notificaciones && (
            <li>
              <Enlace
                href={props.notificaciones.href}
                icono={<NotificationsIcon />}
                texto={titulo(props.notificaciones)}
              />
            </li>
          )}
          {props.ajustes && (
            <li>
              <Perfil href={props.ajustes.href} texto={titulo(props.ajustes)} />
            </li>
          )}
          <li className="hrl-nav__solo-escritorio">
            <button
              type="button"
              className="hrl-nav__item hrl-nav__plegar"
              onClick={alternarPlegada}
              aria-label={plegada ? t('barra.expandir') : t('barra.contraer')}
              data-etiqueta={
                plegada ? t('barra.expandir') : t('barra.contraer')
              }
            >
              <span className="hrl-nav__icono" aria-hidden>
                {plegada ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </span>
              <span className="hrl-nav__texto">{t('barra.contraer')}</span>
            </button>
          </li>
        </ul>
      </nav>

      <SearchModal {...state} toggleModal={toggleModal} />
    </>
  );
};

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- `component` se renderiza como componente de React.
      const { t } = useTranslationRef(textosHrl);
      // El título que trae cada página es texto fijo (app-config.yaml); aquí se
      // reemplaza por el traducido para que la barra cambie con el idioma. Una
      // página nueva sin entrada conserva su título original.
      const titulos: Record<string, string> = {
        'page:home': t('paginas.home'),
        'page:proyectos': t('paginas.proyectos'),
        'page:calidad': t('paginas.calidad'),
        'page:guia': t('paginas.guia'),
        'page:catalog': t('paginas.catalog'),
        'page:scaffolder': t('paginas.scaffolder'),
        'page:api-docs': t('paginas.api-docs'),
        'page:catalog-graph': t('paginas.catalog-graph'),
        'page:techdocs': t('paginas.techdocs'),
        'page:catalog-import': t('paginas.catalog-import'),
        'page:notifications': t('paginas.notifications'),
        'page:app-visualizer': t('paginas.app-visualizer'),
        'page:user-settings': t('paginas.user-settings'),
      };

      // `take` consume elementos de la colección: se trabaja sobre una copia
      // para que cada render vea la lista completa.
      const items = navItems.clone();
      items.take('page:search'); // Se abre como diálogo desde «Buscar».
      // Notificaciones y ajustes van al pie, junto al perfil.
      const notificaciones = items.take('page:notifications');
      const ajustes = items.take('page:user-settings');
      const principales = PRINCIPALES.map(id => items.take(id)).filter(
        (i): i is NavContentNavItem => Boolean(i),
      );
      const herramientas = [...items.rest()].sort((a, b) =>
        (titulos[a.node.spec.id] ?? a.title).localeCompare(
          titulos[b.node.spec.id] ?? b.title,
        ),
      );

      return (
        <Barra
          principales={principales}
          herramientas={herramientas}
          notificaciones={notificaciones}
          ajustes={ajustes}
          titulos={titulos}
        />
      );
    },
  },
});
