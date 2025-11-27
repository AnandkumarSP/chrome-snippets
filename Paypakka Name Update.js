function hasOnlyAscii(record) {
  return !!record.name.match(/^[ -~]+$/);
}

async function translateToTamil(names) {
  names = Array.isArray(names) ? names : [names];
  const namesStr = names.join('%0A');
  return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${namesStr}`)
    .then(res => res.json())
    .then(res => {
      const translatedNames = res[0].map((r) => (r[0] || '').trim());
      return names.reduce((acc, name, i) => {
        acc[name] = translatedNames[i];
        return acc;
      }, {});
    });
}

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBfcmVmX2lkIjoiNjUwZTgzYjg0NjE4NjFlMjg4MzY1ZDYzIiwiZGlzdHJpYnV0b3JfcmVmX2lkIjoiNjUwZTgzYjg0NjE4NjFlMjg4MzY1ZDVmIiwicm9sZSI6IkRpc3RyaWJ1dG9yIiwiaWF0IjoxNjk2OTIzMDQwLCJleHAiOjE2OTY5MjMzNDB9.YhIk15tzqgpXI2U3KRBdP4SXjJW8B_Y_6ePBewWXnCc";
const allRecords = await fetchAllRecords();
const asciiNameRecords = allRecords.filter(hasOnlyAscii);
const asciiNameRecordsObj = asciiNameRecords.reduce((acc, rec) => {
  acc[rec.name] = rec;
  return acc;
}, {});
const translatedNamesObj = await translateToTamil(Object.keys(asciiNameRecordsObj));

async function updateName(record) {
  const payload = {
    _id: record._id,
    name: record.name + ' ' + translatedNamesObj[record.name],
  };

  return fetch("https://app.paypakka.com/api/v2/cust/customer", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-access-token": authToken,
      "x-app-id": "Admin",
      "x-app-version": "2.0.0",
      "x-user-agent": "Web"
    },
    "referrer": "https://app.paypakka.com/customer/650e8ad31fac249694d062f9/profile",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": JSON.stringify(payload),
    "method": "PUT",
    "mode": "cors",
    "credentials": "include"
  });
}

async function fetchAllRecords() {
  return fetch("https://app.paypakka.com/api/v2/cust/list", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-access-token": authToken,
      "x-app-id": "Admin",
      "x-app-version": "2.0.0",
      "x-user-agent": "Web"
    },
    "referrer": "https://app.paypakka.com/customer/list",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"start\":0,\"limit\":2000,\"distributor_ref_id\":\"650e83b8461861e288365d5f\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  })
  .then(res => res.json())
  .then(res => res.data);
}
