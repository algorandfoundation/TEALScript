// eslint-disable-next-line import/no-extraneous-dependencies
import { globSync } from 'glob';
import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { Compiler } from '../src/lib';

const TESTS_PROJECT = new Project({
  tsConfigFilePath: path.join(__dirname, '..', 'tests', 'contracts', 'tsconfig.json'),
});

const EXAMPLES_PROJECT = new Project({
  tsConfigFilePath: path.join(__dirname, '..', 'examples', 'tsconfig.json'),
});

const examplesArtifacts = {
  amm: 'tealscript_artifacts',
  auction: 'tealscript_artifacts',
  tuple_in_box: 'tealscript_artifacts',
};

async function main() {
  const files = globSync(path.join(__dirname, '../**/*.algo.ts'));
  files.forEach((file) => {
    if (file.includes('compile_errors')) return;
    const isExample = file.includes('examples/');
    const project = isExample ? EXAMPLES_PROJECT : TESTS_PROJECT;

    const options = {
      cwd: process.cwd(),
      project,
      srcPath: file,
    };

    const compilers = Compiler.compileAll(options);

    let dir = path.join(__dirname, '..', 'tests', 'contracts', 'artifacts');

    if (isExample) {
      const dirName = path.basename(path.dirname(file));
      const artifactsDirName = examplesArtifacts[dirName] ?? 'artifacts';
      dir = path.join(path.dirname(file), artifactsDirName);
    }

    compilers.forEach(async (compilerPromise) => {
      const compiler = await compilerPromise;

      const { name } = compiler;

      const approvalPath = path.join(dir, `${name}.approval.teal`);
      const clearPath = path.join(dir, `${name}.clear.teal`);
      const abiPath = path.join(dir, `${name}.arc4.json`);
      const appPath = path.join(dir, `${name}.arc32.json`);
      const srcmapPath = path.join(dir, `${name}.src_map.json`);
      const lsigPath = path.join(dir, `${name}.lsig.teal`);

      if (fs.existsSync(approvalPath)) fs.rmSync(approvalPath);
      if (fs.existsSync(clearPath)) fs.rmSync(clearPath);
      if (fs.existsSync(abiPath)) fs.rmSync(abiPath);
      if (fs.existsSync(appPath)) fs.rmSync(appPath);
      if (fs.existsSync(srcmapPath)) fs.rmSync(srcmapPath);
      if (fs.existsSync(lsigPath)) fs.rmSync(lsigPath);

      if (compiler.teal.lsig.length > 0) {
        fs.writeFileSync(lsigPath, compiler.teal.lsig.map((t) => t.teal).join('\n'));
        fs.writeFileSync(srcmapPath, JSON.stringify(compiler.srcMap, null, 2));
        return;
      }

      fs.writeFileSync(approvalPath, compiler.teal.approval.map((t) => t.teal).join('\n'));
      fs.writeFileSync(clearPath, compiler.teal.clear.map((t) => t.teal).join('\n'));
      fs.writeFileSync(abiPath, JSON.stringify(compiler.abiJSON(), null, 2));
      fs.writeFileSync(srcmapPath, JSON.stringify(compiler.srcMap, null, 2));
      fs.writeFileSync(appPath, JSON.stringify(compiler.appSpec(), null, 2));
    });
  });
}

await main();
