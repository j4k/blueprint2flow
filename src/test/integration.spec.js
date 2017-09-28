// @flow

import test from 'tape';
import type { Test } from 'tape';

import { flowResultTest } from './util';

test(
  'integration test',
  flowResultTest(
    {
      // language=apiBlueprint MSON
      'test.apib': `
# Data Structures

## Person (object)

- id: 123 (number)
- name: Jack (string, required)
- surname: Wall (string, required)
- hobbies (array[string])
- tags (array)
    - hello (string)
    - 42 (number)

## PersonWithMetaData (object)

- Include Person
- meta (object)
    - created: 2015
    - editor: 1234
- nested_array (array)
    - 1, 2, 3, 4 (array[number])
    
## Company

+ name: Apiary (string, required)
+ founder (Person)
+ founded: 2011 (number) - The year in which the company was founded
+ employees (array[Person, PersonWithMetaData], required)
- tag (enum, required)
    - green (string)
    - (object)
        - tag_id: 1 (number)
        - label: green (string)

## FooType (object)

- Include Company
- meta (object)
    - created: 2015 (number)
    - editor: 1234 (string)
    - nestedObject (object)
       - prop1: 123 (number)
       - prop2: foo (string)
       - nextNestedObj (object)
           - prop1 : 1234 (number)
- nested_array (array)
    - 1, 2, 3, 4 (array[number])
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {Person, PersonWithMetaData, Company, FooType} from './test';

function testPerson(s : Person): Person {
  return s;
}

function companyBelongsToPerson(s: Company, u: Person): boolean {
  return s.founder && s.founder.id && u.id ? s.founder.id === u.id : false;
}

function fooTypeHasCompanyProps(s: FooType, u: Person): boolean {
  return s.founder && s.founder.id && u.id ? s.founder.id === u.id : false;
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
