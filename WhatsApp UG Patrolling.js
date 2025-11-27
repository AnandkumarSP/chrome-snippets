function strToCsvData(str) {
  str = /,/.test(str) ? `"${str}"` : str;
  str = /^\s*\d+(e\d+)?(\.\d+)?\s*$/i.test(str) ? `="${str}"` : str;
  return str;
}

function processPlaces(text) {
    return text
        .replace(/\bnmkk\b/i, 'Namakkal')
        .replace(/\bbsnl\b/i, 'BSNL')
        .replace(/velgoutpatti/i, 'Velangoundampatti')
        .replace(/velagoundapatti/i, 'Velangoundampatti')
        .replace(/\b[a-z](?=[a-z]{2})/ig, (l) => l.toUpperCase());
}

function processMsg(msg, activeDate) {
    const msgMatches = msg.match(/^\s*(\d+\s*\))\s*([\w\s]+?)to([\w\s]+?)\s+(route)?\s+(near\s+(bsnl office|ams college|anjaneyar temple|[ -~]+?)\b)?([ -~]+)$/i);
    activeDate = (activeDate || '').replace(/^(\d+).(\d+).(\d+)$/, '$2.$1.$3');
    if (msgMatches) {
        return {
            date: new Date(activeDate || ''),
            from: processPlaces(msgMatches[2]?.trim() || ''),
            to: processPlaces(msgMatches[3]?.trim() || ''),
            near: processPlaces((msgMatches[5]?.trim() || '').replace(/\bnear\b/i, 'Near')),
            work: (msgMatches[7]?.trim() || '').replace(/^[a-z]/g, (l) => l.toUpperCase()),
            fullText: msg,
        };
    }
}

function getDateStr(d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()}/${months[d.getMonth()]}/${d.getFullYear()}`;
}

function getUgPatrolling(startDate, endDate) {
    const msgDays = Array.from(document.querySelectorAll('[role*=application] > .focusable-list-item'));
    const startDay = msgDays.find(m => m.innerText.trim() === startDate);
    const patrollingDetail = {};
    const patrollingDetailByDate = [];
    let activeDate;
    let elementToProcess = startDay.nextSibling;

    while (elementToProcess) {
        if (elementToProcess.getAttribute('role') === 'row') {
            // Process row
            elementToProcess.innerText
                .split('\n')
                .forEach(msg => {
                    if (/^\d\d?\.\d\d?.\d\d\d?\d?$/.test(msg)) {
                        activeDate = msg;
                    } else if (msg) {
                        const processedMsg = processMsg(msg, activeDate);
                        if (processedMsg) {
                            patrollingDetail[activeDate] = patrollingDetail[activeDate] || [];
                            patrollingDetail[activeDate].push(processedMsg);
                        }
                    }
                });
        } else if (elementToProcess.classList.contains('focusable-list-item')) {
            if (elementToProcess.innerText.trim() === endDate) break;
        }

        elementToProcess = elementToProcess.nextSibling;
    }

    const dates = Object.keys(patrollingDetail);
    dates.sort((a, b) => {
        a = new Date(a);
        b = new Date(b);
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });
    dates.forEach((date) => {
        patrollingDetail[date].forEach((pd) => patrollingDetailByDate.push(pd));
    });
    console.log(patrollingDetail);

    var values = patrollingDetailByDate.map(x => [getDateStr(x.date), x.near, `${x.from} to ${x.to}`, x.work, x.fullText].map(i => strToCsvData(i)));

    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([values.map(row => row.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'patrollingDetails.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

getUgPatrolling('TODAY');
