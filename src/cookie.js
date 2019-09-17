/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

filterNameInput.addEventListener('keyup', () => {
    // здесь можно обработать нажатия на клавиши внутри текстового поля для фильтрации cookie
    renderCookies(getCookies());
});

addButton.addEventListener('click', () => {
    // здесь можно обработать нажатие на кнопку "добавить cookie"
    if (!addNameInput.value && !addValueInput.value) {
        return alert('Все поля должны быть заполнены');
    }

    document.cookie = `${addNameInput.value}=${addValueInput.value}`;

    renderCookies(getCookies());

    addNameInput.value = '';
    addValueInput.value = '';
});

document.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addButton.click();
    }
});

document.addEventListener('DOMContentLoaded', () => {

    renderCookies(getCookies());
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('cookie__delete')) {
        const cookieRow = event.target.closest('.cookie__row');
        const cookieName = cookieRow.querySelector('.cookie__name').textContent;

        document.cookie = `${cookieName}=; max-age=0;`;

        renderCookies(getCookies());
    }
});

function renderCookies(cookies) {
    listTable.innerHTML = '';

    let list = new DocumentFragment();

    for (const cookie in cookies) {
        if (cookies.hasOwnProperty(cookie)) {
            list.appendChild(createCookieItem(cookie, cookies))
        }
    }

    listTable.appendChild(list);
}

function getCookies() {
    let filterStr = filterNameInput.value;

    if (filterStr.length) {
        return document.cookie.split('; ').reduce((prev, current) => {
            const [name, value] = current.split('=');

            if (name.includes(filterStr) || value.includes(filterStr)) {
                prev[name] = value;

                return prev;

            }
            
            return prev
        }, {});
    }
    
    return document.cookie.split('; ').reduce((prev, current) => {
        const [name, value] = current.split('=');

        prev[name] = value;

        return prev
    }, {});
}

function createCookieItem(prop, obj) {
    const rowNode = createElement('tr', 'cookie__row');
    const nameNode = createElement('td', 'cookie__name', prop);
    const valueNode = createElement('td', 'cookie__value', obj[prop]);
    const buttonNode = createElement('td', 'cookie__btn');
    const buttonElement = createElement('button', 'cookie__delete', 'Удалить');

    buttonNode.appendChild(buttonElement);

    rowNode.appendChild(nameNode);
    rowNode.appendChild(valueNode);
    rowNode.appendChild(buttonNode);

    return rowNode;
}

function createElement(elementTag, elementClass, elementText) {
    let element = document.createElement(elementTag);

    if (elementClass) {
        element.classList.add(elementClass);
    }

    if (elementText) {
        element.textContent = elementText;
    }

    return element;
}