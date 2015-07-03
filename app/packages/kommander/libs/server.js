Meteor.methods({
    setupKommander: function() {
        Kommander.addKommand('help', 'kommanderHelp', [], 'Shows available kommands and descriptions');
        Kommander.addKommand('join', 'addReceiveRoom', ['Enter room name.'], 'Adds room to receive list.');
        Kommander.addKommand('leave', 'removeReceiveRoom', ['Enter room name.'], 'Removes room from receive list.');
        Kommander.addKommand('invite', 'inviteUser', ['Enter username.', 'Enter room name.'], 'Invites user to room.');
        Kommander.addKommand('kick', 'kickUser', ['Enter username.', 'Enter room name.'], 'Kicks user from room.');
        Kommander.addKommand('status', 'setChatStatus', ['Enter chat status'], 'Changes chat status.');
        Kommander.addKommand('whisper', 'whisper', ['Enter user name'], 'Sends private message to user')
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

Meteor.publish('null', function() {
    Kommands.find()
});