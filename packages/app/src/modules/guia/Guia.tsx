import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink, Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { textosHrl } from '../idioma';
import '../comun/comun.css';
import './guia.css';

// Ejemplos para copiar. Son código, no texto de interfaz: no se traducen.
const EJEMPLO_CATALOGO = `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: estadistica-web
  title: Reporte Estadístico · Web
  description: Interfaz con la que las áreas entregan su reporte mensual.
  annotations:
    github.com/project-slug: DevHRL/Estadistica_hrl
    backstage.io/techdocs-ref: dir:.
  tags: [react, vite]
spec:
  type: website
  lifecycle: experimental
  owner: equipo-estadistica
  system: reporte-estadistico`;

const EJEMPLO_MKDOCS = `site_name: Reporte Estadístico · Web
nav:
  - Inicio: index.md
plugins:
  - techdocs-core`;

const Paso = (props: {
  numero: number;
  titulo: string;
  children: ReactNode;
}) => (
  <section className="hrl-tarjeta hrl-guia__paso">
    <div className="hrl-guia__paso-cabecera">
      <span className="hrl-guia__numero" aria-hidden>
        {props.numero}
      </span>
      <Text as="h2" variant="title-small" weight="bold">
        {props.titulo}
      </Text>
    </div>
    <div className="hrl-guia__cuerpo">{props.children}</div>
  </section>
);

const Codigo = (props: { titulo: string; children: string }) => (
  <figure className="hrl-guia__codigo">
    <figcaption>{props.titulo}</figcaption>
    <pre>
      <code>{props.children}</code>
    </pre>
  </figure>
);

export const Guia = () => {
  const { t } = useTranslationRef(textosHrl);
  return (
    <div className="hrl-pagina hrl-guia">
      <div className="hrl-intro">
        <Text as="h1" variant="title-medium" weight="bold">
          {t('guia.titulo')}
        </Text>
        <Text as="p" variant="body-medium" color="secondary">
          {t('guia.intro')}
        </Text>
      </div>

      <Paso numero={1} titulo={t('guia.p1Titulo')}>
        <p>{t('guia.p1Texto')}</p>
        <ButtonLink href="/proyectos" variant="secondary" size="small">
          {t('guia.p1Accion')}
        </ButtonLink>
      </Paso>

      <Paso numero={2} titulo={t('guia.p2Titulo')}>
        <p>{t('guia.p2Texto')}</p>
        <ButtonLink href="/docs" variant="secondary" size="small">
          {t('guia.p2Accion')}
        </ButtonLink>
      </Paso>

      <Paso numero={3} titulo={t('guia.p3Titulo')}>
        <p>{t('guia.p3Texto')}</p>
        <div className="hrl-guia__opciones">
          <Link to="/create" className="hrl-tarjeta hrl-guia__opcion">
            <span className="hrl-chip">{t('guia.recomendado')}</span>
            <Text as="h3" variant="body-medium" weight="bold">
              {t('guia.p3NuevoTitulo')}
            </Text>
            <Text as="p" variant="body-small" color="secondary">
              {t('guia.p3NuevoTexto')}
            </Text>
          </Link>
          <Link to="/create" className="hrl-tarjeta hrl-guia__opcion">
            <span className="hrl-chip">{t('guia.recomendado')}</span>
            <Text as="h3" variant="body-medium" weight="bold">
              {t('guia.p3ExistenteTitulo')}
            </Text>
            <Text as="p" variant="body-small" color="secondary">
              {t('guia.p3ExistenteTexto')}
            </Text>
          </Link>
        </div>
        <p>{t('guia.p3Manual')}</p>
        <Codigo titulo="catalog-info.yaml">{EJEMPLO_CATALOGO}</Codigo>
      </Paso>

      <Paso numero={4} titulo={t('guia.p4Titulo')}>
        <p>{t('guia.p4Texto')}</p>
        <Codigo titulo="mkdocs.yml">{EJEMPLO_MKDOCS}</Codigo>
        <p>{t('guia.p4Nota')}</p>
      </Paso>

      <Paso numero={5} titulo={t('guia.p5Titulo')}>
        <p>{t('guia.p5Texto')}</p>
        <ButtonLink href="/calidad" variant="secondary" size="small">
          {t('guia.p5Accion')}
        </ButtonLink>
      </Paso>

      <Paso numero={6} titulo={t('guia.p6Titulo')}>
        <ul>
          <li>{t('guia.p6Regla1')}</li>
          <li>{t('guia.p6Regla2')}</li>
          <li>{t('guia.p6Regla3')}</li>
        </ul>
      </Paso>
    </div>
  );
};
