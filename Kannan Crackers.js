function getInputObjects(getValue = false) {
    return $$('.row:not(.d-none) .v-list-item').reduce((acc, ele) => {
        acc[ele.querySelector('h3').innerText] = getValue ? parseInt(ele.querySelector('input').value || '0') : {
            value: parseInt(ele.querySelector('input').value || '0'),
            input: ele.querySelector('input'),
            decrement: Array.from(ele.querySelectorAll('button'))[0],
            increment: Array.from(ele.querySelectorAll('button'))[1],
        };
        return acc;
    }, {});
}

function loadValues(name, merge = false) {
    if (!name) return console.error(`Please specify a name to load.`);
    const savedValues = localStorage.getItem(name);

    if (savedValues) {
        const savedValuesObj = JSON.parse(savedValues);
        const objs = getInputObjects();
        const keys = Object.keys(objs);

        function getArrayForSize(size) {
            return Array(size).fill(1);
        }

        function clickButtonForTimes(button, times, itemName) {
            getArrayForSize(times).forEach(_ => button.dispatchEvent(new MouseEvent('click')));
        }
        console.log(objs, savedValuesObj);

        keys.forEach(k => {
            merge ? null : clickButtonForTimes(objs[k].decrement, objs[k].value, k);
            clickButtonForTimes(objs[k].increment, savedValuesObj[k], k);
        });
    }
}

function saveValues(name) {
    if (!name) return console.error(`Please specify a name to save.`);
    localStorage.setItem(name, JSON.stringify(getInputObjects(true)));
}

console.log('loadValues(name, merge), saveValues(name)');
console.log(Object.keys(localStorage));
