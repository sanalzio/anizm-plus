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
const cssMinifyRegexp = /(?=\{)\s|\s(?<=\})|\s(?=\{)|(?<=\})\s|\s{4}|\s{2}|\/\*[^*]*\*\/|\n/g;

// verilen css dosyası içeriğini sıkıştırıp dom objesine ekler
function injectStyle(URL) {
    fetch(getURL(URL))
        .then(req => req.text())
        .then(data => {
            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = data
            document.documentElement.appendChild(newStyleElement);
        });
}





// - Özel temayı enjekte et - //


injectStyle("styles/design/necessary.css");


// - Özel temayı enjekte et - //




browserObj.storage.local.get(["themeId", "removeBgs", "minCssActive", "applyColor", "userCss", "fansubsActive", "fansubs", "selectPlayer", "players", "changeBgs", "homeBg", "homeSliderBg", "episodeBg", "lastSeen", "watched"], function (result) {

    if (result.minCssActive !== false)
        injectStyle("styles/design/min_theme.css");

    if (result.applyColor && result.themeId) {
        injectStyle("styles/colors/" + result.themeId + "_theme.css");
        onDomReady(() => {
            injectStyle("styles/design/for_color_themes.css");
        });
    }

    /* if (result.removeBgs)
        injectStyle("styles/design/remove_bgs.css"); */

    if (result.userCss) {
        onDomReady(() => {
            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = result.userCss.replace(cssMinifyRegexp, "");
            document.documentElement.appendChild(newStyleElement);
        });
    }




    // fansub öncelikli seçim için ilk fansub'ı seçme engelleniyor

    // if (result.fansubsActive)
    (function onScriptReady(callback) {
        if (document.body && Array.from(document.body.querySelectorAll("script")).filter(s => s.innerText.includes("firstFansubLink.dispatchEvent")).length>0) {
            callback();
        } else {
            new MutationObserver((_, obs) => {
                if (document.body && Array.from(document.body.querySelectorAll("script")).filter(s => s.innerText.includes("firstFansubLink.dispatchEvent")).length>0) {
                    obs.disconnect();
                    callback();
                }
            }).observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        }
    })(() => {
        const scripts = document.body.querySelectorAll("script");

        scripts.forEach(script => {
            if (script.innerText.includes("firstFansubLink.dispatchEvent")) {
                script.remove();
                console.log("Fansub auto-click scripti bloklandı.");
            }
        });
    });

    /* if (result.lastSeen)
        (function onScriptReady(callback) {
            const look = document.body && Array.from(document.body.querySelectorAll("script")).filter(s => s.innerText.includes("api/update-last-seen"));
            if (look && look.length>0) {
                callback(look);
            } else {
                new MutationObserver((_, obs) => {
                    const look = document.body && Array.from(document.body.querySelectorAll("script")).filter(s => s.innerText.includes("api/update-last-seen"));
                    if (look && look.length>0) {
                        obs.disconnect();
                        callback(look);
                    }
                }).observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        })(scripts => {

            scripts.forEach(script => {
                if (script.innerText.includes("api/update-last-seen")) {
                    script.remove();
                    console.log("Son görülme verisi gönderimi engellendi.");
                }
            });
        });

    if (result.watched)
        (function onScriptReady(callback) {
            const look = document.body && Array.from(document.body.querySelectorAll("script")).filter(s => s.innerText.includes("userWatched"));
            if (look && look.length>0) {
                callback(look);
            } else {
                new MutationObserver((_, obs) => {
                    const look = document.body && Array.from(document.body.querySelectorAll("script")).filter(s => s.innerText.includes("userWatched"));
                    if (look && look.length>0) {
                        obs.disconnect();
                        callback(look);
                    }
                }).observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        })(scripts => {

            scripts.forEach(script => {
                if (script.innerText.includes("userWatched")) {
                    script.remove();
                    console.log("İzlenme bilgisi gönderimi engellendi.");
                }
            });
        }); */

    if (result.fansubsActive && result.fansubs)
        document.documentElement.insertAdjacentHTML("afterbegin", '<data id="$" content="' + result.fansubs.replaceAll('"', "&quot;") + '">');
    if (result.selectPlayer && result.players)
        document.documentElement.insertAdjacentHTML("afterbegin", '<data id="%" content="' + result.players.replaceAll('"', "&quot;") + '">');

    onDomReady(() => {
        if (result.changeBgs) {
            let data = "";

            if (result.homeBg && result.homeBg != "def" && result.homeBg != "none") {

                data += "main{background:transparent!important;background-color:transparent!important}";

                if (result.homeBg.startsWith("#")) {
                    data += "body{background:transparent;background-color:transparent!important}html{background:" + result.homeBg + "!important}";
                } else if (result.homeBg.startsWith("file:")){
                    data += "body{background:transparent;background-color:transparent!important}::-webkit-scrollbar{background:var(--themeBgColor)}html{background:url(" + result.homeBg.split(":").slice(2).join(":") + ") no-repeat center center fixed;background-size:cover;background-color:#000}";
                } else {
                    data += "body{background:transparent;background-color:transparent!important}::-webkit-scrollbar{background:var(--themeBgColor)}html{background:url(" + result.homeBg + ") no-repeat center center fixed;background-size:cover;background-color:#000}";
                }
            }

            if (result.homeSliderBg && result.homeSliderBg != "def") {

                data += "header{background:transparent!important;background-color:transparent!important}";

                if (result.homeSliderBg.startsWith("#")) {
                    data += "header[data-menutype=\"homepage\"]::before{opacity:1;background:" + result.homeSliderBg + "!important}";
                } else if (result.homeSliderBg.startsWith("file:")){
                    data += "header[data-menutype=\"homepage\"]::before{opacity:1;background:url(" + result.homeSliderBg.split(":").slice(2).join(":") + ") no-repeat center center fixed!important}";
                } else if (result.homeSliderBg == "none") {
                    data += "header[data-menutype=\"homepage\"]::before{display:none}";
                } else {
                    data += "header[data-menutype=\"homepage\"]::before{opacity:1;background:url(" + result.homeSliderBg + ") no-repeat center center fixed!important}";
                }
            }

            if (!window.location.pathname.startsWith("/takvim") && result.episodeBg && result.episodeBg != "def") {

                data += "header{background:transparent!important;background-color:transparent!important}";

                if (result.episodeBg.startsWith("#")) {
                    data += "header .cover{opacity:1;background:" + result.episodeBg + "!important}";
                } else if (result.episodeBg.startsWith("file:")){
                    data += "header .cover{opacity:1;background:url(" + result.episodeBg.split(":").slice(2).join(":") + ") no-repeat center center!important;background-size:cover;background-color:#000}";
                } else if (result.episodeBg == "none") {
                    data += "header .cover,.divider{display:none}";
                } else {
                    data += "header .cover{opacity:1;background:url(" + result.episodeBg + ") no-repeat center center!important;background-size:cover;background-color:#000}";
                }
            }

            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = data;
            document.documentElement.appendChild(newStyleElement);
        }
    });

});
