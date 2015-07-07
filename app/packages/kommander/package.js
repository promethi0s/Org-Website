Package.describe({
  name: 'promethi0s:kommander',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'User Interface for web app, integration with all Promethi0s packages.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use(['templating', 'jquery', 'tracker', 'session', 'mongo', 'accounts-base', 'promethi0s:messaging', 'promethi0s:permissions']);

  api.export(['Kommander', 'Kommands', 'KommandShortcuts'], ['client', 'server']);

  api.addFiles(['main/main.css', 'main/main.html', 'main/main.js',
    'widget/widget.css', 'widget/widget.html', 'widget/widget.js',
    'libs/client.js'], 'client');
  api.addFiles('libs/common.js', ['client', 'server']);
  api.addFiles('libs/server.js', 'server')
});
