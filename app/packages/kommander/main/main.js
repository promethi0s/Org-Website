Template.kommanderMain.helpers({
    users: function () {
        return Meteor.users.find({}, {sort: {'profile.moniker': 1}})
    },

    messages: function () {
        return Session.get('messages')
    },

    rooms: function () {
        return Session.get('rooms')
    },

    sendRoom: function() {
        return Session.get('sendRoom').toString()
    },

    isChecked: function(room) {
        return (Session.get('receiveRooms').indexOf(room) > -1)
    },

    color: function(room) {
        return {color: Session.get('roomColors')[room]}
    },

    systemTrim: function(room) {
        if (room.substring(0, 6) == 'system') {
            return '[system]'
        } else {
            return '[' + room + ']'
        }
    }
});

Template.kommanderMain.events = {
    'click #roomSelector': function (e) {
        e.stopPropagation();
        $('#chatDropdown').slideToggle()
    },

    'click #chatDropdown': function (e) {
        e.stopPropagation();
    },

    'keydown #konsole': function(e, t) {
        var konsole = t.find('#konsole'),
            kommand = konsole.value;
        if (kommand.charAt(0) == '/' && kommand.charAt(konsole.length - 1) == ' ') {
            setMode(kommand)
        }
    },

    'change .activeRooms': function (e) {
        var rooms = Session.get('receiveRooms');
        if (e.target.checked) {
            rooms.push(e.target.id);
            Session.set('receiveRooms', rooms)
        } else {
            rooms.splice(e.target.id);
            Session.set('receiveRooms', rooms)
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
        if (sendRoom != '' && Session.get('rooms').indexOf(sendRoom) > -1) {
            Session.set('sendRoom', sendRoom);
            $('#sendRoom').val('')
        }
    },

    'submit .createRoom': function(e, t) {
        e.preventDefault();
        var roomName = t.find('#roomName').value,
            roomRestricted = t.find('#roomRestricted').checked,
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

Template.kommanderMain.rendered = function() {
    document.oncontextmenu = function() {return false};

    $(document).click(function() {
        $('#chatDropdown').hide()
    });

    $(document).keydown(function(e) {
        var konsole = $('#konsole');
        if (e.keyCode == 13) {
            e.preventDefault();
            if (konsole.is(':focus')) {
                var kommand = konsole.value,
                    sendRoom = Session.get('sendRoom'),
                    receiveRooms = Session.get('receiveRooms');
                if (kommand.charAt(0) == '/') {
                    performKommand(kommand.substring(1));
                } else if (Session.get('kommandMode')) {
                    completeKommand(kommand)
                } else if (kommand != '') {
                    if (receiveRooms.indexOf(sendRoom) < 0) {
                        receiveRooms.push(sendRoom);
                        Session.set('receiveRooms', receiveRooms)
                    }
                    Meteor.call('sendMessage', sendRoom, kommand);
                }
            } else {
                konsole.focus()
            }
        } else if (e.keyCode == 191) {
            if (!konsole.is(':focus')) {
                e.preventDefault();
                konsole.focus();
                konsole.val('/')
            }
        } else if (e.keyCode == 27) {
            if (konsole.is(':focus')) {
                resetKonsole();
                konsole.blur()
            }
        }
    });

    $('#usersList').mousedown(function(e) {
        if (e.button == 2) {}
    });

    Session.set('kommands', Kommands.find({}).map(function(kommand) {return kommand._id}))
};

setMode = function(kommand) {
    kommand = kommand.toLowerCase();

    switch (kommand) {
        case 'r':
            kommand = 'reply';
            break;
        case 'g':
            kommand = 'general';
            break;
        case 'w':
            kommand = 'whisper';
            break
    }

    if (kommandModes.indexOf(kommand) > -1) {
        Session.set('kommandMode', kommand);
        var konsole = $('#konsole');
        konsole.val('');
        switch (kommand) {
            case 'join':
                konsole.attr('placeholder', 'Room');
                break;
            case 'leave':
                konsole.attr('placeholder', 'Room');
                break;
            case 'invite':
                konsole.attr('placeholder', 'User');
                break;
            case 'kick':
                konsole.attr('placeholder', 'User');
                break;
            case 'send':
                konsole.attr('placeholder', 'Room');
                break;
            case 'whisper':
                konsole.attr('placeholder', 'User');
                break;
            case 'status':
                konsole.attr('placeholder', 'Status');
                break;
            case 'setup':
                konsole.attr('placeholder', 'App');
                break
        }
    }
};

performKommand = function(kommand) {
    if (Session.get('kommands').indexOf(kommand) > -1) {
        switch (kommand) {
            case 'help':
                break;
            case 'reply':
                break
        }
    } else if (Session.get('rooms').indexOf(kommand) > -1) {
        Session.set('sendRoom', kommand);
        return true
    }
};

completeKommand = function(kommand) {
    kommand = kommand.toLowerCase();
    var rooms = Session.get('receiveRooms');
    switch (Session.get('kommandMode')) {
        case 'join':
            rooms.push(kommand);
            Session.set('receiveRooms', rooms);
            break;
        case 'leave':
            if (kommand != 'general') {
                rooms.splice(kommand);
                Session.set('receiveRooms', rooms)
            }
            break;
        case 'invite':
            break;
        case 'kick':
            break;
        case 'send':
            break;
        case 'status':
            break;
        case 'setup':
            Kommander.setup(kommand);
            break;
    }
    resetKonsole()
};

resetKonsole = function () {
    Session.set('kommandMode', false);
    var konsole = $('#konsole');
    konsole.attr('placeholder', Session.get('sendRoom'));
    konsole.val('')
};

Meteor.subscribe('messaging');

Session.set('receiveRooms', ['General']);
Session.set('sendRoom', 'General');
Session.set('inviteList', []);
Session.set('messages',
    Messages.find(
        {room: {$in: Session.get('receiveRooms')}},
        {
            sort:  {time: 1},
            limit: 150
        }).fetch());

Tracker.autorun(function () {
    Session.get('receiveRooms').forEach(function(room) {
        Messages.find({room: room}).count();
    });

    var list = $('#messagesList');
    list.scrollTop(list.prop('scrollHeight'));
});

Tracker.autorun(function() {
    Session.set('messages',
        Messages.find(
            {room: {$in: Session.get('receiveRooms')}},
            {
                sort:  {time: 1},
                limit: 150
            }).fetch());
});

Tracker.autorun(function() {
    Session.set('rooms',
        Rooms.find({}, {sort: {name: 1}}).map(function(room) {return room._id}))
});