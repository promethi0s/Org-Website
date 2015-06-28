var LinksServerInternals, UserConnections, Links, activeSession, addSession, idleSession, loginSession, onStartup, removeSession, statusEvents, tryLogoutSession;

UserConnections = new Mongo.Collection("user_status_sessions", {
    connection: null
});

statusEvents = new (Npm.require('events').EventEmitter)();

statusEvents.on("connectionLogin", function(advice) {
    var conns, update;
    update = {
        $set: {
            'status.online': true,
            'status.lastLogin': {
                date: advice.loginTime,
                ipAddr: advice.ipAddr,
                userAgent: advice.userAgent
            }
        }
    };
    conns = UserConnections.find({
        userId: advice.userId
    }).fetch();
    if (!_.every(conns, function(c) {
            return c.idle;
        })) {
        update.$set['status.idle'] = false;
        update.$unset = {
            'status.lastActivity': null
        };
    }
    Meteor.users.update(advice.userId, update);
});

statusEvents.on("connectionLogout", function(advice) {
    var conns;
    conns = UserConnections.find({
        userId: advice.userId
    }).fetch();
    if (conns.length === 0) {
        Meteor.users.update(advice.userId, {
            $set: {
                'status.online': false
            },
            $unset: {
                'status.idle': null,
                'status.lastActivity': null
            }
        });
    } else if (_.every(conns, function(c) {
            return c.idle;
        })) {
        if (advice.lastActivity != null) {
            return;
        }
        Meteor.users.update(advice.userId, {
            $set: {
                'status.idle': true,
                'status.lastActivity': _.max(_.pluck(conns, "lastActivity"))
            }
        });
    }
});

statusEvents.on("connectionIdle", function(advice) {
    var conns;
    conns = UserConnections.find({
        userId: advice.userId
    }).fetch();
    if (!_.every(conns, function(c) {
            return c.idle;
        })) {
        return;
    }
    Meteor.users.update(advice.userId, {
        $set: {
            'status.idle': true,
            'status.lastActivity': _.max(_.pluck(conns, "lastActivity"))
        }
    });
});

statusEvents.on("connectionActive", function(advice) {
    Meteor.users.update(advice.userId, {
        $set: {
            'status.idle': false
        },
        $unset: {
            'status.lastActivity': null
        }
    });
});

onStartup = function(selector) {
    if (selector == null) {
        selector = {};
    }
    return Meteor.users.update(selector, {
        $set: {
            "status.online": false
        },
        $unset: {
            "status.idle": null,
            "status.lastActivity": null
        }
    }, {
        multi: true
    });
};

addSession = function(connection) {
    UserConnections.upsert(connection.id, {
        $set: {
            ipAddr: connection.clientAddress,
            userAgent: connection.httpHeaders['user-agent']
        }
    });
};

loginSession = function(connection, date, userId) {
    UserConnections.upsert(connection.id, {
        $set: {
            userId: userId,
            loginTime: date
        }
    });
    statusEvents.emit("connectionLogin", {
        userId: userId,
        connectionId: connection.id,
        ipAddr: connection.clientAddress,
        userAgent: connection.httpHeaders['user-agent'],
        loginTime: date
    });
};

tryLogoutSession = function(connection, date) {
    var conn;
    if ((conn = UserConnections.findOne({
            _id: connection.id,
            userId: {
                $exists: true
            }
        })) == null) {
        return false;
    }
    UserConnections.upsert(connection.id, {
        $unset: {
            userId: null,
            loginTime: null
        }
    });
    return statusEvents.emit("connectionLogout", {
        userId: conn.userId,
        connectionId: connection.id,
        lastActivity: conn.lastActivity,
        logoutTime: date
    });
};

removeSession = function(connection, date) {
    tryLogoutSession(connection, date);
    UserConnections.remove(connection.id);
};

idleSession = function(connection, date, userId) {
    UserConnections.update(connection.id, {
        $set: {
            idle: true,
            lastActivity: date
        }
    });
    statusEvents.emit("connectionIdle", {
        userId: userId,
        connectionId: connection.id,
        lastActivity: date
    });
};

activeSession = function(connection, date, userId) {
    UserConnections.update(connection.id, {
        $set: {
            idle: false
        },
        $unset: {
            lastActivity: null
        }
    });
    statusEvents.emit("connectionActive", {
        userId: userId,
        connectionId: connection.id,
        lastActivity: date
    });
};

Meteor.startup(onStartup);

Meteor.onConnection(function(connection) {
    addSession(connection);
    return connection.onClose(function() {
        return removeSession(connection, new Date());
    });
});

Accounts.onLogin(function(info) {
    return loginSession(info.connection, new Date(), info.user._id);
});

Meteor.publish(null, function() {
    if (this._session == null) {
        return [];
    }
    if (this.userId == null) {
        tryLogoutSession(this._session.connectionHandle, new Date());
    }
    return [];
});

Meteor.methods({
    "user-status-idle": function(timestamp) {
        var date;
        check(timestamp, Match.OneOf(null, void 0, Date, Number));
        date = timestamp != null ? new Date(timestamp) : new Date();
        idleSession(this.connection, date, this.userId);
    },
    "user-status-active": function(timestamp) {
        var date;
        check(timestamp, Match.OneOf(null, void 0, Date, Number));
        date = timestamp != null ? new Date(timestamp) : new Date();
        activeSession(this.connection, date, this.userId);
    }
});

Links = {
    connections: UserConnections,
    events: statusEvents
};

LinksServerInternals = {
    onStartup: onStartup,
    addSession: addSession,
    removeSession: removeSession,
    loginSession: loginSession,
    tryLogoutSession: tryLogoutSession,
    idleSession: idleSession,
    activeSession: activeSession
};