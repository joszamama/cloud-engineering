import * as service from "../services/DashboardService.js"

export function getDashboard ( req, res ) {
  service.getDashboard( req, res );
}