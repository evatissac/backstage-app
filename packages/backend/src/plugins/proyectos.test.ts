import { leerPlan } from './proyectos';

// Extracto con la forma de docs/PLAN.md de Estadistica_hrl.
const PLAN = `# Plan del prototipo

## Fase 0 — Cimientos · **[hecho]**

| # | Entrega | Estado |
|---|---|---|
| 1 | Proyecto Vite 8 + React 19, alias \`@\`, oxlint | [hecho] |
| 2 | Prueba de humo | [hecho] |

## Fase 1 — Rol Área · **[en curso]**

| # | Entrega | Estado |
|---|---|---|
| 14 | Formulario del reporte | [hecho] para Lavandería · [bloqueado] para las demás |
| 15 | Rótulo de consumidor | **Retirado** de la interfaz por ruido |
| 19 | Exportación del reporte | [pendiente] — ver decisión abierta |
| 29 | oxlint sin avisos | [hecho para la Fase 0; repetir al cierre] |

## Nutrición con carga de Excel · **[hecho, 24/09/2026]**

Texto sin tabla.

## Decisiones abiertas

| 1 | Algo por decidir | [pendiente] |
`;

describe('leerPlan', () => {
  const avance = leerPlan(PLAN, 'url:plan');

  it('lee las fases con su estado y fecha', () => {
    expect(avance.fases).toEqual([
      { titulo: 'Fase 0 — Cimientos', estado: '[hecho]', fecha: null },
      { titulo: 'Fase 1 — Rol Área', estado: '[en curso]', fecha: null },
      {
        titulo: 'Nutrición con carga de Excel',
        estado: '[hecho, 24/09/2026]',
        fecha: '24/09/2026',
      },
    ]);
  });

  it('clasifica cada entrega', () => {
    const estados = Object.fromEntries(
      avance.entregas.map(e => [e.texto, e.estado]),
    );
    expect(estados).toEqual({
      'Proyecto Vite 8 + React 19, alias `@`, oxlint': 'completada',
      'Prueba de humo': 'completada',
      // Hecho solo en parte: sigue pendiente.
      'Formulario del reporte': 'pendiente',
      'Rótulo de consumidor': 'retirada',
      'Exportación del reporte': 'pendiente',
      // Hecho una vez, pero hay que repetirlo: sigue pendiente.
      'oxlint sin avisos': 'pendiente',
      // Una fase sin tabla es una entrega en sí misma.
      'Nutrición con carga de Excel': 'completada',
    });
  });

  it('ignora las tablas fuera de una fase', () => {
    expect(avance.entregas.some(e => e.texto === 'Algo por decidir')).toBe(
      false,
    );
  });
});
