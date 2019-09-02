module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    project: "./tsconfig.json"
  },
  env: {
    browser: true,
    node: true
  },
  extends: ['standard', 'prettier', 'prettier/standard'],
  globals: {
    __static: true
  },
  plugins: ['@typescript-eslint', 'prettier', 'standard', 'html'],
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    "no-unused-vars": "warn"
  }
}
