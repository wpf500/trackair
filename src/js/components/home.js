import Ractive from 'ractivejs/ractive'
import reqwest from 'ded/reqwest'

import donut from './donut'

import template from './templates/home.html!text'
import challengeTemplate from './templates/homeChallenges.html!text'

const URL = 'http://interactive.guim.co.uk/spreadsheetdata/12QPaqFe27ZlNIWiSdnuYEY-ukQWQshOh_PH-TXaYSNs.json';

export default class Home {
    constructor(el) {
        el.innerHTML = template;

        var ractive = new Ractive({
            'el': '#challenges',
            'template': challengeTemplate,
            'data': {
                'r': function (r) { return Math.floor(Math.random() * 20); }
            }
        });

        reqwest({
            'url': URL,
            'type': 'json',
            'crossOrigin': true,
            'success': data => {
                ractive.set('challenges', data.sheets.challenges);
                donut();
            }
        });

    }
}
