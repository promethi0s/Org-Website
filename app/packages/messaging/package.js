Package.describe({
  name: 'promethi0s:messaging',
  version: '0.0.1',
  summary: 'Meteor package to handle client messaging',
  git: 'https://github.com/promethi0s/messaging',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use(['accounts-base', 'tracker', 'session', 'jquery', 'mongo', 'promethi0s:permissions', 'promethi0s:links']);

  api.export('Messaging', ['client', 'server']);
  api.export(['Messages', 'Rooms'], 'client');

  api.addFiles('libs/client.js', 'client');
  api.addFiles('libs/common.js', ['client', 'server']);
  api.addFiles('libs/server.js', 'server');
});

Package.onTest(function(api) {
  api.use(['promethi0s:messaging', 'tinytest']);
});