Permissions = {};

Permissions.getGroupPermissions = function(group) {
    Meteor.call('getGroupPermissions', group)
};

Permissions.setGroupPermissions = function(group, permissions) {
    Meteor.call('setGroupPermissions', group, permissions)
};

Permissions.getClientPermissions = function(target) {
    Meteor.call('getClientPermissions', target)
};

Permissions.setClientPermissions = function(target, permissions) {
    Meteor.call('setClientPermissions', target, permissions)
};

Permissions.getGroups = function() {
    Meteor.call('getGroups')
};

Permissions.assignGroup = function(target, group) {
    Meteor.call('assignGroup', target, group)
};