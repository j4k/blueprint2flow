#!/usr/bin/env node

import 'babel-register';
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import commonPathPrefix from 'common-path-prefix';
import mkdirp from 'mkdirp';

import 'source-map-support/register';

import { BlueprintFileConverter } from './convert';

const argv = yargs
  .usage('Usage: $0 [options] <blueprint files..>')
  .option('suffix', {
    describe: 'appended to generated type names',
    default: 'Type'
  })
  .help('h')
  .alias('h', 'help').argv;

const blueprintPaths = argv._;

if (!blueprintPaths.length) {
  yargs.showHelp();
  process.exit(1);
}

const allOutput = {};

for (const blueprintPath of blueprintPaths) {
  const converter = new BlueprintFileConverter(blueprintPath);
  allOutput[converter.fileName] = converter.generateFlowFile();
}

const root = commonPathPrefix(Object.keys(allOutput));

for (const blueprintPath in allOutput) {
  const relativeblueprintPath = path.dirname(
    path.relative(root, blueprintPath)
  );
  const jsFilename = path.resolve(
    'flow-output',
    relativeblueprintPath,
    `${path.basename(blueprintPath, '.blueprint')}.js`
  );
  mkdirp(path.dirname(jsFilename), () =>
    fs.writeFile(jsFilename, allOutput[blueprintPath], () =>
      console.log(`Wrote ${jsFilename}`)
    )
  );
}
