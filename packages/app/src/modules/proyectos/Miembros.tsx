import { Alert, Avatar, Skeleton, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import PersonasIcon from '@material-ui/icons/PeopleOutline';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { Etiqueta } from '../comun/Etiqueta';
import { Repositorio, useRepositorios } from './github';

// Las claves de permiso se arman con el rol de GitHub; se afirma una del grupo.
type ClavePermiso = 'miembros.permiso.admin';
const PERMISOS = ['admin', 'maintain', 'write', 'triage', 'read'];

/** Personas con acceso a un repositorio, la más activa primero. */
const GrupoRepo = ({ repo }: { repo: Repositorio }) => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <section className="hrl-seccion" aria-labelledby={`hrl-repo-${repo.slug}`}>
      <div className="hrl-seccion__cabecera">
        <Text
          as="h3"
          id={`hrl-repo-${repo.slug}`}
          variant="title-x-small"
          weight="bold"
        >
          <a href={repo.url} target="_blank" rel="noopener noreferrer">
            {repo.slug}
          </a>
          <span className="hrl-tabla__grupo-cuenta">
            {repo.miembros.length}
          </span>
        </Text>
        <Text as="p" variant="body-x-small" color="secondary">
          {repo.miembrosSegun === 'colaboradores'
            ? t('miembros.segunColaboradores')
            : t('miembros.segunContribuidores')}
        </Text>
      </div>
      {repo.error ? (
        <Text as="p" variant="body-small" color="danger">
          {repo.error}
        </Text>
      ) : (
        <ul className="hrl-miembros">
          {repo.miembros.map(m => (
            <li key={m.login}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hrl-miembro"
              >
                <Avatar src={m.avatar} name={m.login} purpose="decoration" />
                <span className="hrl-miembro__texto">
                  <strong>@{m.login}</strong>
                  <span>
                    {t('miembros.aportes', {
                      cuenta: String(m.contribuciones),
                    })}
                  </span>
                </span>
                {m.permiso && PERMISOS.includes(m.permiso) && (
                  <Etiqueta
                    texto={t(`miembros.permiso.${m.permiso}` as ClavePermiso)}
                    tono={m.permiso === 'admin' ? 'acento' : 'neutro'}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/**
 * Pestaña «Miembros»: quién trabaja en el proyecto, agrupado por
 * repositorio. Sale de GitHub, no de equipos declarados en el portal.
 */
export const PestanaMiembros = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const carga = useRepositorios(sistema);
  if (carga.estado === 'cargando')
    return <Skeleton width="100%" height={240} />;
  if (carga.estado === 'error') {
    return (
      <Alert
        status="danger"
        icon
        title={t('miembros.errorCarga')}
        description={carga.error.message}
      />
    );
  }
  const repos = carga.datos.repositorios;
  if (repos.length === 0) {
    return (
      <EstadoVacio
        icono={<PersonasIcon />}
        titulo={t('proyecto.sinReposTitulo')}
        descripcion={t('proyecto.sinReposDescripcion')}
      />
    );
  }
  const personas = new Set(repos.flatMap(r => r.miembros.map(m => m.login)));
  return (
    <div className="hrl-seccion">
      <Text as="p" variant="body-medium" color="secondary">
        {t('miembros.resumen', {
          personas: String(personas.size),
          repos: String(repos.length),
        })}
      </Text>
      {repos.map(r => (
        <GrupoRepo key={r.slug} repo={r} />
      ))}
    </div>
  );
};
