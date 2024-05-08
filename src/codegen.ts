/* eslint-disable prefer-template */
import fs from 'node:fs';
import { posix } from 'node:path';

import openapiTS, { astToString } from 'openapi-typescript';

import { resolveObjectOrRef, resolveOpenapi } from './resolve';
import { strHump } from './utils';

const HEADER_CODE = `
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by @xiankq/openapi-typescript-expand
// Power by openapi-typescript
`;

/**
 * openapiCodegen构造参数
 */
export interface OpenapiCodegenOptions {
  /**
   * 生成代码的路径文件夹
   */
  output: string;

  /**
   * 请求函数名称
   */
  requestName: string;

  /**
   * 文件头部添加的字符串
   */
  headerCode?: string;
}

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export async function openapiTypescriptExpand(source: any, options: OpenapiCodegenOptions) {
  const output = `${posix.resolve(options.output)}`;

  const schema = await resolveOpenapi(source);
  const ast = await openapiTS(schema, {
    alphabetize: true,
    additionalProperties: true,
  });
  const openapiCode = astToString(ast);

  let mainCode = '';
  const pathKeys = Object.keys(schema.paths ?? {});
  pathKeys?.forEach((path) => {
    const data = resolveObjectOrRef(schema, schema.paths![path]).object;
    const methods = Object.keys(data) as HttpMethod[];
    methods.forEach((method) => {
      const operation = resolveObjectOrRef(schema, data[method]).object;
      if (!operation) {
        return;
      }
      const PATH_NAME = `${strHump(path, 'lower')}Using${strHump(method, 'upper')}`;
      const PATH_NAME_UPPER = strHump(PATH_NAME, 'upper');

      //评论
      const comment =
        `\n\n/**` +
        `\n${operation.tags?.map((e) => ` * @tag ${e}`).join('\n')}` +
        `\n * @summary ${operation.summary}` +
        `\n * @url ${path}` +
        `\n * @method ${method}` +
        `\n * @description ${operation.description ?? ''}` +
        `\n */` +
        '\n';

      const requestBody = resolveObjectOrRef(schema, operation.requestBody).object;
      const contentType = Object.keys(requestBody?.content ?? {})[0];
      const statusType = Object.keys(operation.responses ?? {})[0];
      const responses = resolveObjectOrRef(
        schema,
        Object.values(operation.responses ?? {})?.[0],
      ).object;

      const responseType = Object.keys(responses.content ?? {})[0];
      const parameters = operation.parameters?.map((e) => resolveObjectOrRef(schema, e).object);
      const hasHeader = !!parameters?.filter((e) => e.in === 'header')?.length;
      const hasPath = !!parameters?.filter((e) => e.in === 'path')?.length;
      const hasQuery = !!parameters?.filter((e) => e.in === 'query')?.length;
      const hasBody = !!contentType;
      const hasResult = !!statusType && !!responseType;

      const moduleItem: string[] = [];
      const optionItem: string[] = [];
      moduleItem.push(
        `export type Operation = paths['${path}']['${method}']`,
        hasResult
          ? `export type Result = Required<Operation>['responses']['${statusType}']['content']['${contentType}']`
          : `export type Result = any`,
      );
      optionItem.push(`[key: string]: unknown`);

      if (hasBody) {
        moduleItem.push(
          `export type Body = Required<Operation>['requestBody']['content']['${contentType}']`,
        );
        optionItem.push(`data: Body`);
      }
      if (hasHeader) {
        moduleItem.push(`export type Header = Operation['parameters']['header']`);
        optionItem.push(`header?: Header`);
      }
      if (hasPath) {
        moduleItem.push(`export type Path = Operation['parameters']['path']`);
        optionItem.push(`path: Path`);
      }
      if (hasQuery) {
        moduleItem.push(`export type Query = Operation['parameters']['query']`);
        optionItem.push(`params: Query`);
      }

      moduleItem.push(
        `export interface Options {\n` + optionItem.map((e) => `    ${e};`).join('\n') + `\n  }`,
      );

      mainCode +=
        `${comment}` +
        `export module ${PATH_NAME_UPPER} {\n` +
        moduleItem.map((e) => `  ${e};`).join('\n') +
        `\n}`;

      mainCode +=
        `${comment}` +
        `export function ${PATH_NAME}(options:${PATH_NAME_UPPER}.Options):Promise<${PATH_NAME_UPPER}.Result> {` +
        `\n  return ${options.requestName}({` +
        `\n    url:'${path}',` +
        `\n    method:'${method}',` +
        `\n    ...options,` +
        `\n  });` +
        `\n}`;
    });
  });

  const headerCode = `${HEADER_CODE}\n` + `${options.headerCode ?? ''}`;
  fs.mkdirSync(posix.resolve(output, '../'), { recursive: true });
  fs.writeFileSync(posix.resolve(output), `${headerCode}\n${mainCode}\n${openapiCode}`);
}
