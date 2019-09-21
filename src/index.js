import 'normalize.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/js/all.min';
import './style.css';


class Map {
  constructor(selector, options) {
    this.selector = selector;
    this.options = options;
    ymaps.ready(() => {
      this.init(this.selector, this.options);
    });
  }

  init(selector, options) {
    const map = new ymaps.Map(selector, options);
  }

}

const mapOptions = {
  center: [55.76, 37.64],
  zoom: 7
};

let map = new Map('map', mapOptions);