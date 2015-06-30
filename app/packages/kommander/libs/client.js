Kommander = {};

Kommander.setup = function(app) {
    switch (app) {
        case 'messaging':
            Meteor.call('messagingSetup');
            break;
        case 'permissions':
            Meteor.call('permissionsSetup');
            break
    }
};