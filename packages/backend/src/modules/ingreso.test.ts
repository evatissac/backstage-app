import { comprobarMembresia } from './ingreso';

const respuesta = (status: number) => ({ status } as Response);

describe('comprobarMembresia', () => {
  const base = { login: 'ana', organizaciones: ['DevHRL'], token: 'ghp_x' };

  it('204 es miembro', async () => {
    const fetchFn = jest.fn().mockResolvedValue(respuesta(204));
    await expect(comprobarMembresia({ ...base, fetchFn })).resolves.toBe(
      'miembro',
    );
    expect(fetchFn.mock.calls[0][0]).toBe(
      'https://api.github.com/orgs/DevHRL/members/ana',
    );
  });

  it('404 en todas las organizaciones es ajeno', async () => {
    const fetchFn = jest.fn().mockResolvedValue(respuesta(404));
    await expect(comprobarMembresia({ ...base, fetchFn })).resolves.toBe(
      'ajeno',
    );
  });

  it('basta ser miembro de una organización', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(respuesta(404))
      .mockResolvedValueOnce(respuesta(204));
    await expect(
      comprobarMembresia({
        ...base,
        organizaciones: ['A', 'B'],
        fetchFn,
      }),
    ).resolves.toBe('miembro');
  });

  it('sin token no se puede saber (no se trata como ajeno)', async () => {
    const fetchFn = jest.fn();
    await expect(
      comprobarMembresia({ ...base, token: undefined, fetchFn }),
    ).resolves.toBe('desconocida');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('un token malo (401) o una caída de la API no echan a nadie', async () => {
    const avisos: string[] = [];
    await expect(
      comprobarMembresia({
        ...base,
        fetchFn: jest.fn().mockResolvedValue(respuesta(401)),
        alAviso: m => avisos.push(m),
      }),
    ).resolves.toBe('desconocida');
    await expect(
      comprobarMembresia({
        ...base,
        fetchFn: jest.fn().mockRejectedValue(new Error('timeout')),
        alAviso: m => avisos.push(m),
      }),
    ).resolves.toBe('desconocida');
    expect(avisos).toHaveLength(2);
  });

  it('un 302 (el token no ve la lista) tampoco es un rechazo', async () => {
    const fetchFn = jest.fn().mockResolvedValue(respuesta(302));
    await expect(comprobarMembresia({ ...base, fetchFn })).resolves.toBe(
      'desconocida',
    );
  });

  it('escapa el nombre de usuario en la URL', async () => {
    const fetchFn = jest.fn().mockResolvedValue(respuesta(404));
    await comprobarMembresia({ ...base, login: 'a/../b', fetchFn });
    expect(fetchFn.mock.calls[0][0]).toBe(
      'https://api.github.com/orgs/DevHRL/members/a%2F..%2Fb',
    );
  });
});
