Package.describe({
  name: 'promethi0s:ntp',
  version: '0.0.1',
  summary: 'Meteor package to synchronize time between server and client',
  git: 'https://github.com/promethi0s/ntp',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use(['tracker', 'http'], 'client');
  api.use('webapp', 'server');

  api.addFiles('libs/client.js', 'client');
  api.addFiles('libs/server.js', 'server');

  api.export('Ntp', 'client');
});

Package.onTest(function(api) {
  api.use(['promethi0s:messaging', 'tinytest']);
});