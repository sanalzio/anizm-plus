// Tarayıcı uyumluluğu için
window.browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;
window.getURL = (URL = "") => browserObj.runtime.getURL(URL);




// DOM yüklenince çalışacak fonksiyon
async function onDomReady(callback) {
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

// verilen css dosyası dom objesine ekler
function injectStyle(URL) {
    fetch(getURL(URL))
        .then(req => req.text())
        .then(data => {
            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = data;
            document.documentElement.appendChild(newStyleElement);
        });
}





// - Özel temayı enjekte et - //


injectStyle("styles/design/necessary.css");


// - Özel temayı enjekte et - //




document.documentElement.insertAdjacentHTML("afterbegin", '<data id="anizmpluspath" content="' + browserObj.runtime.getURL("") + '">');




browserObj.storage.local.get([

    "searchActive",

    "themeId",
    "minCssActive",
    "applyColor",
    "userCss",

    "fansubsActive",
    "fansubs",
    "selectPlayer",
    "players",

    "changeBgs",
    "homeBg",
    "homeSliderBg",
    "episodeBg",

    "lastSeen",
    "watched",

    "newTab",

    "glass"

], function (result) {

    if (result.newTab) {
        const baseElement = document.createElement("base");
        baseElement.target = "_blank";
        document.documentElement.appendChild(baseElement);
    }

    if (result.glass) {
        injectStyle("styles/design/glass.css");
    }

    if (result.applyColor && result.themeId) {
        if (result.themeId.startsWith("$")) {

            const themeArray = result.themeId.slice(1).split(" ");

            fetch(getURL("styles/colors/custom_theme.css"))
                .then(req => req.text())
                .then(data => {
                    const newStyleElement = document.createElement("style");
                    newStyleElement.innerHTML = themeArray[0].replaceAll(themeArray[0], data);
                    document.documentElement.appendChild(newStyleElement);
                });

            (async function (callback) {
                if (document.querySelectorAll("img[alt=\"Logo\"]").length > 1) {
                    callback();
                } else {
                    new MutationObserver((_, obs) => {
                        if (document.querySelectorAll("img[alt=\"Logo\"]").length > 1) {
                            obs.disconnect();
                            callback();
                        }
                    }).observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                    });
                }
            })(()=>{

                Array.from(document.querySelectorAll("img[alt=\"Logo\"]")).forEach(img=>{
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });

                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    if (img.className)
                        canvas.className = img.className;
                    else {
                        canvas.style.width = img.width + "px";
                        canvas.style.height = img.height + "px";
                    }
                    img.style.display = "none";

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    const targetH = parseInt(themeArray[1]) / 360;
                    const targetS = parseInt(themeArray[2]) / 100;
                    const targetL = parseInt(themeArray[3]) / 100;

                    // ortalama lightness hesapla
                    /*let sumL = 0;
                    let count = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i] / 255;
                        const g = data[i + 1] / 255;
                        const b = data[i + 2] / 255;
                        const max = Math.max(r, g, b);
                        const min = Math.min(r, g, b);
                        const l = (max + min) / 2;
                        sumL += l;
                        count++;
                    }
                    const avgL = sumL / count;*/
                    const avgL = 0.23824762947990613;

                    // fark
                    const diff = targetL - avgL;

                    function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
                    function smoothstep(x) { x = clamp(x, 0, 1); return x*x*(3 - 2*x); }

                    const mixMinBright = 0.25, mixMaxBright = 0.60;
                    const gammaBrightMin = 1.25, gammaBrightMax = 1.4;

                    const mixMinDark = 0.25, mixMaxDark = 0.45;
                    const gammaDarkMin = 0.5, gammaDarkMax = 0.9;

                    // diff zaten hesaplanmış
                    const d = diff; // targetL - avgL
                    const m = clamp(Math.abs(d) / 0.5, 0, 1); // normalize
                    const s = smoothstep(m);

                    let mixAmount, gamma;
                    if (d > 0) { // hedef daha açık -> hafif etki, gamma düşük
                        mixAmount = mixMinBright + (mixMaxBright - mixMinBright) * s;
                        // gamma düşsün ama aşırı düşmesin: m arttıkça gamma biraz düşer
                        gamma = gammaBrightMin + (gammaBrightMax - gammaBrightMin) * (1 - m);
                    } else {    // hedef daha koyu -> daha güçlü etki, gamma yüksek
                        mixAmount = mixMinDark + (mixMaxDark - mixMinDark) * s;
                        gamma = gammaDarkMin + (gammaDarkMax - gammaDarkMin) * m;
                    }

                    // güvenlik: sınırlar
                    mixAmount = clamp(mixAmount, 0.05, 0.85);
                    gamma = clamp(gamma, 0.6, 2.0);

                    const maxAdjust = 0.15; // en fazla +-% ışık değişimi
                    let lightnessAdjust = diff * mixAmount;
                    lightnessAdjust = clamp(lightnessAdjust, -maxAdjust, maxAdjust);

                    const contrast = 2; // 1.0 = normal, 1.2 = %20 daha yüksek, 1.5 agresif olur

                    for (let i = 0; i < data.length; i += 4) {
                        let r = data[i] / 255;
                        let g = data[i + 1] / 255;
                        let b = data[i + 2] / 255;

                        const max = Math.max(r, g, b);
                        const min = Math.min(r, g, b);
                        let l = (max + min) / 2;

                        // aydınlık düzeltme
                        l = l + lightnessAdjust;

                        // gamma'yı fark yönüne göre uygula
                        l = Math.pow(Math.min(1, Math.max(0, l)), gamma);

                        // kontrastı uygula (orta noktadan uzaklaştır)
                        l = 0.5 + (l - 0.5) * contrast;
                        l = Math.min(1, Math.max(0, l)); // sınırları aşma

                        const q = l < 0.5 ? l * (1 + targetS) : l + targetS - l * targetS;
                        const p = 2 * l - q;

                        function hue2rgb(p, q, t) {
                            t = ((t % 1) + 1) % 1;
                            if (t < 1/6) return p + (q - p) * 6 * t;
                            if (t < 1/2) return q;
                            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                            return p;
                        }

                        data[i]     = hue2rgb(p, q, targetH + 1/3) * 255;
                        data[i + 1] = hue2rgb(p, q, targetH) * 255;
                        data[i + 2] = hue2rgb(p, q, targetH - 1/3) * 255;
                    }

                    ctx.putImageData(imageData, 0, 0);
                    img.parentElement.appendChild(canvas);
                    img.remove();
                });
            });
        } else {
            injectStyle(`styles/colors/${result.themeId}_theme.css`);
        }
        onDomReady(() => {
            injectStyle("styles/design/for_color_themes.css");
        });
    }




    // fansub öncelikli seçim için ilk fansub'ı seçme engelleniyor

    // if (result.fansubsActive)
    (async function onScriptReady(callback) {
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
        (async function onScriptReady(callback) {
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
        (async function onScriptReady(callback) {
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

        if (result.minCssActive !== false)
            injectStyle("styles/design/min_theme.css");

        if (result.userCss) {
            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = result.userCss.replace(cssMinifyRegexp, "");
            document.documentElement.appendChild(newStyleElement);
        }

        /* if (result.removeBgs)
            injectStyle("styles/design/remove_bgs.css"); */


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
                    data += "header .cover,header .cover .divider{display:none}";
                } else {
                    data += "header .cover{opacity:1;background:url(" + result.episodeBg + ") no-repeat center center!important;background-size:cover;background-color:#000}";
                }
            }

            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = data;
            document.documentElement.appendChild(newStyleElement);
        }


        // arama filtreleri
        // arama arayüzünün oluşmasını bekleyip işlem yapıyoruz
        if (result.searchActive != false) {

            const newScriptElement = document.createElement("script");
            newScriptElement.src = getURL("inject_scripts/filters.js");
            document.body.appendChild(newScriptElement);

            (async function (callback) {
                if (document.getElementById('searchOverlay')) {
                    callback();
                } else {
                    new MutationObserver((_, obs) => {
                        if (document.getElementById('searchOverlay')) {
                            obs.disconnect();
                            callback();
                        }
                    }).observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                    });
                }
            })(()=>{
                injectStyle("styles/design/filters.css");
    
                fetch(getURL("components/filtermenu.html"))
                    .then(res => res.text())
                    .then(content => {
                        document.getElementById('searchOverlay').insertAdjacentHTML("beforeend", content);
                    });
            });
        }

    });

});
