const lcoId = 46858;

function cleanupStr(value) {
    return value.toLowerCase().replace(/\b[a-z](?=[a-z]{0})/ig, (l) => l.toUpperCase());
}

function objsByKey(objsArr, key) {
    return objsArr.reduce((acc, obj) => {
        const value = obj[key];
        acc[value] = acc[value] || [];
        acc[value].push(obj);
        return acc;
    }, {});
}

function cleanupRecords(records) {
    let record;
    if (records?.length > 1) {
        record = records.find(r => !r.dob.startsWith('01-01'));
    }
    return record || records[0];
}

function getLocationDetails(address) {
    const splits = address.replace(/,\s*,/g, ',').split(',').map(l => l.replace(/\<\s*br\s*\>/g, '').trim());
    return {
        doorNo: splits[0],
        streetName: cleanupStr(splits[1]),
        areaName: cleanupStr(splits[2]),
        district: cleanupStr(splits[3]),
        pincode: splits.slice(4).find(x => /^\d+$/.test(x)),
    };
}

function getBodyStr(record) {
  return "------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"cust_name\"\r\n\r\n{{name}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"type_of_customer\"\r\n\r\n1\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"gender\"\r\n\r\n{{gender}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"dob\"\r\n\r\n{{dob}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"door_no\"\r\n\r\n{{doorNo}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"mobile_no\"\r\n\r\n{{mobile}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"street_name\"\r\n\r\n{{streetName}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"aadhaar_no\"\r\n\r\n{{aadhar}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"area_name\"\r\n\r\n{{areaName}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"email\"\r\n\r\n{{email}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"district\"\r\n\r\n8\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"stb_type\"\r\n\r\n1\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"pincode\"\r\n\r\n{{pincode}}\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"lco_district\"\r\n\r\n8\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"lco_taluk\"\r\n\r\n143\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"userid\"\r\n\r\n\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m\r\nContent-Disposition: form-data; name=\"save\"\r\n\r\nSubmit\r\n------WebKitFormBoundaryzXJHMSUu8bLCYh1m--\r\n"
    .replace('{{name}}', record.name || '')
    .replace('{{gender}}', record.gender || 1)
    .replace('{{dob}}', record.dob || '01-01-1980')
    .replace('{{email}}', record.email || '')
    .replace('{{mobile}}', record.mobile || '')
    .replace('{{aadhar}}', record.aadhar || '')
    .replace('{{doorNo}}', record.doorNo || '')
    .replace('{{streetName}}', record.streetName || '')
    .replace('{{areaName}}', record.areaName || '')
    .replace('{{pincode}}', record.pincode || '');
}

async function createCAFEntry(record) {
  return fetch("https://tactv.in/TACTV/index.php?pgname=caf_form_entry", {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryzXJHMSUu8bLCYh1m",
      "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    "referrer": "https://tactv.in/TACTV/index.php?pgname=caf_form_entry",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": getBodyStr(record),
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  });
}

function strArrayToObj(row) {
  return Object.assign(
    {
        name: cleanupStr(row.cell[3]),
        mobile: row.cell[4],
        email: row.cell[5],
        dob: row.cell[6],
        aadhar: row.cell[9],
    },
    getLocationDetails(row.cell[11])
  );
}

fetch(`https://tactv.in/TACTV/admin/grid/manage_caf_form_details_grid.php?q=1&enroll_no=${lcoId}&_search=false&nd=1698985553984&rows=1000&page=1&sidx=c.id&sord=asc`, {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
})
    .then(res => res.json())
    .then(res => res.rows)
    .then(rows => {
        console.log(rows);
        return rows.map(strArrayToObj);
    })
    .then(async (cafRecords) => {
        //const byAadhar = objsByKey(cafRecords, 'aadhar');
        //Object.keys(byAadhar).forEach(aadhar => {
        //    byAadhar[aadhar] = cleanupRecords(byAadhar[aadhar]);
        //});
        // console.log('By Aadhar: ', byAadhar, Object.keys(byAadhar).length);

        const startingIndex = 0;
        const batchSize = 10;
        const recordsToProcess = cafRecords.slice(startingIndex, startingIndex + batchSize);
        for (let i = 0; i < batchSize; i++) {
            const recordToPost = recordsToProcess[i];
            if (recordToPost) {
                await createCAFEntry(recordToPost);
            }
        }
    });