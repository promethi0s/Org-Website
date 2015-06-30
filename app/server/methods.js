Meteor.methods({
    // Account Methods
    createAccount: function( username, moniker, password, email ) {
        if (Meteor.users.findOne(
                {$or: [
                    {username: username},
                    {email: email}
                ]})) throw new Meteor.Error(400);

        Accounts.createUser({
            username: username,
            password: password,
            email: email,
            profile: {
                moniker: moniker,
                joined: new Date()
            }
        });

        if (Permissions.initialized()) Permissions.addUser(Meteor.users.findOne({username: username})['_id']);

        if (Messaging.initialized()) Meteor.users.update({username: username}, {$set: {'status.chatStatus': 'Online'}})
    }
});