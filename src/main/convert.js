// @flow
import fs from 'fs';
import prettier from 'prettier';
import drafter from 'drafter';
import { chain, compose, find, filter, prop, map, lensPath, view } from 'ramda';

const drafterOptions = {
  generateSourceMap: true,
  type: 'ast'
};

export class BlueprintFileConverter {
  constructor(fileName) {
    this.fileName = fileName;

    const fileContents = fs.readFileSync(fileName, 'UTF-8');
    const result = drafter.parseSync(fileContents.toString(), drafterOptions);

    this.dataStructs = this.getDataStructs(result.ast);
  }

  generateFlowFile() {
    return prettier.format(
      [
        '// @flow',
        `// Generated by blueprint2flow at ${new Date().toString()}\n// Source: ${this
          .fileName}`,
        ...this.convertDefinitionsToCode(this.dataStructs)
      ]
        .filter(Boolean)
        .join('\n\n'),
      { parser: 'flow' }
    );
  }

  extractTypes(struct, retrievalKey = 'element') {
    if (Array.isArray(struct)) {
      return struct
        .map(x => this.extractTypes(x, retrievalKey))
        .filter((v, i, a) => a.indexOf(v) === i);
    }

    switch (struct.element) {
      case 'member':
        // Deal with single or multiple values underneath current key
        return this.extractMember(struct, retrievalKey);
      case 'array':
        return this.buildArray(this.extractTypes(struct.content, retrievalKey));
      case 'object':
        return this.buildObject(
          this.extractTypes(struct.content, retrievalKey)
        );
      case 'enum':
        return this.buildEnum(this.extractTypes(struct.content, 'content'));
      default:
        break;
    }

    return retrievalKey === 'element'
      ? struct[retrievalKey]
      : `'${struct[retrievalKey]}'`;
  }

  extractMember(struct, retrievalKey) {
    return ['object', 'array', 'enum'].includes(struct.content.value.element)
      ? this.buildKeyVal(
          struct,
          this.extractTypes(struct.content.value, retrievalKey)
        )
      : this.buildKeyVal(
          struct,
          this.conditionallyStringifyValue(retrievalKey, struct)
        );
  }

  buildArray(children) {
    return `Array<${children.join('|')}>`;
  }
  buildEnum(children) {
    return `${children.join('|')}`;
  }
  buildObject(children) {
    return `{ ${children} }`;
  }

  lookupTypeAttr(struct, key) {
    return (
      struct.attributes &&
      Array.isArray(struct.attributes.typeAttributes) &&
      struct.attributes.typeAttributes.includes(key)
    );
  }

  isOptional(struct) {
    return !this.lookupTypeAttr(struct, 'required');
  }

  isNullable(struct) {
    return this.lookupTypeAttr(struct, 'nullable');
  }

  buildKeyVal(struct, children) {
    return `${struct.content.key.content}${this.isOptional(struct)
      ? '?'
      : ''} : ${this.isNullable(struct) ? '?' : ''}${children}`;
  }

  conditionallyStringifyValue(retrievalKey: string, struct: {}) {
    return retrievalKey === 'content' &&
      struct.content.value.element === 'string'
      ? `'${struct.content.value[retrievalKey]}'`
      : struct.content.value[retrievalKey];
  }

  convertDefinitionsToCode(structs: any) {
    return map(
      struct =>
        this.buildFlowType(
          this.extractTypeName(struct),
          this.extractContent(struct)
        ),
      structs
    );
  }

  buildFlowType(key, typeContent) {
    const converted = typeContent
      .filter(y => y.element !== 'ref')
      .map(x => this.extractTypes(x))
      .filter(Boolean);

    let intersections = '';

    if (typeContent.some(y => y.element === 'ref')) {
      intersections = `${typeContent
        .filter(y => y.element === 'ref')
        .map(y => y.content.href)
        .join(' & ')} & `;
    }

    return `export type ${key} = ${intersections}{\n${converted.join(
      ',\n'
    )}\n};`;
  }

  extractTypeName(struct) {
    return view(lensPath(['meta', 'id']), struct);
  }

  extractContent(struct) {
    return prop('content', struct);
  }

  getDataStructs(ast) {
    return compose(
      chain(this.extractContent),
      this.extractContent,
      x => x.shift(),
      filter(elem =>
        find(obj => obj.element === 'dataStructure', this.extractContent(elem))
      )
    )(ast.content);
  }
}
