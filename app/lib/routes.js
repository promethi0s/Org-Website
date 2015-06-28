Router.configure({
  layoutTemplate: 'MasterLayout',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound'
});

Router.route('/', {
  name: 'home',
  controller: 'HomeController',
  action: 'action',
  where: 'client'
});

Router.route('/about', {
  name: 'about',
  controller: 'AboutController',
  action: 'action',
  where: 'client'
});

Router.route('/admin', {
  name: 'admin',
  controller: 'AdminController',
  action: 'action',
  where: 'client'
});

Router.route('/forums', {
  name: 'forums',
  controller: 'ForumsController',
  action: 'action',
  where: 'client'
});

Router.route('/gaming', {
  name: 'gaming',
  controller: 'GamingController',
  action: 'action',
  where: 'client'
});

Router.route('/news', {
  name: 'news',
  controller: 'NewsController',
  action: 'action',
  where: 'client'
});

Router.route('/settings', {
  name: 'settings',
  controller: 'SettingsController',
  action: 'action',
  where: 'client'
});

