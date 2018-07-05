export default class RouteDistance {
    constructor () {
        this._fromCity = false;
        this._cityDistance = 0;
        this._regionDistance = 0;
    }

    get FromCity() {
        return this._fromCity;
    }

    set FromCity(value) {
        this._fromCity = value;
    }

    get CityDistance() {
        return this._cityDistance;
    }

    set CityDistance(value) {
        this._cityDistance = value;
    }

    get RegionDistance() {
        return this._regionDistance;
    }

    set RegionDistance(value) {
        this._regionDistance = value;
    }
}