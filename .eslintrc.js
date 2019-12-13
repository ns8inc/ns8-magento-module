module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint-config-airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  env: {
    node: true
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/*-spec.ts', 'test/**/*'],
      env: {
        jest: true
      }
    }
  ],
  rules: {
    // allows for some NestJS practices that show classMethod() { return 'value'; }
    'class-methods-use-this': 'off',
    // allow for importing devDependencies in test files
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true
      }
    ],
    // prefer destructed imports instead of importing defaults
    'import/prefer-default-export': 'off',
    // allow for dependency injection in NestJS classes
    'no-useless-constructor': 'off',
    'no-underscore-dangle': 'off',
    'import/extensions': ['error', { '.ts': 'ignorePackages' }],
    camelcase: 'off',
    '@typescript-eslint/camelcase': ['error', { properties: 'never' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-duplicates': 'off'
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts']
      }
    }
  }
};
