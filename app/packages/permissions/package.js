Package.describe({
  name: 'promethi0s:permissions',
  version: '0.0.1',
  summary: 'Meteor package to handle individual and group permissions',
  git: 'https://github.com/promethi0s/permissions',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use(['accounts-base', 'mongo']);

  api.export('Permissions', ['client', 'server']);

  api.addFiles('libs/client.js', 'client');
  api.addFiles('libs/common.js', ['client', 'server']);
  api.addFiles('libs/server.js', 'server');
});

Package.onTest(function(api) {
  api.use(['promethi0s:permissions', 'tinytest']);
});