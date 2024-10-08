import antfu from '@antfu/eslint-config';

export default antfu({
  formatters: true,
  stylistic: {
    semi: true,
  },
  rules: {
    // 同一导入合并为一行
    'import/no-duplicates': 'warn',
    // ts 类型单独一行
    'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
    // 必须命名导出
    'import/no-default-export': 'off',
    // 自动移除未使用导入
    'unused-imports/no-unused-imports': 'warn',
  },
});
