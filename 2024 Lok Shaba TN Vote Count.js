// Run this script from webpage https://results.eci.gov.in/PcResultGenJune2024/partywiseresult-S22.htm

const options = Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_Result1_ddlState option[value]:not([value=""])')).map(o => o.getAttribute('value'));
const optionsInfo = {};
const partywiseInfo = {};

async function getPartyWiseVotes(constituency) {
    const htmlres = await fetch(`https://results.eci.gov.in/PcResultGenJune2024/candidateswise-${constituency}.htm`)
        .then(r => r.text())
        .then(r => (new DOMParser()).parseFromString(r, 'text/html'))
        .then(r => {
            return {
                name: r.querySelector('.page-title h2 span').textContent,
                candidatesInfo: Array.from(r.querySelectorAll('.cand-info'))
                    .map(candInfo => {
                        const info = {};
                        info.votes = parseInt(candInfo.querySelector('.status div:nth-child(2)').textContent.split(' ')[0]);
                        info.name = candInfo.querySelector('.nme-prty h5').textContent;
                        info.party = candInfo.querySelector('.nme-prty h6').textContent;
                        return info;
                    })
            };
        })
        .then(r => optionsInfo[r.name] = r.candidatesInfo);
}

Promise.all(options.map(option => getPartyWiseVotes(option)))
    .then(_ => {
        Object.keys(optionsInfo)
            .forEach(constituency => {
                const candInfoList = optionsInfo[constituency];
                candInfoList.forEach(candInfo => {
                    partywiseInfo.All = partywiseInfo.All || {
                        name: 'All',
                        votes: 0,
                        percentage: 0,
                    };
                    partywiseInfo[candInfo.party] = partywiseInfo[candInfo.party] || {
                        name: candInfo.party,
                        votes: 0,
                        percentage: 0,
                        constituency: {},
                    };
                    partywiseInfo[candInfo.party].votes += candInfo.votes;
                    partywiseInfo[candInfo.party].constituency[constituency] = candInfo.votes;
                    partywiseInfo.All.votes += candInfo.votes;
                });
            });
        Object.values(partywiseInfo)
            .forEach(partyInfo => {
                partyInfo.percentage = partyInfo.votes / partywiseInfo.All.votes * 100;
            });
    })
    .then(_ => console.log(optionsInfo, partywiseInfo))
    .then(_ => {
        console.log(Object.values(partywiseInfo).sort(function(a, b) {
            return b.percentage - a.percentage;
        }));
    });