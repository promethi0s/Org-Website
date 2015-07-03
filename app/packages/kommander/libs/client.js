Kommander = {};

Kommander.callKommand = function(_id, parameters) {
    var method = Kommands.findOne({_id: _id}).method;
    Meteor.call(method, parameters)
};

Kommander.setup = function() {
    Meteor.call('setupPermissions');
    Meteor.call('setupMessaging');
    Meteor.call('setupKommander')
};