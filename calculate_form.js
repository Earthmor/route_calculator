import RouteCalculator from './route_calculator.js';

export default class CalculateForm {
    constructor (options) {
        this.trafficBorder = options.hasOwnProperty('trafficBorder') ? options.trafficBorder : [];
        this.ymaps = ymaps;
        this.ymaps.ready(() => {
            this._init();
        });
        this.routeCalc = new RouteCalculator();
    }

    _init() {
        this.map = new this.ymaps.Map('map',
            {
                center: [53.707303,91.696818],
                zoom: 10,
                minZoom: 3,
                behaviors: ['default', 'scrollZoom']
            });
        this.trafficPolygon = new this.ymaps.Polygon(([this.trafficBorder]), {}, {
                editorDrawingCursor: "crosshair",
                editorMaxPoints: 1000,
                fill: false,
                strokeColor: '#00ff00',
                strokeWidth: 2
            });
        this.trafficControl = new this.ymaps.control.TrafficControl(
            {
                providerKey: 'traffic#actual',
                shown: false
            });
        this.trafficGeometry = this.trafficPolygon.geometry;
        this.mapCursor = undefined;
        this.lastRoute = undefined;
        this.searchTarget = false;
        this.srcPlacemark = undefined;
        this.dstPlacemark = undefined;
        this._bindEvents();
    }

    _bindEvents() {
        this._bindEventsMap();
        this._bindEventsButton();
    }

    _bindEventsMap() {
        this.map.controls
            .add(this.trafficControl, {left: 100, top: 5})
            .add('typeSelector', {right: 5, top: 5})
            .add('zoomControl', {left: 5, top: 40})
            .add('mapTools', {left: 35, top: 5});
        this.map.geoObjects.add(this.trafficPolygon);
        this.map.setBounds(this.trafficPolygon.geometry.getBounds());
        this.map.events.add('click', (e) => {
            let srcAddress = document.getElementById('srcAddress');
            let dstAddress = document.getElementById('dstAddress');
            let coords = e.get('coordPosition'), placemark;
            switch (this.searchTarget) {
                case 'src':
                    srcAddress.value = coords[0].toFixed(6) + ',' + coords[1].toFixed(6);

                    if (!this.srcPlacemark) {
                        this.srcPlacemark = new this.ymaps.Placemark([0, 0],
                            {
                                iconContent: '1'
                            },
                            {
                                preset: 'twirl#blueIcon'
                            });
                    }
                    placemark = this.srcPlacemark;
                    break;
                case 'dst':
                    dstAddress.value = coords[0].toFixed(6) + ',' + coords[1].toFixed(6);
                    if (!this.dstPlacemark) {
                        this.dstPlacemark = new this.ymaps.Placemark([0, 0],
                            {
                                iconContent: '2'
                            },
                            {
                                preset: 'twirl#blueIcon'
                            });
                    }
                    placemark = this.dstPlacemark;
                    break;
            }

            placemark.geometry.setCoordinates(coords);
            this.map.geoObjects.add(placemark);

            document.getElementById('map').classList.remove('active');
            document.getElementById('srcButton').classList.remove('ui-state-active');
            document.getElementById('dstButton').classList.remove('ui-state-active');
            document.getElementById('calcButton').click();
        });
    }

    _bindEventsButton () {
        let srcAddress = document.getElementById('srcAddress'),
            dstAddress = document.getElementById('dstAddress'),
            srcButton = document.getElementById('srcButton'),
            dstButton = document.getElementById('dstButton'),
            calcButton = document.getElementById('calcButton'),
            map = document.getElementById('map');
        [srcAddress, dstAddress].forEach(element => {
            element.addEventListener('keypress', (event) => {
                if (event.keyCode === 13) {
                    calcButton.click();
                }
            });
            element.addEventListener('focus', () => {
                this.searchTarget = false;
                if (this.mapCursor) {
                    this.mapCursor.remove();
                    this.mapCursor = undefined;
                }
                map.classList.remove('active');
                srcButton.classList.remove('ui-state-active');
                dstButton.classList.remove('ui-state-active');
            });
        });

        //$('#srcAddress, #dstAddress').suggestAddress();

        srcButton.addEventListener('click', (e) => {
            this.mapCursor = this.mapCursor || this.map.cursors.push('arrow');
            map.classList.add('active');
            srcButton.classList.add('ui-state-active');
            dstButton.classList.remove('ui-state-active');
            this.searchTarget = 'src';
        });

        dstButton.addEventListener('click', (e) => {
            this.mapCursor = this.mapCursor || this.map.cursors.push('arrow');
            map.classList.add('active');
            srcButton.classList.remove('ui-state-active');
            dstButton.classList.add('ui-state-active');
            this.searchTarget = 'dst';
        });

        calcButton.addEventListener('click', () => {
            let from = srcAddress.value,
                to = dstAddress.value;
            document.getElementById('calcResults').style.display = 'none';

            this.searchTarget = false;
            if (this.mapCursor) {
                this.mapCursor.remove();
                this.mapCursor = undefined;
            }

            if (this.lastRoute)    {
                this.map.geoObjects.remove(this.lastRoute);
            }

            this.routeCalc.totals(
                [from, to],
                this.trafficGeometry,
                document.getElementById('vehicleWeight').value,
                document.getElementById('nightRate').checked
            ).then((totals) => {
                let route = totals[0], routeTotals = totals[1];
                let path = route.getPaths().get(0);

                this.lastRoute = route;

                if (this.srcPlacemark) {
                    this.map.geoObjects.remove(this.srcPlacemark);
                }
                if (this.dstPlacemark) {
                    this.map.geoObjects.remove(this.dstPlacemark);
                }

                map.classList.remove('active');
                srcButton.classList.remove('ui-state-active');
                dstButton.classList.remove('ui-state-active');

                this.map.geoObjects.add(route);

                if (path && path.geometry) {
                    this.map.setBounds(path.geometry.getBounds());
                }
                this.showCalcResult(routeTotals);
            });
        });
    }

    /**
     *
     * @param {RouteTotals} routeTotals
     */
    showCalcResult (routeTotals) {
        try {
            document.getElementById('distance').innerHTML = routeTotals.Length.toFixed(2) + 'км';
            document.getElementById('distance-from-city').innerHTML = routeTotals.DistanceFromCity.toFixed(2) + 'км';
            document.getElementById('time').innerHTML = routeTotals.HumanTime;
            document.getElementById('givingFee').innerHTML = routeTotals.GivingFee + 'р.';
            document.getElementById('regionGivingFee').innerHTML = routeTotals.RegionGivingFee + 'р.';
            document.getElementById('kmFee').innerHTML = routeTotals.ExtraDistance.toFixed(2) + "x" + routeTotals.Fee;
            document.getElementById('nightlyFee').innerHTML = routeTotals.NightlyFee + 'р.';
            document.getElementById('total').innerHTML = Math.ceil(routeTotals.Price) + '';
            document.getElementById('calcResults').style.display = 'block';
        } catch (e) {
            throw new Error(e);
        }
    }
}