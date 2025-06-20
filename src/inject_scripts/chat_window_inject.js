// Tarayıcı uyumluluğu için
const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;
const getURL = (URL = "") => browserObj.runtime.getURL(URL);




// DOM yüklenince çalışacak fonksiyon
function onDomReady(callback) {
    if (document.body) {
        callback();
    } else {
        new MutationObserver((_, obs) => {
            if (document.body) {
                obs.disconnect();
                callback();
            }
        }).observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }
}





// css dilindeki işlevsiz boşlukları seçen bir regexp ifadesi
// const cssMinifyRegexp = /(?=\{)\s|\s(?<=\})|\s(?=\{)|(?<=\})\s|\s{4}|\s{2}|\/\*[^*]*\*\/|\n/g;

// verilen css dosyası içeriğini sıkıştırıp dom objesine ekler
function injectStyle(URL) {
    fetch(getURL(URL))
        .then(req => req.text())
        .then(data => {
            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = data;
            document.documentElement.appendChild(newStyleElement);
        });
}




// Eklenti ayarlarına göre işlemler

browserObj.storage.local.get(["themeId", "applyColor"], function (result) {
    onDomReady(() => {
        injectStyle("styles/design/chat_window.css");
        injectStyle("styles/colors/" + (result.applyColor ? result.themeId : "orange") + "_theme.css");
    });
});
