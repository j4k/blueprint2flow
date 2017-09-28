// @flow

import test from 'tape';
import type {Test} from 'tape';

import {flowResultTest} from './util';

test(
  'nullable',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'types.apib': `
# Data Structures

## Person (object)

- id: 123 (number, nullable)
- name: Jack (string, required)
- variable: Jack (string, required, nullable)
- surname: Wall (string, required)
- hobbies (array[string])
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Person} from './types';

function testPerson(s : Person): string[] {
  const values : string[] = [s.name, s.surname];
  if (s.variable) {
    values.push(s.variable);
  }
  return values;
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);

test(
  'required',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'types.apib': `
# Data Structures      

## Person (object)

- id: 123 (number, nullable)
- name: Jack (string, required)
- variable: Jack (string)
- surname: Wall (string, required)
- hobbies (array[string])
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Person} from './types';

function testPerson(s : Person): string[] {
  const values : string[] = [s.name, s.surname];
  if (s.variable) {
    values.push(s.variable);
  }
  return values;
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
