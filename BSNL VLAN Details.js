// function getdetails(phone) {
//     return fetch("http://117.247.44.144/mysmartportal/bsnlconnect7.0/ldap.php", {
//         "body": JSON.stringify({
//             ldapValue: phone
//         }),
//         "method": "POST",
//     }).then(x => x.json()).then(x => console.log(x));
// }

// info = {};
// function strToCsvData(str) {
//     str = /,/.test(str) ? `"${str}"` : str;
//     str = /^\s*\d+(e\d+)?(\.\d+)?\s*$/i.test(str) ? `="${str}"` : str;
//     return str;
// }

// // Promise.all(['04286-290899', '04286-290304', '04286-291897', '04286-291293', '04286-292855', '04286-292839', '04286-292287', '04286-299422', '04286-299381', '04286-299023', '04286-294904', '04286-293324', '04286-294576', '04286-281023', '04286-295942', '04286-295967', '04286-295337', '04286-233871', '04286-223419', '04286-229136', '04286-226337', '04286-295810', '04286-220288', '04286-255007', '04286-295421', '04286-295856', '04286-295568', '04286-295836', '04286-295560', '04286-295233', '04286-266233', '04286-285555', '04286-225970', '04286-229900', '04286-223446', '04286-224286', '04286-295289', '04286-220018', '04286-229967', '04286-295073', '04286-225955', '04286-295141', '04286-222376', '04286-220025', '04286-295469', '04286-295231', '04286-229054', '04286-295441', '04286-231269', '04286-295276', '04286-295769', '04286-227701', '04286-227800', '04286-222007', '04286-295636', '04286-295756', '04286-295329', '04286-295256', '04286-295058', '04286-230094', '04286-295316', '04286-295575', '04286-228652', '04286-230188', '04286-295583', '04286-220179', '04286-221572', '04286-233844', '04286-230502', '04286-295525', '04286-295094', '04286-295661', '04286-295705', '04286-295940', '04286-295330', '04286-295429', '04286-291645', '04286-295366', '04286-295129', '04286-295394', '04286-295603', '04286-295226', '04286-224838', '04286-295137', '04286-222552', '04286-224346', '04286-232577', '04286-295882', '04286-295420', '04286-225550', '04286-295954', '04286-221877', '04286-295546', '04286-230115', '04286-295779', '04286-295243', '04286-295489', '04286-277528', '04286-295448', '04286-295917', '04286-234712', '04286-295884', '04286-299258', '04286-295797', '04286-295747', '04286-295750', '04286-220316', '04286-295653', '04286-232134', '04286-299157', '04286-295348', '04286-295423', '04286-295519', '04286-295744', '04286-295854', '04286-295298', '04286-295742', '04286-295267', '04286-232880', '04286-221139', '04286-295814', '04286-220314', '04286-227515'].map(phone => getdetails(phone, info))).then(_ => console.log(info)).then(_ => {
// //   var values = Object.values(info).map(x => [x.address, x.llInstallDate, x.servieOperStatus, x.phoneNo, x.mobileNo, x.billingAccNo, x.customerName].map(i => strToCsvData(i)));

// //   const a = window.document.createElement('a');
// //   a.href = window.URL.createObjectURL(new Blob([values.map(row => row.join(',')).join('\n')], { type: 'text/csv' }));
// //   a.download = document.title.replace(/[^a-zA-Z0-1]/g, ' ').replace(/\s+/g, ' ') + '.csv';
// //   document.body.appendChild(a);
// //   a.click();
// //   document.body.removeChild(a);
// // })

// getdetails('04286299165');

// getVlan(290067)

function getVlan(number) {
    return fetch("https://api.dheeranenterprise.in/api/v1/bsnl/customerDetails", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Google Chrome\";v=\"140\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site"
  },
  "referrer": "https://cable.dheeranenterprise.in/",
  "body": "{\"phoneNo\":\"04286-" + number + "\",\"token\":\"U2FsdGVkX18zJCGMprx2ljmEJK1s5ie1jQMEAjm0BWcSFJrbyMcHfJaU6lqRv1wVq5MH+/D3DfTz2LYtHwV8/amfCZ7R8FUSpZL0LyzwY+lT4jx0C/0bUTyjsUnXcXT5\",\"scriptId\":\"AKfycbyEiJGBvoSdzSTaRJNg7vYTD0p2PjI78YBc5VtA3OUGZ3ZP3eIYmaqB_na5SiOtVNpk\"}",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
}).then(x => x.json()).then(x => ({ number, vlan: x.data.innerVlan }));
}

async function getVlans(numbers) {
  const retval = [];
  for (var i = 0; i < numbers.length; i++) {
    console.log(`Processing ${i + 1} of ${numbers.length}...`);
    try {
      retval.push(await getVlan(numbers[i]));
    } catch (e) {
      retval.push({ number: numbers[i] });
      console.log('Unable to fetch VLAN details for ', numbers[i]);
    }
  }
  console.log(retval);
  return retval;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// GET CUSTOMER DETAILS //////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getCustomerDetails(phoneNo) {
  return await fetch(`http://localhost:8201/api/v1/bsnl/customerDetails`, {
    method: 'POST',
    body: JSON.stringify({ phoneNo }),
    headers: {
  'Content-Type': 'application/json'
}
  })
    .then(res => res.json());
}

var values = [];
var phoneNums = [
"04286-297444",
"04286-297911",
"04286-297308",
"",
"04286-297515",
"04286-297506",
"04286-297633",
"04286-297919",
"",
"",
"",
"04286-297757",
"04286-252320",
"04286-263221",
"04286-266799"
];

// Below code will get the customer details for `phoneNums`
for (var i = 0; i < phoneNums.length; i++) {
    console.log(`Processing ${i + 1} of ${phoneNums.length}...`);
    const ph = phoneNums[i];
    const trimPh = ph.trim();
    if (trimPh) {
        const details = await getCustomerDetails(ph);
        values.push(details?.data || {innerVlan: "", outerVlan: "" });
    } else {
        values.push({innerVlan: "", outerVlan: "" });
    }
}
console.log('Done');