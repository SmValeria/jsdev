import {loadAndSortTowns}  from './index'
/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns-content.hbs

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');

/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */
function loadTowns() {
    return loadAndSortTowns();
}

/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
    return full.toLowerCase().includes(chunk.toLowerCase())
}

/* Блок с надписью "Загрузка" */
const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с текстовым полем и результатом поиска */
const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');
/* Блок, который будет показан в случае ошибки сервера */
let badRequestNode = document.createElement('div');
const textNode = document.createElement('p');
textNode.textContent = 'Не удалось загрузить города';
const  buttonNode = document.createElement('button');
buttonNode.textContent = 'Повторить';
badRequestNode.appendChild(textNode);
badRequestNode.appendChild(buttonNode);

let filteredTowns = [];
let loadedTowns = [];

filterInput.addEventListener('keyup', function(event) {
    // это обработчик нажатия кливиш в текстовом поле

    filterResult.innerHTML = '';
    filteredTowns = [];

    if(filterInput.value.length > 0) {
        let str = filterInput.value;
        filteredTowns = loadedTowns.filter((town)=>{
            return isMatching(town.name, str)
        });
        renderList(filteredTowns);
    }
});


function renderList(arr) {

    let list = document.createDocumentFragment();

    for(const item of arr) {
        const p = document.createElement('p');
        p.textContent = item.name;
        list.appendChild(p);
    }

    filterResult.appendChild(list);
}

async function fetchTownsAndRerenderPage() {
    try {
        loadedTowns = await loadTowns();
        loadingBlock.style.display = 'none';
        filterBlock.style.display = 'block';
    } catch (e) {
        loadingBlock.style.display = 'none';
        homeworkContainer.appendChild(badRequestNode);
    }
}

document.addEventListener('DOMContentLoaded', async ()=>{
    await fetchTownsAndRerenderPage();
});
buttonNode.addEventListener('click', async ()=>{
    homeworkContainer.removeChild(badRequestNode);
    loadingBlock.style.display = 'block';
    await fetchTownsAndRerenderPage();
});


export {
    loadTowns,
    isMatching
};
