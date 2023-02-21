import Dashboard from "../models/Dashboard.js";

export function getDashboard(_req, res) {
    Dashboard.find({}).then((dashboard) => {
        res.send(dashboard);
    }).catch((err) => {
        res.status(500).send({
            message: err.message
        });
    });
}

// setInterval(async () => {
//     const appMetrics = await Dashboard.getApplicationMetrics();
//     const priceMetrics = await Dashboard.getPriceMetrics();
//     const tripMetrics = await Dashboard.getTripMetrics();

//     console.log(tripMetrics);
// }, 1000);