Meteor.methods({

    // Account Methods
    createAccount: function( username, moniker, password, email ) {

        if (Meteor.users.findOne(
                {$or: [
                    { username: username },
                    { email: email }
                ]})) throw new Meteor.Error( 400 );

        Accounts.createUser({

            username: username,
            password: password,
            email: email,
            profile: {
                moniker: moniker,
                joined: new Date()
            },
            status: {
                chatStatus: 'Online'
            }

        });

        Permissions.addUser( Meteor.users.findOne({ username: username })[ '_id' ])

    }

});