Package.describe({
  name: 'promethi0s:links',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Meteor package to handle user attr',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/promethi0s/links',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use(['accounts-base', 'mongo', 'promethi0s:ntp']);
  api.use(['tracker', 'jquery'], 'client');

  api.addFiles('libs/client.js', 'client');
  api.addFiles('libs/server.js', 'server');

  api.export('Links');
});

Package.onTest(function(api) {
  api.use(['promethi0s:links', 'tinytest']);
});