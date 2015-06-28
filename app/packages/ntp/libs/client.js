Date.now = Date.now || function() { return +new Date; };

Ntp = {
    loggingEnabled: true
};

function log(/* arguments */) {
    if (Ntp.loggingEnabled) {
        Meteor._debug.apply(this, arguments);
    }
}

var syncInterval = 1000;

NtpInternals = {
    offset: undefined,
    roundTripTime: undefined,
    offsetDep: new Tracker.Dependency(),
    timeTick: {},
    timeCheck: function (lastTime, currentTime, interval, tolerance) {
        if (Math.abs(currentTime - lastTime - interval) < tolerance) {
            return true;
        }
        return false;
    }
};

NtpInternals.timeTick[syncInterval] = new Tracker.Dependency();

var maxAttempts = 5;
var attempts = 0;

var updateOffset = function() {
    var t0;
    t0 = Date.now();
    HTTP.get("/_timesync", function(err, response) {
        var t3 = Date.now();
        if (err) {
            log("Error syncing to server time: ", err);
            if (++attempts <= maxAttempts)
                Meteor.setTimeout(Ntp.resync, 1000);
            else
                log("Max number of time sync attempts reached. Giving up.");
            return;
        }
        attempts = 0; // It worked
        var ts = parseInt(response.content);
        NtpInternals.offset = Math.round(((ts - t0) + (ts - t3)) / 2);
        NtpInternals.roundTripTime = t3 - t0;
        NtpInternals.offsetDep.changed();
    });
};

Ntp.serverTime = function(clientTime, interval) {
    check(interval, Match.Optional(Match.Integer));
    if ( !Ntp.isSynced() ) return undefined;
    if ( !clientTime ) getTickDependency(interval || syncInterval).depend();
    return (+clientTime || Date.now()) + NtpInternals.offset;
};

Ntp.serverOffset = function() {
    NtpInternals.offsetDep.depend();
    return NtpInternals.offset;
};

Ntp.roundTripTime = function() {
    NtpInternals.offsetDep.depend();
    return NtpInternals.roundTripTime;
};

Ntp.isSynced = function() {
    NtpInternals.offsetDep.depend();
    return NtpInternals.offset !== undefined;
};

var resyncIntervalId = null;

Ntp.resync = function() {
    if (resyncIntervalId !== null) Meteor.clearInterval(resyncIntervalId);
    updateOffset();
    resyncIntervalId = Meteor.setInterval(updateOffset, 600000);
};

var wasConnected = false;

Tracker.autorun(function() {
    var connected = Meteor.status().connected;
    if ( connected && !wasConnected ) Ntp.resync();
    wasConnected = connected;
});

var tickCheckTolerance = 5000;
var lastClientTime = Date.now();

function getTickDependency(interval) {
    if ( !NtpInternals.timeTick[interval] ) {
        var dep = new Deps.Dependency();
        Meteor.setInterval(function() {
            dep.changed();
        }, interval);
        NtpInternals.timeTick[interval] = dep;
    }
    return NtpInternals.timeTick[interval];
}

Meteor.setInterval(function() {
    var currentClientTime = Date.now();

    if ( NtpInternals.timeCheck(
            lastClientTime, currentClientTime, syncInterval, tickCheckTolerance) ) {
        NtpInternals.timeTick[syncInterval].changed();
    } else {
        log("Clock discrepancy detected. Attempting re-sync.");
        NtpInternals.offset = undefined;
        NtpInternals.offsetDep.changed();
        Ntp.resync();
    }

    lastClientTime = currentClientTime;
}, syncInterval);