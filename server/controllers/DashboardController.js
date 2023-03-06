import * as service from "../services/DashboardService.js"
import Dashboard from "../models/Dashboard.js";

export function getDashboard(req, res) {
  service.getDashboard(req, res);
}

/* Compute dashboards periodically every 30min */
setInterval(async () => {
  console.log("Computing dashboard...");

  const appMetrics = await Dashboard.getApplicationMetrics();
  const finderMetrics = await Dashboard.getFinderMetrics();
  const tripMetrics = await Dashboard.getTripMetrics();

  const { managedTrips, tripsApplications, tripsPrice } = tripMetrics[0];

  new Dashboard({
    trip_average: managedTrips[0].avg,
    trip_minium: managedTrips[0].min,
    trip_maximum: managedTrips[0].max,
    trip_deviation: managedTrips[0].std ?? 0,
    application_average: tripsApplications[0].avg,
    application_minium: tripsApplications[0].min,
    application_maximum: tripsApplications[0].max,
    application_deviation: tripsApplications[0].std ?? 0,
    trip_price_average: tripsPrice[0].avg,
    trip_price_minium: tripsPrice[0].min,
    trip_price_maximum: tripsPrice[0].max,
    trip_price_deviation: tripsPrice[0].std ?? 0,
    ratio_by_status: Object.fromEntries(appMetrics[0].ids.map((id, index) => ([id, appMetrics[0].ratios[index]]))),
    price_range_average: (() => { let { _id, ...rest } = finderMetrics[0].avgPriceStats[0]; return rest })(),
    top10_finder_keywords: finderMetrics[0].top10Keywords.map(({ _id, count }) => ({ keyword: _id, count }))
  }).save().then(() => console.log("Dashboard computed automatically!")).catch(err => console.log(`Could not compute dashboard: ${err}`));
}, 1800000);