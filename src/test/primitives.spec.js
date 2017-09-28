// @flow

import test from 'tape';
import type {Test} from 'tape';

import {flowResultTest} from './util';

test(
  'strings',
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
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Person} from './types';

function testPerson(s : Person) {
  const values : string[] = [s.name, s.surname];
  return [values];
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
  'arrays',
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
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Person} from './types';

function testPerson(s : Person): Person {
  if (s.hobbies) {
    if (Array.isArray(s.hobbies)) {
      const hobbies = s.hobbies;
      hobbies.push('coding');
      hobbies.push('somethingelse');
      s.hobbies = [...hobbies];
    }
  }
  
  if (s.tags) {
    if (Array.isArray(s.tags)) {
      const tags = s.tags;
      tags.push('a string');
      tags.push(12345);
      s.tags = [...tags];
    }
  }
  
  return s;
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
  'objects',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'types.apib': `
# Data Structures
      
## TestObject (object)

- nestedObject (object, required)
   - prop1: 123 (number)
   - prop2: foo (string)
   - nextNestedObj (object, required)
       - prop1 : 1234 (number, required)
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {TestObject} from './types';

function testPerson(s : TestObject): number {
  return s.nestedObject.nextNestedObj.prop1 * 4;
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
  'numbers',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'types.apib': `
# Data Structures
      
## TestObject (object)

- nestedObject (object, required)
   - prop1: 123 (number, required)
   - prop2: foo (number, required)
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {TestObject} from './types';

function testPerson(s : TestObject): number {
  return s.nestedObject.prop1 * s.nestedObject.prop2;
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
