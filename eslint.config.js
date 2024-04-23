import { all, GLOB_EXCLUDE, sxzz } from '@sxzz/eslint-config';
import SimpleImportSort from 'eslint-plugin-simple-import-sort';

GLOB_EXCLUDE.push(...['**/public', '!.vscode/*', 'auto-imports.d.ts', 'components.d.ts']);

export default sxzz([
  ...all,
  {
    plugins: {
      'simple-import-sort': SimpleImportSort,
    },
    rules: {
      'prettier/prettier': 0, //eslint不触发prettier formatter，交给prettier自己触发

      // import排序
      'import/default': 0,
      'import/export': 0,
      'import/order': 0,
      'import/no-duplicates': 1, // 同一导入合并为一行
      'import/consistent-type-specifier-style': [1, 'prefer-top-level'], // ts 类型单独一行
      'import/no-default-export': 0, // 必须命名导出
      'no-duplicate-imports': 0,
      'sort-imports': 0,
      'simple-import-sort/imports': 1,
      'simple-import-sort/exports': 1,
      'unused-imports/no-unused-imports': 1, //自动移除未使用导入
      curly: [1, 'all'],

      'no-undef': 0,

      //文件命名格式
      'unicorn/filename-case': 0,

      'no-restricted-syntax': [0],
      '@typescript-eslint/consistent-type-assertions': 0,
      '@typescript-eslint/unified-signatures': 0,
    },
  },
]);
