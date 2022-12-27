import fs from 'fs';
// eslint-disable-next-line import/no-unresolved, import/extensions
import Compiler from '../src/lib/compiler';

export default async function getMethodTeal(
  filename: string,
  className: string,
  methodName: string,
  length: number,
): Promise<string[]> {
  const compiler = new Compiler(fs.readFileSync(filename, 'utf-8'), className);
  await compiler.compile();
  const { teal } = compiler;

  const index = teal.indexOf(`${methodName}:`);
  return teal.slice(index + 2, index + 2 + length);
}
