// @flow
/* eslint-disable handle-callback-err */

import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import type { Test } from 'tape';

import tmp from 'tmp';

import { BlueprintFileConverter } from '../main/convert';

export const flowResultTest = (
  files: { [string]: string },
  testFn: (Function, FlowResult) => void,
  suffix: string = 'XXX'
) => (t: Test) => {
  const root = tmp.dirSync().name;
  const paths = Object.keys(files);
  paths.forEach(p => fs.writeFileSync(path.resolve(root, p), files[p]));
  paths
    .filter(p => p.endsWith('.apib'))
    .map(p => path.resolve(root, p))
    .forEach(p =>
      fs.writeFileSync(
        p.replace(/\.apib$/, '.js'),
        new BlueprintFileConverter(p).generateFlowFile()
      )
    );
  fs.writeFileSync(path.resolve(root, '.flowconfig'), '');
  exec('flow check --json', { cwd: root }, (err, stdout, stderr) =>
    testFn(
      t,
      JSON.parse(typeof stdout === 'string' ? stdout : stdout.toString())
    )
  );
};
