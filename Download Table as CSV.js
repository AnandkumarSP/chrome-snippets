function strToCsvData(str) {
  str = /,/.test(str) ? `"${str}"` : str;
  str = /^\s*\d+(e\d+)?(\.\d+)?\s*$/i.test(str) ? `="${str}"` : str;
  return str;
}

function cleanUpStr(str, needCSVtype = false) {
  str = str.replace(/[^ -~]/g, '').replace(/\s+/, ' ').trim();
  if (needCSVtype) {
    str = strToCsvData(str);
  }
  return str;
}

function getData(el) {
  let retval = el.innerText;
  const tactvAddressLinks = Array.from(el.querySelectorAll('a[rel]:not([rel=""])') || []);
  if (tactvAddressLinks.length) {
    retval = tactvAddressLinks[0].getAttribute('rel').replace('Address | ', '').trim();
  }
  return cleanUpStr(retval, false);
}

function et(csvTable) {
  const allTables = document.querySelectorAll('table');
  csvTable = csvTable || allTables[allTables.length - 1];

  const headers = Array.from(csvTable.querySelectorAll('thead td')).map(td => getData(td));
  const values = Array.from(csvTable.querySelectorAll('tbody tr'))
    .map(tr => Array.from(tr.querySelectorAll('td'))
      .map(td => getData(td))
    );
  const valuesObj = values.map((row) => {
    return headers.reduce((obj, h, i) => {
      obj[h] = row[i];
      return obj;
    }, {});
  });

  const csvHeaders = headers.map(h => strToCsvData(h));
  const csvValues = values.map(row => row.map(r => strToCsvData(r)));
  csvValues.unshift(csvHeaders);
  const a = window.document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([csvValues.map(row => row.join(',')).join('\n')], { type: 'text/csv' }));
  a.download = document.title.replace(/[^a-zA-Z0-1]/g, ' ').replace(/\s+/g, ' ')
 + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
