Meteor.methods({
    permissionsSetup: function() {
        if (!Permissions.initialized()) {
            GroupPermissions.insert({
                _id: 'default',
                permissions: {
                    admin: false,
                    assignGroup: 0
                },
                users: []
            });

            GroupPermissions.insert({
                _id: 'admin',
                permissions: {
                    admin: true,
                    assignGroup: 1
                },
                users: []
            });

            GroupPermissions.insert({
                _id: 'superUser',
                permissions: {
                    superUser: true,
                    admin: true,
                    assignGroup: 2
                },
                users: []
            });
        }
    },

    getClientPermissions: function(target) {
        if (Permissions.getPermission(this.userId, 'superUser')) {
            return Meteor.users.find({ _id: target }, { permissions: 1 })
        }
    },

    setClientPermissions: function(target, permissions) {
        if (Permissions.getPermission(this.userId, 'superUser')) {
            Meteor.users.update(
                { _id: target },
                {$set: { permissions: permissions }}
            )
        }
    },

    getGroupPermissions: function(group) {
        if (Permissions.getPermission(this.userId, 'admin')) {
            return GroupPermissions.find({ _id: group }, { permissions: 1 })
        }
    },

    setGroupPermissions: function(group, permissions) {
        if (Permissions.getPermission(this.userId, 'superUser')) {
            GroupPermissions.update(
                { _id: group },
                { $set: { permissions: permissions }}
            )
        }
    },

    createGroup: function(group) {
        if (Permissions.getPermission(this.userId, 'superUser')) {
            GroupPermissions.insert(
                {_id: group},
                {$set: {permissions: Permissions.getGroupPermissions('default')}}
            )
        }
    },

    getGroups: function() {
        if (Permissions.getPermission(this.userId, 'admin')) {
            return GroupPermissions.find({}, {_id: 1, users: 1})
        }
    },

    assignGroup: function(target, group) {
        if ((Permissions.getPermission(this.userId, 'admin') && Permissions.hasHigherPower(this.userId, target, 'assignGroup')) ||
            Permissions.getPermission(this.userId, 'superUser')) {
                Permissions.assignGroup(target, group)
        }
    },

    setAsSuperUser: function() {
        var superUserExists = Meteor.users.find({'permissions.superUser': true}).count() != 0;

        if (!superUserExists) {
            Permissions.assignGroup(this.userId, 'superUser');
            Permissions.log('admin', 'Permissions: Super User created, id: ' + this.userId + '.')
        } else {
            Permissions.log('admin', 'Permissions: ' + this.userId + ' attempting to gain Super User access.')
        }
    },

    permissionsTest: function() {
        Permissions.resetGroup()
    }
});

Permissions = {};

Permissions.initialized = function() {
    return GroupPermissions.find().count() != 0
};

Permissions.addUser = function(target) {
    Permissions.assignGroup(target, 'default')
};

Permissions.assignGroup = function(target, group) {
    Meteor.users.update(
        {_id: target},
        {$set: {permissions: Permissions.getGroupPermissions(group)}}
    );

    GroupPermissions.update(
        {users: {$in: [target]}},
        {$pull: {users: target}}
    );

    GroupPermissions.update(
        {_id: group},
        {$push: {users: target}}
    )
};

Permissions.addPermission = function(permissionName, defaultValue) {
    var modifier = { $set: {} };
    modifier.$set['permissions.' + permissionName] = defaultValue;
    GroupPermissions.update(
        {},
        modifier,
        {multi: true}
    )
};

Permissions.resetGroup = function(group) {
    if (group == undefined) {

    }
};

Permissions.hasHigherPower = function(user, target, permission) {
    return Permissions.getPermission(user, permission) > Permissions.getPermission(target, permission)
};

Permissions.getPermission = function(target, permission) {
    return Meteor.users.findOne({_id: target})['permissions'][permission]
};

Permissions.getGroupPermissions = function(group) {
    return GroupPermissions.findOne({_id: group})['permissions']
};

Permissions.log = function(type, message) {
    PermissionsLog.insert({
        type: type,
        message: message
    })
};