Meteor.methods({
    sendMessage: function (room, text) {
        Messages.insert({
                room: room,
                author: Meteor.user().profile.moniker,
                text: text,
                time: new Date()
            }
        );
    }
});

Messaging = {};

Messaging.createRoom = function(name, restricted, users, permanent) {
    Meteor.call('createRoom', name, restricted, users, permanent)
};

Messaging.inviteUser = function(room, user) {
    Meteor.call('inviteUser', room, user)
};

Messaging.sendMessage = function(room, text) {
    Meteor.call('sendMessage', room, text)
};

Messaging.setChatStatus = function(text) {
    Meteor.call('setChatStatus', text)
};