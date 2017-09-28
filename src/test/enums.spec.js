// @flow

import test from 'tape';
import type {Test} from 'tape';

import {flowResultTest} from './util';

test(
  'enums',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'types.apib': `
# Data Structures

## Person (object)

- id: 123 (number, nullable)
- name: Jack (string, required)
- surname: Wall (string, required)

## Company

+ name: Apiary (string, required)
+ founder (Person)
+ founded: 2011 (number) - The year in which the company was founded
+ employees (array[Person], required)
- tag (enum, required)
    - green (string)
    - blue (string)
    - red (string)
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Company} from './types';

function test(s : Company): string {
  return s.tag;
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
  'different type enums',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'types.apib': `
# Data Structures

## Person (object)

- id: 123 (number, nullable)
- name: Jack (string, required)
- surname: Wall (string, required)

## Company

+ name: Apiary (string, required)
+ founder (Person)
+ founded: 2011 (number) - The year in which the company was founded
+ employees (array[Person], required)
- tag (enum, required)
    - green (string)
    - (object)
        - tag_id: 1 (number, required)
        - label: green (string, required)
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Company} from './types';

function test(s : Company): string {
  if (typeof s.tag === 'object') {
    return s.tag.label;
  }
  
  return s.tag;
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
