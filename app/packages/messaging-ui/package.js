Package.describe({
  name: 'promethi0s:messaging-ui',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'User Interface for messaging package',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use(['tracker', 'service-configuration', 'accounts-base', 'jquery',
    'underscore', 'templating', 'session', 'mongo', 'promethi0s:messaging'], 'client');
  api.addFiles(['main/main.css', 'main/main.html', 'main/main.js',
    'widget/widget.css', 'widget/widget.html', 'widget/widget.js'], 'client')
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('promethi0s:messaging-ui');
});
