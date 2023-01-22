import fs from 'fs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../src/lib/compiler';

export async function getMethodTeal(
  filename: string,
  className: string,
  methodName: string,
): Promise<string[]> {
  const compiler = new Compiler(fs.readFileSync(filename, 'utf-8'), className);
  await compiler.compile();
  const { teal } = compiler;

  const labelIndex = teal.indexOf(`${methodName}:`);
  const retsubIndex = teal.indexOf('retsub', labelIndex);
  return teal.slice(labelIndex + 2, retsubIndex);
}

export function lowerFirstChar(str: string) {
  return `${str.charAt(0).toLocaleLowerCase() + str.slice(1)}`;
}
