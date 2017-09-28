// @flow

import test from 'tape';
import type {Test} from 'tape';

import {flowResultTest} from './util';

test(
  'intersections',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'types.apib': `
# Data Structures

## Person (object)

- id: 123 (number, nullable)
- name: Jack (string, required)
- surname: Wall (string, required)
- hobbies (array[string])
- tags (array)
    - hello (string)
    - 42 (number)

## PersonWithMetaData (object)

- Include Person
- meta (object, required)
    - created: sometime (string, required)
    - editor: 1234
- nested_array (array)
    - 1, 2, 3, 4 (array[number])
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Person, PersonWithMetaData} from './types';

function testPerson(s : PersonWithMetaData):string[] {
  const values : string[] = [s.name, s.surname, s.meta.created];
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
