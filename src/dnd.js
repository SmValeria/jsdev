/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');

homeworkContainer.style.width = '100vw';
homeworkContainer.style.height = '100vh';
document.body.style.margin = '0';

/*
 Функция должна создавать и возвращать новый div с классом draggable-div и случайными размерами/цветом/позицией
 Функция должна только создавать элемент и задвать ему случайные размер/позицию/цвет
 Функция НЕ должна добавлять элемент на страницу. На страницу элемент добавляется отдельно

 Пример:
   const newDiv = createDiv();
   homeworkContainer.appendChild(newDiv);
 */
function createDiv() {
    const div = document.createElement('div');

    div.classList.add('draggable-div');
    const divWidth = Math.floor(Math.random() * 100 + 30);
    const divHeight = Math.floor(Math.random() * 100 + 30);
    const divPosX = Math.floor(Math.random() * (document.documentElement.clientWidth - divWidth));
    const divPosY = Math.floor(Math.random() * (document.documentElement.clientHeight - divHeight));

    let divColor = Math.round(0xffffff * Math.random()).toString(16);

    if (divColor.length === 5) {
        divColor += '0';
    }

    div.style.backgroundColor = '#' + divColor;
    div.style.width = divWidth + 'px';
    div.style.height = divHeight + 'px';
    div.style.left = divPosX + 'px';
    div.style.top = divPosY + 'px';
    div.style.position = 'absolute';
    div.setAttribute('draggable', 'true');

    return div
}

/*
 Функция должна добавлять обработчики событий для перетаскивания элемента при помощи drag and drop

 Пример:
   const newDiv = createDiv();
   homeworkContainer.appendChild(newDiv);
   addListeners(newDiv);
 */
function addListeners(target) {
    return target
}

let addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function() {
    // создать новый div
    const div = createDiv();

    // добавить на страницу
    homeworkContainer.appendChild(div);
    // назначить обработчики событий мыши для реализации D&D
    addListeners(div);
    // можно не назначать обработчики событий каждому div в отдельности, а использовать делегирование
    // или использовать HTML5 D&D - https://www.html5rocks.com/ru/tutorials/dnd/basics/
});

let dragElem = null;

homeworkContainer.addEventListener('dragstart', function (event) {
    if (!event.target.classList.contains('draggable-div')) {
        return; 
    }
    dragElem = {
        elem: event.target,
        shiftX: event.clientX - event.target.getBoundingClientRect().left,
        shiftY: event.clientY - event.target.getBoundingClientRect().top
    };

    event.dataTransfer.setData('text', '');
    event.dataTransfer.dropEffect = 'move';
});
homeworkContainer.addEventListener('dragover', function (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
});
homeworkContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    dragElem.elem.style.left = event.clientX - dragElem.shiftX + 'px';
    dragElem.elem.style.top = event.clientY - dragElem.shiftY + 'px';
});

homeworkContainer.addEventListener('dragend', function () {
    dragElem = null;
});

export {
    createDiv
};
