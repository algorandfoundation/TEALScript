import { writeFileSync } from 'fs';
import packageJson from '../package.json';

const { version } = packageJson;
writeFileSync('./src/version.ts', `export const VERSION = '${version}';\n`);
