import reviewBlockTemplate from "./reviewBlock.hbs";
import reviewListTemplate from "./commentsBlock.hbs";

import getDate from "./helpers/getDate";
import getDataFromLocalStorage from "./helpers/getDataFromLocalStorage";
import clearForm from "./helpers/clearForm";
import validateForm from "./helpers/validateForm"

export class Map {
  constructor(selector, options, optionSettings) {

    this.points = [];
    this.reviewsArray = [];
    this.currentPoint = {
      address: '',
      comment: {},
      coords: ''
    };

    this.wrapper = document.querySelector('.wrapper');
    this.reviewBlock = document.querySelector('#review-block');

    ymaps.ready(() => {
      this.init(selector, options);

      if (optionSettings) {
        this.setOptionSettings(optionSettings);
      }
    });
  }

  init(selector, options) {
    this.map = new ymaps.Map(selector, options);
    this.createClusterer();
    this.initPlaceMarks();
    this.map.geoObjects.add(this.clusterer);
    this.addEvents();
  }

  setOptionSettings(settingsArray) {
    for (const settingName in settingsArray) {
      if (settingsArray.hasOwnProperty(settingName)) {
        this.map.controls.add(settingName, settingsArray[settingName]);
      }
    }
  }

  createClusterer() {
    const clustererItemContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div class=cluster>' +
        '<h2 class=cluster__header>{{ properties.balloonContentHeader|raw }}</h2>' +
        '<div class=cluster__body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=cluster__footer>{{ properties.balloonContentFooter|raw }}</div>' +
        '</div>'
    );
    return this.clusterer = new ymaps.Clusterer({
      preset: 'islands#invertedVioletClusterIcons',
      clusterDisableClickZoom: true,
      openBalloonOnClick: true,
      clusterBalloonContentLayout: 'cluster#balloonCarousel',
      clusterBalloonItemContentLayout: clustererItemContentLayout,
      clusterBalloonPanelMaxMapArea: 0,
      clusterBalloonContentLayoutWidth: 300,
      clusterBalloonContentLayoutHeight: 200,
      clusterBalloonPagerSize: 5
    });
  }

  addEvents() {
    this.map.events.add('click', this.toggleReviewBlock.bind(this));
    this.map.geoObjects.events.add('click', this.placeMarkClick.bind(this));
    document.addEventListener('click', this.handleClickOnDocument.bind(this));
  }

  async handleClickOnDocument(event) {
    if (event.target && event.target.closest('.review__close')) {
      this.closeReviewBlock();
    }

    if (event.target && event.target.closest('.form__btn')) {
      event.preventDefault();
      const form = this.reviewBlock.querySelector('.form');
      if (validateForm(form)) {
        this.currentPoint.comment = {...this.getReviewData(form)};
        clearForm(form);
        this.renderReview(this.currentPoint.comment);
        this.createPlaceMark(this.currentPoint);
        const newPoint = {...this.currentPoint};
        this.points.push(newPoint);
        localStorage.setItem('points', JSON.stringify(this.points));
        this.currentPoint.comment = {};
      }
    }
    if (event.target && event.target.dataset.coords) {
      this.map.balloon.close();
      const position = [];
      position.push(event.pageX, event.pageY);

      this.currentPoint.coords = event.target.dataset.coords.split(',');
      this.findAllReviewsAndSetCurrentAddress();
      this.openReviewBlock(position);
      this.renderReview(...this.reviewsArray);
    }
  }

  placeMarkClick(event) {
    if (!event.get('target')._clusterListeners) {
      if (this.map.balloon.isOpen()) {
        this.map.balloon.close();
      }
      event.preventDefault();

      const object = event.get('target');

      this.currentPoint.coords = this.object.geometry.getCoordinates();
      const position = event.get('position');

      this.findAllReviewsAndSetCurrentAddress();
      this.openReviewBlock(position);
      this.renderReview(...this.reviewsArray);
    }
  }

  getReviewData(form) {
    const name = form.elements.name.value;
    const address = form.elements.place.value;
    const comment = form.elements.comment.value;
    const date = getDate();

    return {
      author: name,
      place: address,
      text: comment,
      time: date
    };
  }

  renderReview(...array) {
    const reviewList = this.reviewBlock.querySelector('.review__list');
    if (reviewList.children.length === 0) {
      reviewList.innerHTML = '';
    }
    let reviewsStr = '';

    array.forEach((item) => {
      reviewsStr += reviewListTemplate(item);

    });
    reviewList.insertAdjacentHTML('beforeend', reviewsStr);
    this.reviewsArray = [];
  }

  async toggleReviewBlock(event) {
    if (this.reviewBlock.classList.contains('active')) {
      this.closeReviewBlock();
      return;
    }

    try {
      const position = event.get('position');
      this.currentPoint.coords = event.get('coords');
      this.currentPoint.address = await this.getAddressString(this.currentPoint.coords);

      this.openReviewBlock(position);
    } catch (e) {
      console.log('упсс......что-то пошло не так')
    }
  }


  async getAddressString(coords) {
    const response = await ymaps.geocode(coords);
    const geoObject = await response.geoObjects.get(0);
    return geoObject.properties.get('text');
  }

  setPositionOfReviewBlock([x, y]) {
    const reviewContent = this.wrapper.querySelector('.review');

    this.wrapper.top = 0;
    this.wrapper.left = 0;
    this.wrapper.right = this.wrapper.getBoundingClientRect().right;
    this.wrapper.bottom = this.wrapper.getBoundingClientRect().bottom;

    reviewContent.width = reviewContent.getBoundingClientRect().width;
    reviewContent.height = reviewContent.getBoundingClientRect().height;

    let left = x - reviewContent.width / 2;
    let top = y;
    let xDiff = 0;
    let yDiff = 0;

    if (x + reviewContent.width / 2 > this.wrapper.right) {
      xDiff = x + reviewContent.width / 2 - this.wrapper.right;
      left = this.wrapper.right - reviewContent.width;
    }
    if (x - reviewContent.width / 2 < this.wrapper.left) {
      xDiff = x - reviewContent.width / 2;
      left = this.wrapper.left;
    }
    if (y + reviewContent.height > this.wrapper.bottom) {
      yDiff = y + reviewContent.height - this.wrapper.bottom;
      top = this.wrapper.bottom - reviewContent.height;
    }

    let position = this.map.getGlobalPixelCenter();
    this.map.setGlobalPixelCenter([position[0] + xDiff, position[1] + yDiff]);
    reviewContent.style.left = left + 'px';
    reviewContent.style.top = top + 'px';
  }

  findAllReviewsAndSetCurrentAddress() {
    const samePoint = this.points.filter((item) => {

      return (Number(item.coords[0]) === Number(this.currentPoint.coords[0]) &&
          Number(item.coords[1]) === Number(this.currentPoint.coords[1]));
    });
    this.currentPoint.address = samePoint[0].address;
    samePoint.forEach((item) => {
      this.reviewsArray.push(item.comment);
    });
  }

  createPlaceMark(point) {
    let placeMark = new ymaps.Placemark(point.coords, {
      balloonContentHeader: `<span>${point.address}</span>`,
      balloonContentBody: `<div>
                                        <a href='#' data-coords='${point.coords}' class='cluster__link'>
                                            ${point.address}
                                        </a>
                                    </div>
                                    <div class='cluster__comment'>${point.comment.text}</div>`,
      balloonContentFooter: `<div>${point.comment.time.full}</div>`
    }, {
      iconLayout: 'default#image',
    });

    this.clusterer.add(placeMark);
  }

  initPlaceMarks() {
    if (!getDataFromLocalStorage('points')) return;

    this.points = getDataFromLocalStorage('points');
    this.points.forEach((point) => {
      this.createPlaceMark(point);
    });
  }

  closeReviewBlock() {
    this.reviewBlock.innerHTML = '';
    this.reviewBlock.classList.remove('active');
    this.currentPoint = {};
  }

  openReviewBlock(position) {
    this.reviewBlock.classList.add('active');
    this.reviewBlock.innerHTML = reviewBlockTemplate(this.currentPoint);
    this.setPositionOfReviewBlock(position);
  }
}