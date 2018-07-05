export default class RouteTotals {
    constructor () {
        this._time = 0;
        this._extraDistance = 0;
        this._distanceFromCity = 0;
        this._price = 0;
        this._givingFee = 0;
        this._regionGivingFee = 0;
        this._fee = 0;
        this._nightlyFee = 0;
        this._humanTime = 0;
        this._length = 0;
    }

    get Time() {
        return this._time;
    }

    set Time(value) {
        this._time = value;
    }

    get ExtraDistance() {
        return this._extraDistance;
    }

    set ExtraDistance(value) {
        this._extraDistance = value;
    }

    get Price() {
        return this._price;
    }

    set Price(value) {
        this._price = value;
    }

    get GivingFee() {
        return this._givingFee;
    }

    set GivingFee(value) {
        this._givingFee = value;
    }

    get RegionGivingFee() {
        return this._regionGivingFee;
    }

    set RegionGivingFee(value) {
        this._regionGivingFee = value;
    }

    get Fee() {
        return this._fee;
    }

    set Fee(value) {
        this._fee = value;
    }

    get NightlyFee() {
        return this._nightlyFee;
    }

    set NightlyFee(value) {
        this._nightlyFee = value;
    }

    get DistanceFromCity() {
        return this._distanceFromCity;
    }

    set DistanceFromCity(value) {
        this._distanceFromCity = value;
    }

    get HumanTime() {
        return this._humanTime;
    }

    set HumanTime(value) {
        this._humanTime = value;
    }

    get Length() {
        return this._length;
    }

    set Length(value) {
        this._length = value;
    }
}