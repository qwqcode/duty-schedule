module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2018
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'airbnb-typescript/base',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/vue',
    'plugin:vue/recommended'
  ],
  plugins: ['@typescript-eslint', 'vue', 'import'],
  globals: {
    __static: true
  },
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'class-methods-use-this': 0,
    'no-param-reassign': 0,
    'vue/require-component-is': 0,
    'no-plusplus': 0,
    'vue/max-attributes-per-line': ['warn', {
      "singleline": 4,
      "multiline": {
        "max": 1,
        "allowFirstLine": false
      }
    }]
  },
  settings: {
    'import/core-modules': ['electron', 'vue-property-decorator'],
    'import/resolver': {
      // use <root>/tsconfig.json
      'typescript': {},
    }
  }
}
