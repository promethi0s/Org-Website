Kommander = {};

Kommander.callKommand = function(_id, parameters) {
    var method = Kommands.findOne({_id: _id}).method;
    Meteor.call(method, parameters)
};

Kommander.addShortcut = function(shortcut, kommand) {
    Meteor.call('kommanderAddShortcut', shortcut, kommand)
};

Kommander.setup = function() {
    Meteor.call('permissionsSetup');
    Meteor.call('messagingSetup');
    Meteor.call('kommanderSetup')
};