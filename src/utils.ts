import { pinyin } from 'pinyin-pro';

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

/**
 * 字符串转驼峰
 * @param str
 * @param format
 */
export function strHump(str: string, format: 'upper' | 'lower' = 'upper'): string {
  if (!str) {
    return str;
  }

  str = str.replaceAll(/(\W|_)(\w)?/g, (_$1, $2, $3) => {
    let res = '';
    if (/\w+/.test($2)) {
      res = $2[0].toUpperCase() + $2.slice(1);
    }
    const other = ($3?.[0] ?? '')?.toUpperCase() ?? '';
    return `${res}${other}`;
  });

  let $1 = format === 'lower' ? str[0]?.toLowerCase() : str[0]?.toUpperCase();
  $1 ??= '';
  return $1 + str.slice(1);
}

/**
 * 字符串转拼音
 * @param str
 * @param format
 */
export function strPinyin(str: string, format: 'upper' | 'lower' = 'upper'): string {
  const res = str.replaceAll(/(\W|_)(\w)?/g, (_$1, $2, $3) => {
    let py = pinyin($2, {
      pattern: 'pinyin',
      toneType: 'none',
      separator: '_',
    });
    py ??= '';
    return `${strHump(py) ?? ''}${$3 ?? ''}`;
  });
  return strHump(res, format);
}
