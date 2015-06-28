Template.messagingMain.helpers({
    users: function () {
        return Meteor.users.find({}, {sort: {'profile.moniker': 1}})
    },

    messages: function () {
        return Messages.find(
            {room: {$in: Session.get('currentReceiveRooms')}},
            {sort: {time: 1}})
    },

    rooms: function () {
        return Session.get('availableRooms')
    },

    sendRoom: function() {
        return Session.get('currentSendRoom').toString()
    },

    isChecked: function (room) {
        return (Session.get('currentReceiveRooms').indexOf(room) > -1)
    },

    capitalized: function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
});

Template.messagingMain.events = {
    'click #roomSelector': function (e) {
        e.stopPropagation();
        $('#chatDropdown').slideToggle()
    },

    'click #chatDropdown': function (e) {
        e.stopPropagation();
    },

    'keyup #message': function(e, t) {
        var message = t.find('#message').value;
        if (message.charAt(0) == '/' && message.charAt(message.length - 1) == ' ') {
            var command = message.substring(1, message.length - 1);
            if (performCommand(command)) $('#message').val('')
        }
    },

    'submit .message': function (e, t) {
        e.preventDefault();
        var message = t.find('#message').value,
            sendRoom = Session.get('currentSendRoom'),
            receiveRooms = Session.get('currentReceiveRooms');
        if (message == '') {
            return
        } else if (message.charAt(0) == '/') {
            performCommand(message.substring(1));
        } else if (Session.get('commandMode')) {
            completeCommand(message)
        } else {
            if (receiveRooms.indexOf(sendRoom) < 0) {
                receiveRooms.push(sendRoom);
                Session.set('currentReceiveRooms', receiveRooms)
            }
            Meteor.call('sendMessage', sendRoom, message);
        }
        $('.message').trigger('reset');
    },

    'change .activeRooms': function (e) {
        var rooms = Session.get('currentReceiveRooms');
        if (e.target.checked) {
            rooms.push(e.target.id);
            Session.set('currentReceiveRooms', rooms)
        } else {
            rooms.splice(e.target.id);
            Session.set('currentReceiveRooms', rooms)
        }
    },

    'change #roomRestricted': function () {
        $('#inviteList').toggle();
    },

    'change #inviteList': function (e) {
        var users = Session.get('inviteList');
        if (e.target.checked) {
            users.push(e.target.id);
            Session.set('inviteList', users)
        } else {
            users.splice(e.target.id);
            Session.set('inviteList', users)
        }
    },

    'submit .chatOptions': function (e, t) {
        e.preventDefault();
        var chatStatus = t.find('#chatStatus').value,
            sendRoom = t.find('#sendRoom').value.toLowerCase();
        if (chatStatus != '') {
            Meteor.call('setChatStatus', chatStatus);
            $('#chatStatus').val('')
        }
        if (sendRoom != '' && Session.get('availableRooms').indexOf(sendRoom) > -1) {
            Session.set('currentSendRoom', sendRoom);
            $('#sendRoom').val('')
        }
    },

    'submit .createRoom': function(e, t) {
        e.preventDefault();
        var roomName = t.find('#roomName').value,
            roomRestricted = t.find('#roomRestricted').value,
            roomUsers = [];

        if (roomName != '') {
            if (roomRestricted) roomUsers = Session.get('inviteList');
            Messaging.createRoom(roomName, roomRestricted, roomUsers, false);
            $('#roomName').val('');
            $('#roomRestricted').val(false);
            Session.set('inviteList', [])
        }
    }
};

$(document).click(function() {
    $('#chatDropdown').hide()
});

$(document).keyup(function(e) {
    var konsole = $('#message');
    if (e.keyCode == 13 || e.keyCode == 191) {
        if (!konsole.is(':focus')) {
            konsole.focus();
            if (e.keyCode == 191) {
                konsole.val('/')
            }
        }
    } else if (e.keyCode == 27) {
        if (konsole.is(':focus')) {
            resetKonsole();
            konsole.blur()
        }
    }
});

var commandModes = ['help', 'join', 'leave', 'invite', 'whisper', 'status'];

performCommand = function(command) {
    if (commandModes.indexOf(command) > -1) {
        setCommandMode(command)
    } else if (Session.get('availableRooms').indexOf(command) > -1) {
        Session.set('currentSendRoom', command);
        return true
    }
};

completeCommand = function(command) {
    var commandMode = Session.get('commandMode');
    if (commandMode != false) {
        switch (commandMode) {
            case 'help':
                break;
            case 'join':
                break;
            case 'leave':
                break;
            case 'invite':
                break;
            case 'whisper':
                break;
            case 'status':
                break;
        }
    }
}

setCommandMode = function(command) {
    Session.set('commandMode', command)
};

resetKonsole = function () {
    Session.set('commandMode', false);
    $('#message').val('')
};

Meteor.subscribe('messaging');

Session.set('currentReceiveRooms', ['general']);
Session.set('currentSendRoom', ['general']);
Session.set('inviteList', []);

Tracker.autorun(function () {
    Session.get('currentReceiveRooms').forEach(function(room) {
        Messages.find({room: room}).count();
    });

    var list = $('#messagesList');
    list.scrollTop(list.prop('scrollHeight'));
});

Tracker.autorun(function() {
    Session.set('availableRooms',
        Rooms.find({}, {sort: {name: 1}}).map(function(room) {return room._id}))
});