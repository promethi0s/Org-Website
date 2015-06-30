Template.topBanner.events({

    'click #profileToggle': function(e) {
        e.stopPropagation();
        setUserInfoLogin();
        $('#profile').slideToggle();
        setTimeout(function() {$('#username').focus()}, 500)
    },

    'click #profile': function(e) {
        e.stopPropagation()
    },

    'click #loginLink': function() {
        setUserInfoLogin()
    },

    'click #signupLink': function() {
        setUserInfoSignup()
    },

    'click #forgotLink': function() {
        setUserInfoForgot()
    },

    'click #signoutLink': function() {
        $('#profile').slideToggle();
        setTimeout(function() {Meteor.logout(function() {})}, 500)
    },

    'submit #userInfo': function(e, t) {
        e.preventDefault();
        submitUserInfo(t)
    }

});

Template.topBanner.rendered = function() {
    $(document).click(function() {
        $('#profile').hide()
    });
};

var profileView;

function setUserInfoLogin() {
    $('#userInfo').trigger('reset');
    $('#userInfo *').hide();
    $('.loginElement').show();
    $('#userInfoPrompt').text('Please enter your credentials.');
    profileView = 'login'
}

function setUserInfoSignup() {
    $('#userInfo').trigger('reset');
    $('#userInfo *').hide();
    $('.signupElement').show();
    $('#userInfoPrompt').text('Please fill everything out.');
    profileView = 'signup'
}

function setUserInfoForgot() {
    $('#userInfo').trigger('reset');
    $('#userInfo * ').hide();
    $('.forgotElement').show();
    $('#userInfoPrompt').text('Please fill out what you remember.');
    profileView = 'forgot'
}

function submitUserInfo(t) {

    var errors = []
        , username = t.find('#username').value
        , moniker = t.find('#moniker').value
        , password = t.find('#password').value
        , passwordConfirm = t.find('#passwordConfirm').value
        , email = t.find('#email').value
        , emailConfirm = t.find('#emailConfirm').value;

    if (profileView == 'login') {

        if (username == '') errors.push('Username cannot be blank!');
        if (password == '') errors.push('Password cannot be blank!');

        if (errors.length != 0) {

            $('#userInfoPrompt').html(errors.join('<br>'));

        } else {

            Meteor.loginWithPassword(username, password, function(err) {
                if (err) {
                    $('#userInfoPrompt').text('Credentials do not match.');
                } else {
                    setTimeout($('#profile').slideToggle(), 500)
                }
            })

        }

        return false
    }

    if (profileView == 'signup') {

        if (!username) errors.push('Username cannot be blank!');
        if (!moniker) errors.push('Moniker cannot be blank!');
        if (!password) errors.push('Password cannot be blank!');
        if (password != passwordConfirm) errors.push('Passwords must match!');
        if (!email) errors.push('Email cannot be blank!');
        if (email != emailConfirm) errors.push('Emails must match!');

        if (errors.length != 0) {

            $('#userInfoPrompt').html(errors.join('<br>'));

        } else {

            Meteor.call('createAccount', username, moniker, password, email, function(error) {
                if (error) {
                    $('#userInfoPrompt').text('Could not create user.')
                } else {
                    Meteor.loginWithPassword(username, password);
                    setTimeout($('#profile').slideToggle(), 500)
                }})

        }

        return false

    }

    if (profileView == 'forgot') {
        return false
    }

}