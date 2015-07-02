import Ractive from 'ractivejs/ractive'
import reqwest from 'ded/reqwest'
import moment from 'moment/moment'
import humanize from 'taijinlee/humanize'

import donut from './donut'

import template from './templates/activity.html!text'
import statsTemplate from './templates/activityStats.html!text'
import emissions from '../emission_levels.json!json'

console.log(emissions);

function rad(d) {
    return d * Math.PI / 180;
}

function distance(a, b) {
    var R = 6371000; // metres
    var φ1 = rad(a.lat);
    var φ2 = rad(b.lat);
    var Δφ = rad(b.lat - a.lat);
    var Δλ = rad(b.lng - a.lng);

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

var callbackI = 0;

function lookup(v) {
    if (v <= 33) return 1;
    if (v <= 67) return 2;
    if (v <= 100) return 3;
    if (v <= 120) return 4;
    if (v <= 140) return 5;
    if (v <= 160) return 6;
    if (v <= 187) return 7;
    if (v <= 213) return 8;
    if (v <= 240) return 9;
    return 10;
}

function kcl(a, type) {
    var cb = 'callback' + callbackI++;
    var url = 'http://webgis.erg.kcl.ac.uk/arcgis/rest/services/' + type + 'now/MapServer/identify?geometryType=esriGeometryPoint&geometry=' + a.lng + ',' + a.lat + '&sr&layers&time&layerTimeOptions&layerdefs&tolerance=1&mapExtent=-117.20,34.055,-117.19,34.06&imageDisplay=600,550,96&returnGeometry=false&maxAllowableOffset&f=pjson&callback=' + cb;
    var el = document.createElement('script');
    el.src = url;
    document.body.appendChild(el);

    return new Promise((resolve, reject) => {
        window[cb] = function (data) {
            a[type] = parseFloat(lookup(data.results[0].value));
            resolve();
        };
    });
}

function getData(a) {
    return Promise.all([kcl(a, 'NO2'), kcl(a, 'PM10'), kcl(a, 'PM25')]);
}

const modes = {
    'walk': {
        'img': 'glyphicons-563-person-walking',
        'color': '#FF0000',
        'factor': 1.0
    },
    'car': {
        'img': 'glyphicons-6-car',
        'color': '#FFFF00',
        'factor': 1.8
    },
    'cycle': {
        'img': 'glyphicons-307-bicycle',
        'color': '#FFFF00',
        'factor': 1.0
    },
    'bus': {
        'img': 'glyphicons-32-bus',
        'color': '#00FF00',
        'factor': 1.5
    },
    'train': {
        'img': 'glyphicons-565-underground',
        'color': '#0000FF',
        'factor': 3.9
    }
};

export default class Activity {
    constructor(el) {
        el.innerHTML = template;

        var journey = [
            {'lat': 51.526047, 'lng': -0.074587, 'mode': 'walk', 'time': 300},
            {'lat': 51.526475, 'lng': -0.077505, 'mode': 'bus', 'time': 900},
            {'lat': 51.523377, 'lng': -0.077505, 'mode': 'train', 'time': 840},
            {'lat': 51.540143, 'lng': -0.096216}
        ];

        Promise.all(journey.map(j => getData(j))).then(() => {
        var ractive = new Ractive({
            'el': '#stats',
            'template': statsTemplate,
            'data': {
                'journey': journey,
                'formatTime': function (time) {
                    return Math.round(time / 60);
                },
                'formatDistance': function (distance) {
                    return Math.round(distance * 0.000621 * 100) / 100;
                }
            },
            'computed': {
                'total': function () {
                    return this.get('journey').reduce((d, j) => d + j.distance, 0);
                },
                'NO2': function () {
                    return Math.round(this.get('journey').reduce((d, j) => d + j.NO2, 0));
                },
                'PM10': function () {
                    return Math.round(this.get('journey').reduce((d, j) => d + j.PM10, 0));
                },
                'PM25': function () {
                    return Math.round(this.get('journey').reduce((d, j) => d + j.PM25, 0));
                },
                'O3': function () {
                    return Math.round(this.get('journey').reduce((d, j) => d + j.O3, 0));
                },
                'SO2': function () {
                    return Math.round(this.get('journey').reduce((d, j) => d + j.SO2, 0));
                },
                'exposure': function () {
                    return Math.round(this.get('journey').reduce((d, j) => d + j.exposure, 0));
                },
                'emissions': function () {
                    return Math.round(this.get('journey').reduce((d, j) => d + j.emissions, 0));
                }
            }
        });

        var distances = [];
        for (var i = 0; i < journey.length - 2; i++) {
            distances.push(distance(journey[i], journey[i+1]));
        }


        var total = distances.reduce((a, b) => a + b);

        var map = new google.maps.Map(el.querySelector('#map'), {
            'center': {'lat': 51.539609, 'lng': -0.099821},
            'zoom': 14
        });

        journey.reduce((a, b) => {
            new google.maps.Polyline({
                'map': map,
                'path': [a, b],
                'strokeColor': modes[a.mode].color
            });

            a.SO2 = 5;
            a.O3 = 5;
            b.SO2 = 5;
            b.O3 = 5;

            a.m = modes[a.mode];
            b.m = modes[b.mode];
            a.distance = distance(a, b);

            a.exposure = a.time * a.m.factor * a.NO2;
            a.emissions = a.distance * (a.NO2 + a.PM25 + a.PM10) / 3;

            b.distance = 0;
            b.exposure = 0;
            b.emissions = 0;
            return b;
        });

        var start = new google.maps.Marker({
            'map': map,
            'position': journey[0]
        });

        var end = new google.maps.Marker({
            'map': map,
            'position': journey.slice(-1)[0]
        });

        ractive.update('journey');
        donut();

        $('#chart').highcharts({
            chart: {
                type: 'area',
                spacing: [10, 0, 0, 0]
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7'],
                tckmarkPlacement: 'on',
                title: {
                    text: 'Miles'
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    enabled: false
                }
            },
            tooltip: {
                shared: true,
                valueSuffix: ' none'
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'Exposure',
                data: [2, 2.5, 4, 4.2, 5, 19, 22, 24.0, 24.6, 24.7, 24.8, 25, 25]
            }, {
                name: 'Emissions',
                data: [0, 0, 0, 0, 0, 0, 10, 15, 17, 19, 20, 20.5, 21]
            }]
        });

        });
    }
}
