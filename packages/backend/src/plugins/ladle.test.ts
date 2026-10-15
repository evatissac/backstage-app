import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crearAlmacenLadle, tipoDe } from './ladle';

describe('ladle', () => {
  it('da el tipo de cada archivo del sitio', () => {
    expect(tipoDe('index.html')).toBe('text/html; charset=utf-8');
    expect(tipoDe('assets/index-abc.js')).toBe(
      'text/javascript; charset=utf-8',
    );
    expect(tipoDe('assets/fuente.woff2')).toBe('font/woff2');
    expect(tipoDe('sin-extension')).toBe('application/octet-stream');
  });

  it('lee un sitio compilado en una carpeta local, con rutas con /', async () => {
    const carpeta = await mkdtemp(join(tmpdir(), 'ladle-'));
    await mkdir(join(carpeta, 'assets'));
    await writeFile(join(carpeta, 'index.html'), '<html></html>');
    await writeFile(join(carpeta, 'assets', 'app.js'), 'console.log(1)');
    const leer = crearAlmacenLadle({} as any);
    const sitio = await leer('kit', { carpetaLocal: carpeta });
    expect([...sitio!.archivos.keys()].sort()).toEqual([
      'assets/app.js',
      'index.html',
    ]);
  });

  it('sin URL ni carpeta no hay sitio', async () => {
    const leer = crearAlmacenLadle({} as any);
    expect(await leer('otro', {})).toBeUndefined();
  });
});
