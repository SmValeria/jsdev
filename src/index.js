import 'normalize.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/js/all.min';
import './style.css';
import { Map } from './map';

const mapOptions = {
    center: [48.738968, 37.584351],
    zoom: 14,
    controls: []
};

const optionSettings = {
    'searchControl': {
        float: 'right',
        provider: 'yandex#search',
        size: 'small'
    },
    'zoomControl': {
        size: 'large'
    },
    'typeSelector': {
        float: 'left',
        size: 'small'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let map = new Map('map', mapOptions, optionSettings);
});
