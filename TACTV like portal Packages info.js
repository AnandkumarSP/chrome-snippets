// Tested with https://sms.tccl.co.in
const packagesList = Array.from($$('table .edit_service_search_1 tr')).map(x => ({
    name: x.querySelector('td:nth-child(4) span').innerText,
    id: x.querySelector('td:nth-child(4) input').value,
    price: parseFloat(x.querySelector('td:nth-child(5) label').innerText)
}));

console.log(packagesList);
