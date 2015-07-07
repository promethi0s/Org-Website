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
        return {style: 'color:' + Session.get('roomColors')[room]}
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
        var kommand = t.find('#konsole').value;
        if (e.keyCode == 32) {
            if (kommand.charAt(0) == '/') {
                performKommand(kommand.slice(1))
            } else if (Session.get('kommandMode')) {
                continueKommand(kommand)
            }
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
    $(document).bind("contextmenu", function(e) {
        e.preventDefault();
    }).mousedown(function(e) {
        $('#chatDropdown').hide();
        var contextMenu = $("div.context-menu");
        if (e.button != 2 && !$(e.target).is(".context-menu") || contextMenu.is(':visible')) {
            contextMenu.hide();
        }
        if (e.button == 2) {
            $("<div class='context-menu'>Context</div>").appendTo("body").css({
                top: e.pageY + "px",
                left: e.pageX + "px"
            })
        }
    }).keydown(function(e) {
        var konsole = $('#konsole');
        if (e.keyCode == 13) {
            e.preventDefault();
            if (konsole.is(':focus')) {
                var kommand = konsole.val(),
                    sendRoom = Session.get('sendRoom'),
                    receiveRooms = Session.get('receiveRooms');
                if (kommand == '') {
                    konsole.blur()
                } else if (kommand.charAt(0) == '/' || Session.get('kommandMode')) {
                    performKommand(kommand)
                } else {
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

    Session.set('kommands', Kommands.find({}).map(function(kommand) {return kommand._id}))
};

performKommand = function(kommand) {
    kommand = kommand.toLowerCase();

    var shortcut = KommandShortcuts.findOne({_id: kommand});
    if (shortcut) {
        kommand = shortcut.kommand
    }

    var toPerform = Kommands.findOne({_id: kommand}),
        roomName = kommand.charAt(0).toUpperCase() + kommand.slice(1),
        konsole = $('#konsole');
    if (toPerform) {
        Session.set('kommandMode', kommand);
        Session.set('maxParam', toPerform.prompts.length);
        Session.set('params', []);
        konsole.attr('value', '');
        konsole.attr('placeholder', toPerform.prompts[0]);
    } else if (Session.get('receiveRooms').indexOf(roomName) > -1) {
        Session.set('sendRoom', roomName);
        konsole.val('')
    }
};

continueKommand = function(kommand) {
    kommand = kommand.toLowerCase();
    var rooms = Session.get('receiveRooms');
    switch (Session.get('kommandMode')) {
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
Session.set('roomColors', []);
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