import { validarGrupos } from './grupos';

describe('validarGrupos', () => {
  it('normaliza nombres y quita miembros repetidos', () => {
    expect(
      validarGrupos({
        grupos: [
          { nombre: '  Desarrollo   web ', miembros: ['ana', 'ana', 'b-2'] },
        ],
      }),
    ).toEqual([{ nombre: 'Desarrollo web', miembros: ['ana', 'b-2'] }]);
  });

  it('rechaza nombres vacíos o repetidos', () => {
    expect(() =>
      validarGrupos({ grupos: [{ nombre: ' ', miembros: [] }] }),
    ).toThrow('nombre');
    expect(() =>
      validarGrupos({
        grupos: [
          { nombre: 'Estadística', miembros: [] },
          { nombre: 'estadística', miembros: [] },
        ],
      }),
    ).toThrow('dos grupos');
  });

  it('rechaza usuarios que no son de GitHub', () => {
    expect(() =>
      validarGrupos({ grupos: [{ nombre: 'A', miembros: ['<script>'] }] }),
    ).toThrow('no es un usuario');
  });

  it('exige la forma { grupos: [...] }', () => {
    expect(() => validarGrupos({})).toThrow('Se esperaba');
  });
});
