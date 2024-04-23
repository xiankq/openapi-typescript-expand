import type { OpenAPI3, ReferenceObject } from 'openapi-typescript';
import { convert } from 'swagger2openapi';

import { isObject, strPinyin } from './utils';

/**
 * 传入openapi2/3数据，进行中文变量转换、去除无效引用后、传出openapi3数据
 * @param source
 * @returns
 */
export const resolveOpenapi = async (source: any): Promise<OpenAPI3> => {
  let data: any;
  if (typeof source === 'string') {
    eval(`data=${source}`);
  } else {
    data = source;
  }
  data = repair(data);
  if (data.swagger) {
    const obj = await convert(data, {});
    data = obj.openapi;
  }
  const openapi = data as OpenAPI3;
  return openapi;
};

//转换oas中的中文变量定义、去除无效引用、去除错误引用
const repair = (schema: any) => {
  schema = JSON.parse(JSON.stringify(schema));

  const refCheck = (obj: Record<string, any>) => {
    Object.keys(obj).forEach((key) => {
      if (isObject(obj[key])) {
        refCheck(obj[key]);
      } else if (key === '$ref') {
        const ref: string = obj[key];

        //删除错误的引用
        let fields = ref?.split?.('/');
        if (fields?.[0] !== '#') {
          delete obj.$ref;
          return;
        }
        fields = fields?.slice?.(1);

        if (!fields?.length) {
          delete obj.$ref;
          return;
        }

        //删除不存在的引用
        let value = schema;
        for (const field of fields) {
          value = value[field];
          if (!value) {
            break;
          }
        }
        if (!value) {
          delete obj.$ref;
          return;
        }

        // 中文引用修复
        fields[fields.length - 1] = strPinyin(fields.at(-1)!);
        obj.$ref = `#/${fields.join('/')}`;
      }
    });
  };

  refCheck(schema);

  // 修复中文定义
  const definitions = schema.swagger ? schema.definitions : schema.components.schemas;
  Object.keys(definitions).forEach((key) => {
    const resoleKey = strPinyin(key);
    if (resoleKey !== key) {
      definitions[resoleKey] = definitions[key];
      delete definitions[key];
    }
  });

  return schema;
};

export type ResolveObjectOrRefReturn<T> =
  | {
      isRef: true;
      object: T;
      origin: ReferenceObject;
    }
  | {
      isRef: false;
      object: T;
      origin: T;
    };

export function resolveObjectOrRef<T>(
  openapi: OpenAPI3,
  objectOrRef: T | ReferenceObject,
): ResolveObjectOrRefReturn<T> {
  const ref = (objectOrRef as ReferenceObject)?.$ref;
  if (ref) {
    const fields = ref.split('/').slice(1);
    let object = openapi as any;
    while (fields.length > 0) {
      object = object[fields.shift()!];
    }
    return {
      isRef: true,
      object: object as T,
      origin: objectOrRef as ReferenceObject,
    };
  } else {
    return {
      isRef: false,
      object: objectOrRef as T,
      origin: objectOrRef as T,
    };
  }
}
