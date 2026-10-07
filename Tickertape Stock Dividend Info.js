async function getDividendInfo(stockCode) {
    const info = await fetch(`https://api.tickertape.in/stocks/corporates/dividends/${stockCode}?count=500&offset=0`).then(r => r.json()).then(r => r.data.past);
    let retval = [];
    const retvalObj = info.reduce((p, c) => {
        c.value = parseFloat(c.value);
        const exDateObj = new Date(c.exDate);
        const fyYear = getFYyear(exDateObj);
        p[fyYear] = p[fyYear] || { fy: fyYear, index: 0, dividendsInfo: [], dividends: '', noOfTimes: 0, total: 0 };
        p[fyYear].dividendsInfo.push({
            date: formatDate(new Date(exDateObj)),
            dividend: c.value,
            subType: c.subType
        });
        p[fyYear].noOfTimes++;
        p[fyYear].dividends = p[fyYear].dividendsInfo.map(v => `${v.dividend.toFixed(2)}`).join(', ');
        p[fyYear].total += c.value;
        p[fyYear].index = Object.keys(p).length;
        return p;
    }, {});

    Object.keys(retvalObj).forEach(k => retval[retvalObj[k].index] = retvalObj[k]);
    retval = retval.filter(v => v);
    retval.forEach(v => v.total = parseFloat(v.total.toFixed(2)));
    console.table(retval, ['fy', 'total', 'dividends', 'noOfTimes'])
}

function getFYyear(d) {
    const currYear = d.getFullYear();
    const currMonth = d.getMonth();
    const prevYear = currMonth < 3 ? currYear - 1 : currYear;
    const nextYear = currMonth > 2 ? currYear + 1 : currYear;
    return `FY${prevYear}-${nextYear}`;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0'); // Day with leading zero
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-based, so add 1)
  const year = date.getFullYear(); // Full year

  // Hours, minutes, and seconds with leading zeros
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Customize the format as desired
  return `${day}/${month}/${year}`;
}

if (location.origin === 'https://www.tickertape.in') {
    getDividendInfo(location.pathname.split('-').pop());
} else if (true || location.origin === 'https://www.screener.in') {
    const companyMatches = location.href.match(/www.screener.in\/company\/(\w+)\//) || ['', 'COALINDIA'];

    if (companyMatches && companyMatches[1]) {
        const companies = await (fetch(`https://api.tickertape.in/search?text=${companyMatches[1]}&types=stock,index,etf,mutualfund,smallcase,gold`).then(r => r.text()));
        console.log(companies);
    }
}

console.log(`Methods: getDividendInfo`);
