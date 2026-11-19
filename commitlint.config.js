export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['repo', 'ui', 'server', 'db', 'docs']],
    'scope-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
  },
}
