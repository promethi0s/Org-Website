WebApp.rawConnectHandlers.use("/_timesync",
    function(req, res) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", 0);
        res.setHeader("Content-Type", "text/plain");
        res.end(Date.now().toString());
    }
);