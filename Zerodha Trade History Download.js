(function () {
  /*
  * FileSaver.js
  * A saveAs() FileSaver implementation.
  *
  * By Eli Grey, http://eligrey.com
  *
  * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
  * source  : http://purl.eligrey.com/github/FileSaver.js
  */

  // The one and only way of getting global scope in all environments
  // https://stackoverflow.com/q/3277182/1008999
  var _global = typeof window === 'object' && window.window === window
    ? window : typeof self === 'object' && self.self === self
      ? self : typeof global === 'object' && global.global === global
        ? global
        : this

  function bom(blob, opts) {
    if (typeof opts === 'undefined') opts = { autoBom: false }
    else if (typeof opts !== 'object') {
      console.warn('Deprecated: Expected third argument to be a object')
      opts = { autoBom: !opts }
    }

    // prepend BOM for UTF-8 XML and text/* types (including HTML)
    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
    if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type })
    }
    return blob
  }

  function download(url, name, opts) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      saveAs(xhr.response, name, opts)
    }
    xhr.onerror = function () {
      console.error('could not download file')
    }
    xhr.send()
  }

  function corsEnabled(url) {
    var xhr = new XMLHttpRequest()
    // use sync to avoid popup blocker
    xhr.open('HEAD', url, false)
    try {
      xhr.send()
    } catch (e) { }
    return xhr.status >= 200 && xhr.status <= 299
  }

  // `a.click()` doesn't work for all browsers (#465)
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent('click'))
    } catch (e) {
      var evt = document.createEvent('MouseEvents')
      evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
        20, false, false, false, false, 0, null)
      node.dispatchEvent(evt)
    }
  }

  // Detect WebView inside a native macOS app by ruling out all browsers
  // We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
  // https://www.whatismybrowser.com/guides/the-latest-user-agent/macos
  var isMacOSWebView = _global.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent)

  var saveAs = _global.saveAs || (
    // probably in some web worker
    (typeof window !== 'object' || window !== _global)
      ? function saveAs() { /* noop */ }

      // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
      : ('download' in HTMLAnchorElement.prototype && !isMacOSWebView)
        ? function saveAs(blob, name, opts) {
          var URL = _global.URL || _global.webkitURL
          var a = document.createElement('a')
          name = name || blob.name || 'download'

          a.download = name
          a.rel = 'noopener' // tabnabbing

          // TODO: detect chrome extensions & packaged apps
          // a.target = '_blank'

          if (typeof blob === 'string') {
            // Support regular links
            a.href = blob
            if (a.origin !== location.origin) {
              corsEnabled(a.href)
                ? download(blob, name, opts)
                : click(a, a.target = '_blank')
            } else {
              click(a)
            }
          } else {
            // Support blobs
            a.href = URL.createObjectURL(blob)
            setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s
            setTimeout(function () { click(a) }, 0)
          }
        }

        // Use msSaveOrOpenBlob as a second approach
        : 'msSaveOrOpenBlob' in navigator
          ? function saveAs(blob, name, opts) {
            name = name || blob.name || 'download'

            if (typeof blob === 'string') {
              if (corsEnabled(blob)) {
                download(blob, name, opts)
              } else {
                var a = document.createElement('a')
                a.href = blob
                a.target = '_blank'
                setTimeout(function () { click(a) })
              }
            } else {
              navigator.msSaveOrOpenBlob(bom(blob, opts), name)
            }
          }

          // Fallback to using FileReader and a popup
          : function saveAs(blob, name, opts, popup) {
            // Open a popup immediately do go around popup blocker
            // Mostly only available on user interaction and the fileReader is async so...
            popup = popup || open('', '_blank')
            if (popup) {
              popup.document.title =
                popup.document.body.innerText = 'downloading...'
            }

            if (typeof blob === 'string') return download(blob, name, opts)

            var force = blob.type === 'application/octet-stream'
            var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari
            var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent)

            if ((isChromeIOS || (force && isSafari) || isMacOSWebView) && typeof FileReader !== 'undefined') {
              // Safari doesn't allow downloading of blob URLs
              var reader = new FileReader()
              reader.onloadend = function () {
                var url = reader.result
                url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;')
                if (popup) popup.location.href = url
                else location = url
                popup = null // reverse-tabnabbing #460
              }
              reader.readAsDataURL(blob)
            } else {
              var URL = _global.URL || _global.webkitURL
              var url = URL.createObjectURL(blob)
              if (popup) popup.location = url
              else location.href = url
              popup = null // reverse-tabnabbing #460
              setTimeout(function () { URL.revokeObjectURL(url) }, 4E4) // 40s
            }
          }
  )

  function numToStringWithPadding(num, padding) {
    return ('0'.repeat(padding) + num).slice(-padding);
  }

  function getDelayedPromise(delayInSec) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), delayInSec * 1000);
    });
  }

  var nameIdMapping = {
    // ADANIPORTS: 3861249,
    // ADANIPOWER: 4451329,
    // ASHOKLEY: 54273,
    // ASIANPAINT: 60417,
    // AXISBANK: 1510401,
    // BAJAJAUTO: 4267265,
    // BAJAJFINSV: 4268801,
    // BAJFINANCE: 81153,
    // BHARTIARTL: 2714625,
    // BPCL: 134657,
    // BRITANNIA: 140033,
    // CIPLA: 177665,
    // COALINDIA: 5215745,
    // DIVISLAB: 2800641,
    // DRREDDY: 225537,
    // EICHERMOT: 232961,
    // FEDERALBANK: 261889,
    // GOLDBOND8: 1817089,
    // GRASIM: 315393,
    // HCLTECH: 1850625,
    // HDFC: 340481,
    // HDFCBANK: 341249,
    // HDFCLIFE: 119553,
    // HEROMOTOCO: 345089,
    // HINDALCO: 348929,
    // HINDUNILVR: 356865,
    // ICICI: 1270529,
    // INDUSINDBK: 1346049,
    // INFY: 408065,
    // IOC: 415745,
    ITC: 424961,
    // JSWSTEEL: 3001089,
    // JUSTDIAL: 7670273,
    // KOTAKBANK: 492033,
    // LT: 2939649,
    // 'M&M': 519937,
    // MARUTI: 2815745,
    // MRF: 582913,
    // NESTLEIND: 4598529,
    // NIFTY50: 256265,
    // NTPC: 2977281,
    // ONGC: 633601,
    // POWERGRID: 3834113,
    // RELIANCE: 738561,
    // RTNPOWER: 4485121,
    // SBILIFE: 5582849,
    // SBIN: 779521,
    // SHREECEM: 794369,
    // SUNPHARMA: 857857,
    // SUNTV: 3431425,
    // TATACONSUM: 878593,
    // TATAMOTORS: 884737,
    // TATAPOWER: 877057,
    // TATASTEEL: 895745,
    // TCS: 2953217,
    // TECHM: 3465729,
    // TITAN: 897537,
    // ULTRACEMCO: 2952193,
    // UPL: 2889473,
    // WIPRO: 969473,
  };

  var downloadKiteHistoryForQuarter = function (name, instrumentId, year, quarter) {
    let today = new Date(),
        currentQuarter = parseInt(today.getMonth() / 3) + 1,
        yearToProcess = year || today.getFullYear().toString(),
        fromDate = `${yearToProcess}`,
        toDate = `${yearToProcess}`;
    instrumentId = instrumentId || nameIdMapping[name];

    const cookieObj = document.cookie.split(/\s*;\s*/).reduce((p, c) => {
      var splits = c.split(/=/);
      p[splits[0]] = splits.slice(1).join('=');
      return p;
    }, {});

    if (!quarter) {
      quarter = currentQuarter;
    }

    // Do not process for future year or furture quarters in current year
    if ((year > today.getFullYear()) ||
        ((year === today.getFullYear()) && (quarter > currentQuarter))) {
      return Promise.resolve();
    }

    fromDate += `-${numToStringWithPadding((quarter - 1)  * 3 + 1, 2)}-01`;
    toDate += `-${numToStringWithPadding(quarter  * 3, 2)}-${((quarter === 1) || (quarter === 4)) ? 31 : 30}`;

    return fetch(`https://kite.zerodha.com/oms/instruments/historical/${instrumentId}/${_global.kiteUtils.interval}?user_id=${cookieObj.user_id}&oi=1&from=${fromDate}&to=${toDate}`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": `enctoken ${cookieObj.enctoken}`,
      },
      "referrer": "https://kite.zerodha.com/static/build/chart.html?v=3.5.2",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    })
      .then(resp => {
        console.log(`Saving ${_global.kiteUtils.interval} data for: `, name, instrumentId, yearToProcess, quarter);
        return resp.json()
      })
      .then(resp => saveAs(new Blob([JSON.stringify(resp.data.candles)], { type: "text/plain;charset=utf-8" }), `${name}-${_global.kiteUtils.interval === 'day' ? 'DAY-' : ''}${yearToProcess}-${quarter}.json`));
  };

  var downloadKiteHistoryForYear = function (name, instrumentId, year) {
    return Promise.all([
      downloadKiteHistoryForQuarter(name, instrumentId, year, 1),
      downloadKiteHistoryForQuarter(name, instrumentId, year, 2),
      downloadKiteHistoryForQuarter(name, instrumentId, year, 3),
      downloadKiteHistoryForQuarter(name, instrumentId, year, 4)
    ]);
  }

  var downloadKiteHistoryForYears = function (name, instrumentId, startYear, endYear) {
    if (startYear <= endYear) {
      return downloadKiteHistoryForYear(name, instrumentId, startYear)
        .then(() => getDelayedPromise(1))
        .then(() => downloadKiteHistoryForYears(name, instrumentId, startYear + 1, endYear));
    }
    return Promise.resolve();
  }

  _global.saveAs = saveAs.saveAs = saveAs;
  _global.kiteUtils = {};
  _global.kiteUtils.interval = '3minute';
  _global.kiteUtils.nameIdMapping = nameIdMapping;
  _global.kiteUtils.getDelayedPromise = getDelayedPromise;
  _global.kiteUtils.downloadKiteHistoryForQuarter = downloadKiteHistoryForQuarter;
  _global.kiteUtils.downloadKiteHistoryForYear = downloadKiteHistoryForYear;
  _global.kiteUtils.downloadKiteHistoryForYears = downloadKiteHistoryForYears;

  if (typeof module !== 'undefined') {
    module.exports = saveAs;
  }
})()

var promiseController = Promise.resolve();
var downloaderTimeout = 0.5;
promiseController
  .then(_ => kiteUtils.interval = '3minute')
  .then(_ => {
    Object
      .keys(kiteUtils.nameIdMapping)
      .forEach(stock => {
        promiseController = promiseController
          .then(() => {
            return kiteUtils.downloadKiteHistoryForQuarter(stock);
          })
          .then(kiteUtils.getDelayedPromise(downloaderTimeout));
      });
    return promiseController;
  })
  .then(_ => kiteUtils.interval = 'day')
  .then(_ => {
    Object
      .keys(kiteUtils.nameIdMapping)
      .forEach(stock => {
        promiseController = promiseController
          .then(() => {
            return kiteUtils.downloadKiteHistoryForYears(stock, null, 2021, 2026);
          })
          .then(kiteUtils.getDelayedPromise(downloaderTimeout));
      });
    return promiseController;
  });
