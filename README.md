# blueprint2flow

Automagically converts [ApiBlueprint](https://apiblueprint.org/) specs to
[Flowtype](https://flow.org/) type definition files!

Example:

```markdown
## Person (object)

- id: 123 (number, nullable)
- name: Jack (string, required)
- surname: Wall (string, required)
- hobbies (array[string])
- tags (array)
    - hello (string)
    - 42 (number)
```

Output:
```js
// @flow
type Person = {
      id?: ?number,
      name: string,
      surname: string,
      hobbies?: Array<string>,
      tags?: Array<string | number>
};
```

## Installation and Usage

```
npm install blueprint2flow
blueprint2flow my/service.apib
```

## Contributing

I'd love for you to contribute to this project.

- If you **find a bug**, please open an issue with a failing test or submit a fix via a pull request
- If you **have a feature request**, open an issue, or submit an implementation via a pull request
- If you **want to contribute**, submit a pull request

Thanks!
