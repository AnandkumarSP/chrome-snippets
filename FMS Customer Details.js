function getdetails(phone, acc, accArr) {
  return fetch("https://fms.bsnl.in/customerprofile_n", {
    "headers": {
      "accept": "text/plain, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest"
    },
    "referrer": "http://fms.bsnl.in/Workspace.jsp",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": `phoneNo=${phone}&bbuserId=&searchType=PHONE&userName=krbdheeran_tnslm`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  })
  .then(x => x.json()).then(x => {
    acc[phone] = {
      address: x.address,
      bbPlan: x.bbPlan,
      billCycle: x.billCycle,
      billingAccNo: x.billingAccNo,
      customerAccNo: x.customerAccNo,
      llInstallDate: x.llInstallDate,
      servieOperStatus: x.servieOperStatus,
      phoneNo: x.phoneNo,
      mobileNo: x.mobileNo,
      osAmount: x.osAmount,
      billingAccNo: x.billingAccNo,
      exchangeCode: x.exchangeCode,
      mtceFrCode: x.mtceFrCode,
      eMail: x.eMail,
      customerName: x.customerName
    };
    accArr.push(acc[phone]);
  })
  .then(_ => acc[phone]);
}

info = {};
infoArr = [];
function strToCsvData(str) {
  str = /,/.test(str) ? `"${str}"` : str;
  str = /^\s*\d+(e\d+)?(\.\d+)?\s*$/i.test(str) ? `="${str}"` : str;
  return str;
}

Promise.all(['04286-299088']
              .map(phone => getdetails(phone, info, infoArr)))
  .then(values => {
    console.log('All values in order: ', values);
    console.log(info);
  })
  .then(_ => {
    var headers = ['customerName', 'phoneNo', 'mobileNo', 'llInstallDate', 'address', 'billingAccNo', 'customerAccNo'];
    var values = infoArr.map(x => headers.map(h => x[h]).map(i => strToCsvData(i)));
    values.unshift(headers);

    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([values.map(row => row.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = document.title.replace(/[^a-zA-Z0-1]/g, ' ').replace(/\s+/g, ' ') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
