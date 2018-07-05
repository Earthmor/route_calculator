import RouteTotals from './models/route_totals.js';
import RouteDistance from "./models/route_distance.js";

const cityCenter = '53.705,91.699';
const nightlyFee = 500;
const overtimeFee = 400;
const rates = [
    [1000, 40],
    [1200, 45]
];
const regionGivingFee = [200, 300, 500, 1000];

export default class RouteCalculator {
    constructor () {}

    /**
     * Calculate route
     * @param {Array} fromTo
     * @param cityGeometry
     * @param vehicleWeight
     * @param {Boolean} isNightlyRate
     * @returns {*}
     */
    totals (fromTo, cityGeometry, vehicleWeight, isNightlyRate) {
        let routeTotals = new RouteTotals();
        return new Promise((resolve, reject) => {
            try {
                let getRoutePromise = this.getYMapsRoute(fromTo),
                    getRouteFromPromise = this.getYMapsRoute([fromTo[0], cityCenter]),
                    getRouteToPromise = this.getYMapsRoute([fromTo[1], cityCenter]),
                    rate = rates[vehicleWeight];
                Promise.all([getRoutePromise, getRouteFromPromise, getRouteToPromise])
                    .then((routes) => {
                        let route = routes[0];
                        let routeDistances = this.calcDistances(route, cityGeometry),
                            srcToCenterDistances = this.calcDistances(routes[1], cityGeometry),
                            dstToCenterDistances = this.calcDistances(routes[2], cityGeometry),
                            path = route.getPaths().get(0),
                            maxRegionDistance = Math.max(srcToCenterDistances.RegionDistance, dstToCenterDistances.RegionDistance);
                        routeTotals.Time = route.getTime() / 60;
                        routeTotals.HumanTime = route.getHumanTime();
                        routeTotals.Length = route.getLength() / 1000;
                        routeTotals.DistanceFromCity = maxRegionDistance;

                        routeTotals.GivingFee = rate[0];

                        if (maxRegionDistance > 100) {
                            routeTotals.RegionGivingFee = regionGivingFee[3];
                        } else if (maxRegionDistance > 50) {
                            routeTotals.RegionGivingFee = regionGivingFee[2];
                        } else if (maxRegionDistance > 20) {
                            routeTotals.RegionGivingFee = regionGivingFee[1];
                        } else if (maxRegionDistance > 0) {
                            routeTotals.RegionGivingFee = regionGivingFee[0];
                        }

                        if (routeDistances.RegionDistance > 20) {
                            routeTotals.ExtraDistance = (routeDistances.RegionDistance - 20);
                            routeTotals.Fee = rate[1];
                        }

                        if (isNightlyRate) {
                            routeTotals.NightlyFee = nightlyFee;
                        }

                        routeTotals.Price = routeTotals.GivingFee + routeTotals.RegionGivingFee + routeTotals.NightlyFee + routeTotals.ExtraDistance * routeTotals.Fee;
                        resolve([route, routeTotals]);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    getYMapsRoute (fromTo) {
        return new Promise((resolve) => {
            ymaps.route(fromTo).then((route) => resolve(route));
        });
    }

    calcDistances (route, cityGeometry) {
        let path = route.getPaths().get(0),
            segments = path ? path.getSegments() : [],
            distance = new RouteDistance();

        if (!path) return false;

        for (let s = 0, segmentCount = segments.length; s < segmentCount; s++) {
            let segment = segments[s], coordinates = segment.getCoordinates();

            if (s === 0 && cityGeometry.contains(coordinates[0])) {
                distance.FromCity = true;
            }
            if (cityGeometry.contains(coordinates[0]) && cityGeometry.contains(coordinates[coordinates.length - 1])) {
                distance.CityDistance += segment.getLength();   // segment is inside border
            } else if (!cityGeometry.contains(coordinates[0]) && !cityGeometry.contains(coordinates[coordinates.length - 1])) {
                distance.RegionDistance += segment.getLength();	// segment is outside border
            } else {
                let tmpRegionLength = 0;
                if (cityGeometry.contains(coordinates[0])) {    // segment is partially inside/outside border
                    coordinates = coordinates.reverse();
                }
                for (let c = 0, coordinateCount = coordinates.length; c < coordinateCount; c++) {
                    if (c > 0) {
                        tmpRegionLength += ymaps.coordSystem.geo.getDistance(coordinates[c - 1], coordinates[c]);
                    }
                    if (cityGeometry.contains(coordinates[c])) {
                        distance.RegionDistance += tmpRegionLength;
                        distance.CityDistance += segment.getLength() - tmpRegionLength;
                        break;
                    }
                }
            }
        }

        distance.CityDistance /= 1000;
        distance.RegionDistance /= 1000;

        return distance;
    }
}