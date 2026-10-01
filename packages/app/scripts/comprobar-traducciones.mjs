// Compara cada translations/messages/<ref>.en.json (lo que exporta Backstage)
// con su <ref>.es.json. Falla si:
//   - un plugin exportado no tiene archivo en español,
//   - falta una clave o sobra una que el plugin ya no usa,
//   - los marcadores ({{count}}, {from}...) no son los mismos: i18next los
//     dejaría sin sustituir y el usuario vería el texto crudo.
// Se ejecuta después de `yarn traducciones:exportar` al actualizar Backstage.
/* eslint-disable no-console -- es un script de terminal: la consola es su salida. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const carpeta = fileURLToPath(
  new URL('../translations/messages/', import.meta.url),
);
const leer = archivo =>
  JSON.parse(readFileSync(join(carpeta, archivo), 'utf8'));
const marcadores = texto =>
  [...texto.matchAll(/\{\{\s*([^}]+?)\s*\}\}|\{(\w+)\}/g)]
    .map(m => (m[1] ?? m[2]).split(',')[0].trim())
    .sort()
    .join(' ');

const archivos = readdirSync(carpeta);
const errores = [];

for (const base of archivos.filter(a => a.endsWith('.en.json'))) {
  const ref = base.slice(0, -'.en.json'.length);
  const traducido = `${ref}.es.json`;
  if (!archivos.includes(traducido)) {
    errores.push(`${ref}: falta ${traducido}`);
    continue;
  }
  const en = leer(base);
  const es = leer(traducido);
  for (const clave of Object.keys(en)) {
    if (!(clave in es)) errores.push(`${ref}: falta la clave «${clave}»`);
    else if (marcadores(en[clave]) !== marcadores(es[clave]))
      errores.push(`${ref}: marcadores distintos en «${clave}»`);
  }
  for (const clave of Object.keys(es)) {
    if (!(clave in en)) errores.push(`${ref}: sobra la clave «${clave}»`);
  }
}

if (errores.length) {
  console.error(errores.join('\n'));
  console.error(`\n${errores.length} problema(s) en las traducciones.`);
  process.exit(1);
}
console.log('Traducciones completas.');
