module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'plugin:react/recommended',
    'google',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'settings': {
    'react': {
      'version': 'detect',
    },
  },
  'plugins': [
    'react',
    '@typescript-eslint',
  ],
  'rules': {
    'max-len': ['error', {'code': 160}],
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'object-curly-spacing': ['error', 'never'],
    // 'template-curly-spacing': ['error', 'never'],
    // 'space-in-brackets': ['error', 'never'],
  },
};
