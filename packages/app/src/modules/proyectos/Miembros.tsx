import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  ButtonIcon,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  SearchField,
  Text,
  TextField,
} from '@backstage/ui';
import {
  alertApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import PersonasIcon from '@material-ui/icons/PeopleOutline';
import EditarIcon from '@material-ui/icons/EditOutlined';
import QuitarIcon from '@material-ui/icons/DeleteOutline';
import AgregarIcon from '@material-ui/icons/Add';
import { textosHrl } from '../idioma';
import { EstadoVacio } from '../comun/EstadoVacio';
import { EsqueletoMiembros } from '../comun/Esqueletos';
import {
  Candidato,
  fechaCorta,
  Grupo,
  useCandidatos,
  useGrupos,
  useGuardarGrupos,
} from './github';

/** Una persona del grupo: avatar y usuario, enlazado a su perfil de GitHub. */
const Persona = (props: { login: string; candidato?: Candidato }) => (
  <li>
    <a
      href={props.candidato?.url ?? `https://github.com/${props.login}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hrl-miembro"
    >
      <Avatar
        src={props.candidato?.avatar ?? ''}
        name={props.login}
        purpose="decoration"
      />
      <span className="hrl-miembro__texto">
        <strong>@{props.login}</strong>
      </span>
    </a>
  </li>
);

/**
 * Editor de grupos: cada grupo tiene un nombre y una lista de personas de la
 * organización para marcar. Nada se guarda hasta pulsar «Guardar».
 */
const EditorGrupos = (props: {
  sistema: string;
  inicial: Grupo[];
  candidatos: Candidato[];
  abierto: boolean;
  alCerrar: () => void;
  alGuardar: () => void;
}) => {
  const { t } = useTranslationRef(textosHrl);
  const guardar = useGuardarGrupos();
  const alertas = useApi(alertApiRef);
  const [borrador, setBorrador] = useState<Grupo[]>(() =>
    props.inicial.length > 0
      ? props.inicial
      : [{ nombre: t('miembros.grupoInicial'), miembros: [] }],
  );
  const [filtro, setFiltro] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>();

  const visibles = props.candidatos.filter(c =>
    c.login.toLowerCase().includes(filtro.trim().toLowerCase()),
  );
  const cambiar = (i: number, grupo: Grupo) =>
    setBorrador(b => b.map((g, j) => (j === i ? grupo : g)));

  const enviar = async () => {
    setGuardando(true);
    setError(undefined);
    try {
      await guardar(props.sistema, borrador);
      alertas.post({
        message: t('miembros.guardado'),
        severity: 'success',
        display: 'transient',
      });
      props.alGuardar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog
      isOpen={props.abierto}
      onOpenChange={abierto => !abierto && props.alCerrar()}
      isDismissable
      width={720}
    >
      <DialogHeader>{t('miembros.editarTitulo')}</DialogHeader>
      <DialogBody>
        <div className="hrl-editor-grupos">
          <Text as="p" variant="body-small" color="secondary">
            {t('miembros.editarAyuda')}
          </Text>
          <SearchField
            size="small"
            aria-label={t('miembros.filtrarPersonas')}
            placeholder={t('miembros.filtrarPersonas')}
            value={filtro}
            onChange={setFiltro}
          />
          {borrador.map((g, i) => (
            <fieldset key={i} className="hrl-editor-grupo">
              <legend className="hrl-sr">
                {g.nombre || t('miembros.nombreGrupo')}
              </legend>
              <div className="hrl-editor-grupo__cabecera">
                <TextField
                  label={t('miembros.nombreGrupo')}
                  value={g.nombre}
                  onChange={nombre => cambiar(i, { ...g, nombre })}
                />
                <ButtonIcon
                  variant="tertiary"
                  aria-label={t('miembros.quitarGrupo', {
                    grupo: g.nombre || String(i + 1),
                  })}
                  icon={<QuitarIcon />}
                  onPress={() => setBorrador(b => b.filter((_, j) => j !== i))}
                />
              </div>
              <ul className="hrl-editor-grupo__personas">
                {visibles.map(c => (
                  <li key={c.login}>
                    <Checkbox
                      isSelected={g.miembros.includes(c.login)}
                      onChange={marcado =>
                        cambiar(i, {
                          ...g,
                          miembros: marcado
                            ? [...g.miembros, c.login]
                            : g.miembros.filter(m => m !== c.login),
                        })
                      }
                    >
                      <span className="hrl-editor-grupo__persona">
                        <Avatar
                          src={c.avatar}
                          name={c.login}
                          size="x-small"
                          purpose="decoration"
                        />
                        @{c.login}
                      </span>
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
          <Button
            variant="secondary"
            iconStart={<AgregarIcon />}
            onPress={() =>
              setBorrador(b => [...b, { nombre: '', miembros: [] }])
            }
          >
            {t('miembros.agregarGrupo')}
          </Button>
          {error && (
            <Alert
              status="danger"
              icon
              title={t('miembros.errorGuardar')}
              description={error}
            />
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onPress={props.alCerrar}>
          {t('miembros.cancelar')}
        </Button>
        <Button variant="primary" onPress={enviar} loading={guardando}>
          {t('miembros.guardar')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

/**
 * Pestaña «Miembros»: los grupos de personas asignados al proyecto. Los
 * edita un administrador de la organización en GitHub; las personas se
 * eligen entre los miembros de esa organización.
 */
export const PestanaMiembros = ({ sistema }: { sistema: string }) => {
  const { t } = useTranslationRef(textosHrl);
  const [version, setVersion] = useState(0);
  const [editando, setEditando] = useState(false);
  const carga = useGrupos(sistema, version);
  const candidatos = useCandidatos(sistema);
  const porLogin = useMemo(
    () =>
      new Map(
        (candidatos.estado === 'listo' ? candidatos.datos.candidatos : []).map(
          c => [c.login.toLowerCase(), c] as const,
        ),
      ),
    [candidatos],
  );

  if (carga.estado === 'cargando') {
    return <EsqueletoMiembros />;
  }
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
  const { grupos, puedeEditar, actualizadoPor, actualizadoEn } = carga.datos;
  const personas = new Set(grupos.flatMap(g => g.miembros));
  const botonEditar = puedeEditar && (
    <Button
      variant={grupos.length === 0 ? 'primary' : 'secondary'}
      iconStart={<EditarIcon />}
      onPress={() => setEditando(true)}
      // Sin la lista de colaboradores no hay a quién elegir: espera girando.
      loading={candidatos.estado === 'cargando'}
      isDisabled={candidatos.estado !== 'listo'}
    >
      {grupos.length === 0
        ? t('miembros.crearGrupos')
        : t('miembros.editarGrupos')}
    </Button>
  );

  return (
    <div className="hrl-seccion">
      {grupos.length === 0 ? (
        <EstadoVacio
          icono={<PersonasIcon />}
          titulo={t('miembros.sinGruposTitulo')}
          descripcion={
            puedeEditar
              ? t('miembros.sinGruposDescripcion')
              : t('miembros.sinGruposSinPermiso')
          }
          accion={botonEditar || undefined}
        />
      ) : (
        <>
          <div className="hrl-seccion__cabecera">
            <Text as="p" variant="body-medium" color="secondary">
              {t('miembros.resumenGrupos', {
                grupos: String(grupos.length),
                personas: String(personas.size),
              })}
              {actualizadoPor &&
                actualizadoEn &&
                ` · ${t('miembros.actualizado', {
                  quien: actualizadoPor,
                  fecha: fechaCorta(actualizadoEn),
                })}`}
            </Text>
            {botonEditar}
          </div>
          {grupos.map(g => (
            <section
              key={g.nombre}
              className="hrl-seccion"
              aria-label={g.nombre}
            >
              <Text as="h3" variant="title-x-small" weight="bold">
                {g.nombre}
                <span className="hrl-tabla__grupo-cuenta">
                  {g.miembros.length}
                </span>
              </Text>
              {g.miembros.length === 0 ? (
                <Text as="p" variant="body-small" color="secondary">
                  {t('miembros.grupoVacio')}
                </Text>
              ) : (
                <ul className="hrl-miembros">
                  {g.miembros.map(m => (
                    <Persona
                      key={m}
                      login={m}
                      candidato={porLogin.get(m.toLowerCase())}
                    />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </>
      )}
      {editando && candidatos.estado === 'listo' && (
        <EditorGrupos
          sistema={sistema}
          inicial={grupos}
          candidatos={candidatos.datos.candidatos}
          abierto={editando}
          alCerrar={() => setEditando(false)}
          alGuardar={() => {
            setEditando(false);
            setVersion(v => v + 1);
          }}
        />
      )}
    </div>
  );
};
