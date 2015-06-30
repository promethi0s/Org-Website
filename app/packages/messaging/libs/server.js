/*
 ** !Todo: Add automatic deletion of temporary rooms
 */

Meteor.methods({
    messagingSetup: function() {
        if (Rooms.find().count() == 0) {
            Permissions.addPermission('createRoom', true);
            Permissions.addPermission('createPermanentRoom', false);
            Permissions.addPermission('modifyRoom', 0);

            Rooms.insert({
                _id: 'general',
                restricted: false,
                users: [],
                moderators: [],
                modifyPower: 3,
                permanent: true
            })
        }
    },

    createRoom: function(name, restricted, users, permanent) {
        if (Permissions.getPermission(this.userId, 'createRoom')) {
            name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            Rooms.insert({
                _id: name,
                restricted: restricted,
                users: users,
                moderators: [this.userId],
                modifyPower: Permissions.getPermission(this.userId, 'modifyRoom'),
                permanent: (permanent && Permissions.getPermission(this.userId, 'createPermanentRoom'))
            })
        }
    },

    inviteUser: function (room, moniker) {
        if (Rooms.findOne({_id: room})['moderators'].indexOf(this.userId) > -1) {
            Rooms.update({
                $push: {users: Meteor.users.findOne({'profile.moniker': moniker})['_id']}
            })
        }
    },

    sendMessage: function (room, text) {
        if ((!Rooms.findOne({_id: room})['restricted'] || Rooms.findOne({_id: room})[ 'users' ].indexOf( this.userId ) > -1) && text != '') {
            Messages.insert({
                    room: room,
                    author: Meteor.user().profile.moniker,
                    text: text,
                    time: new Date()
                }
            );
        }
    },

    setChatStatus: function (text) {
        Meteor.users.update(
            {_id: Meteor.userId()},
            {$set: {'status.chatStatus': text}}
        )
    }
});

Messaging = {};

Messaging.initialized = function() {
    return Rooms.find().count() != 0
};

Meteor.publish('messaging', function() {
    var availableRooms = Rooms.find(
        {$or: [
            {restricted: false},
            {users: {$in: [this.userId]}}
        ]}
    ).map(function(room) {
            return room._id;
        });

    return [
        Messages.find({room: {$in: availableRooms}}),

        Rooms.find({_id: {$in: availableRooms}}),

        Meteor.users.find(
        { },
        { fields: {
            _id: 1,
            'profile.moniker': 1,
            'status.online': 1,
            'status.chatStatus': 1
        }}
    )
    ]
});