/* ДЗ 2 - работа с массивами и объектами */

/*
 Задание 1:

 Напишите аналог встроенного метода forEach для работы с массивами
 Посмотрите как работает forEach и повторите это поведение для массива, который будет передан в параметре array
 */
function forEach(array, fn, thisArg = null) {
    for (let i = 0; i < array.length; i++) {
        fn.call(thisArg, array[i], i, array);
    }
}

/*
 Задание 2:

 Напишите аналог встроенного метода map для работы с массивами
 Посмотрите как работает map и повторите это поведение для массива, который будет передан в параметре array
 */
function map(array, fn, thisArg = null) {
    let copyArr = [];

    for (let i = 0; i < array.length; i++) {
        copyArr[i] = fn.call(thisArg, array[i], i, array);
    }

    return copyArr;
}

/*
 Задание 3:

 Напишите аналог встроенного метода reduce для работы с массивами
 Посмотрите как работает reduce и повторите это поведение для массива, который будет передан в параметре array
 */
function reduce(array, fn, initial) {
    let result, index;

    if (!initial) {
        index = 1;
        result = array[0];
    } else {
        index = 0;
        result = initial;
    }
    for (index; index < array.length; index++) {
        result = fn(result, array[index], index, array);
    }

    return result;
}

/*
 Задание 4:

 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистр и вернуть в виде массива

 Пример:
   upperProps({ name: 'Сергей', lastName: 'Петров' }) вернет ['NAME', 'LASTNAME']
 */
function upperProps(obj) {
    let propsArr = [];

    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            propsArr.push(prop.toUpperCase());
        }

    }

    return propsArr;
}

/*
 Задание 5 *:

 Напишите аналог встроенного метода slice для работы с массивами
 Посмотрите как работает slice и повторите это поведение для массива, который будет передан в параметре array
 */
function slice(array, from, to) {
    let newArr = [];

    if (from === undefined) {
        from = 0;
    }
    if (to === undefined) {
        to = array.length;
    }
    if (from > array.length) {
        return newArr;
    }
    if (from < 0) {
        from = array.length + from;
        if (from < 0) {
            from = 0;
        }
    }
    if (to < 0) {
        to = array.length + to;
    }
    if (to > array.length) {
        to = array.length;
    }
    for (let i = from; i < to; i++) {
        newArr.push(array[i]);
    }

    return newArr;
}

/*
 Задание 6 *:

 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
    return new Proxy(obj, {
        set(target, prop, val) {
            if (typeof val === 'number') {
                target[prop] = val ** 2;

                return true;
            }

            return false;
        }
    })
}

export {
    forEach,
    map,
    reduce,
    upperProps,
    slice,
    createProxy
};