import * as service from "../services/DashboardService.js"

export function getDashboard ( req, res ) {
  service.getDashboard( req, res );
}

/* Compute dashboards periodically */
// setInterval(async () => {
//     const appMetrics = await Dashboard.getApplicationMetrics();
//     const priceMetrics = await Dashboard.getPriceMetrics();
//     const tripMetrics = await Dashboard.getTripMetrics();

//     console.log(tripMetrics);
// }, 1000);