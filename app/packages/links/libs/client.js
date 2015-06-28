var LinksClientInternals, Links, isIdle, isMonitoring, lastActivity, monitor, start, stop, touch
  , monitorId = null
  , idle = false
  , lastActivityTime = undefined
  , monitorDep = new Tracker.Dependency
  , idleDep = new Tracker.Dependency
  , activityDep = new Tracker.Dependency
  , focused = true;

LinksClientInternals = {
    idleThreshold: null,
    idleOnBlur: false,

    computeState: function(lastActiveTime, currentTime, isWindowFocused) {
        var inactiveTime;
        inactiveTime = currentTime - lastActiveTime;
        if (LinksClientInternals.idleOnBlur && !isWindowFocused) {
            return true;
        }
        return (inactiveTime > LinksClientInternals.idleThreshold)
    },

    connectionChange: function(isConnected, wasConnected) {
        if (isConnected && !wasConnected && idle) {
            return LinksClientInternals.reportIdle(lastActivityTime);
        }
    },

    onWindowBlur: function() {
        focused = false;
        return monitor();
    },

    onWindowFocus: function() {
        focused = true;
        return monitor(true);
    },

    reportIdle: function(time) {
        return Meteor.call("user-status-idle", time);
    },

    reportActive: function(time) {
        return Meteor.call("user-status-active", time);
    }
};

start = function(settings) {
    var interval;
    if (!Ntp.isSynced()) {
        throw new Error("Can't start idle monitor until synced to server");
    }
    if (monitorId) {
        throw new Error("Idle monitor is already active. Stop it first.");
    }
    settings = settings || {};
    LinksClientInternals.idleThreshold = settings.threshold || 60000;
    interval = Math.max(settings.interval || 1000, 1000);
    LinksClientInternals.idleOnBlur = settings.idleOnBlur != null ? settings.idleOnBlur : false;
    monitorId = Meteor.setInterval(monitor, interval);
    monitorDep.changed();
    if (lastActivityTime == null) {
        lastActivityTime = Deps.nonreactive(function() {
            return Ntp.serverTime();
        });
        activityDep.changed();
    }
    monitor();
};

stop = function() {
    if (!monitorId) {
        throw new Error("Idle monitor is not running.");
    }
    Meteor.clearInterval(monitorId);
    monitorId = null;
    lastActivityTime = void 0;
    monitorDep.changed();
    if (idle) {
        idle = false;
        idleDep.changed();
        LinksClientInternals.reportActive(Deps.nonreactive(function() {
            return Ntp.serverTime();
        }));
    }
};

monitor = function(setAction) {
    var currentTime, newIdle;
    if (!monitorId) {
        return;
    }
    currentTime = Deps.nonreactive(function() {
        return Ntp.serverTime();
    });
    if (currentTime == null) {
        return;
    }
    if (setAction && (focused || !LinksClientInternals.idleOnBlur)) {
        lastActivityTime = currentTime;
        activityDep.changed();
    }
    newIdle = LinksClientInternals.computeState(lastActivityTime, currentTime, focused);
    if (newIdle !== idle) {
        idle = newIdle;
        idleDep.changed();
    }
};

touch = function() {
    if (!monitorId) {
        Meteor._debug("Cannot touch as idle monitor is not running.");
        return;
    }
    return monitor(true);
};

isIdle = function() {
    idleDep.depend();
    return idle;
};

isMonitoring = function() {
    monitorDep.depend();
    return monitorId != null;
};

lastActivity = function() {
    if (!isMonitoring()) {
        return;
    }
    activityDep.depend();
    return lastActivityTime;
};

Meteor.startup(function() {
    var wasConnected;
    $(window).on("click keydown", function() {
        return monitor(true);
    });
    $(window).blur(LinksClientInternals.onWindowBlur);
    $(window).focus(LinksClientInternals.onWindowFocus);
    focused = document.hasFocus();
    Tracker.autorun(function() {
        if (!isMonitoring()) {
            return;
        }
        if (isIdle()) {
            LinksClientInternals.reportIdle(lastActivityTime);
        } else {
            LinksClientInternals.reportActive(lastActivityTime);
        }
    });
    wasConnected = Meteor.status().connected;
    return Tracker.autorun(function() {
        var connected;
        connected = Meteor.status().connected;
        LinksClientInternals.connectionChange(connected, wasConnected);
        wasConnected = connected;
    });
});

Links = {
    startMonitor: start,
    stopMonitor: stop,
    pingMonitor: touch,
    isIdle: isIdle,
    isMonitoring: isMonitoring,
    lastActivity: lastActivity
};