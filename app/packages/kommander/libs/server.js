Meteor.methods({
    kommanderSetup: function() {
        Kommander.addKommand('help', 'kommanderHelp', [], 'Shows available kommands and descriptions');
        Kommander.addKommand('join', 'addReceiveRoom', ['Enter room name.'], 'Adds room to receive list.');
        Kommander.addKommand('leave', 'removeReceiveRoom', ['Enter room name.'], 'Removes room from receive list.');
        Kommander.addKommand('invite', 'inviteUser', ['Enter username.', 'Enter room name.'], 'Invites user to room.');
        Kommander.addKommand('kick', 'kickUser', ['Enter username.', 'Enter room name.'], 'Kicks user from room.');
        Kommander.addKommand('status', 'setChatStatus', ['Enter chat status'], 'Changes chat status.');
        Kommander.addKommand('whisper', 'whisper', ['Enter user name'], 'Sends private message to user.');
        Kommander.addKommand('reply', 'reply', [], 'Sends reply to last contact.')
    },

    kommanderAddShortcut: function(shortcut, kommand) {
        if (Permissions.getPermission(this.userId, 'superUser')) {
            KommandShortcuts.insert(
                {
                    _id: shortcut,
                    kommand: kommand
                }
            )
        }
    }
});

Kommander = {};

Kommander.addKommand = function(kommand, method, prompts, helperTip) {
    Kommands.insert(
        {
            _id: kommand,
            method: method,
            prompts: prompts,
            helperTip: helperTip
        }
    )
};

Meteor.publish(null, function() {
    return Kommands.find()
});