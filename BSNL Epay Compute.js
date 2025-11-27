Array.from($$('table')[1].querySelectorAll('tr:not(:first-child) td:nth-child(2)')).reduce((a, v) => {
    a += parseInt(v.innerText);
    return a;
}, 0);