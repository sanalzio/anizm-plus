// Tarayıcı uyumluluğu için
const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;
const getURL = (URL = "") => browserObj.runtime.getURL(URL);




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






// - Hata ayıklama için - //


/*var logEl = document.createElement("DIV");
logEl.style.display="none";
const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}*/

// - Hata ayıklama için - //





browserObj.storage.local.get(["themeId", "minCssActive", "applyColor", "userCss", "changeBgs", "homeBg", "homeSliderBg", "episodeBg", "maxBgHeight"], function (result) {

    if (result.applyColor && result.themeId) {
        if (result.themeId.startsWith("$")) {

            const themeArray = result.themeId.slice(1).split(" ");
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

                fetch(getURL("styles/colors/custom_theme.css"))
                    .then(req => req.text())
                    .then(data => {
                        const newStyleElement = document.createElement("style");
                        newStyleElement.innerHTML = themeArray[0].replaceAll(themeArray[0], data);
                        document.documentElement.appendChild(newStyleElement);
                    });

                let arr;
                (async function (callback) {
                    arr = document.querySelectorAll("img[src$=\"/upload/assets/logo.webp\"]");
                    if (arr.length > 1) {
                        callback(arr);
                    } else {
                        new MutationObserver((_, obs) => {
                            arr = document.querySelectorAll("img[src$=\"/upload/assets/logo.webp\"]");
                            if (arr.length > 1) {
                                obs.disconnect();
                                callback(arr);
                            }
                        }).observe(document.documentElement, {
                            childList: true,
                            subtree: true,
                        });
                    }
                })(arr=>{
                    //// logEl.innerHTML+=JSON.stringify([...arr].map(e=>e.toString()))+"<br>";
                    [...arr].forEach(img=>{
                        //// logEl.innerHTML+="Img: "+escapeHtml(img.outerHTML)+"<br>";
                        // ! el.src = getURL(`assets/logo/red.webp`);
                        const handleLoad = () => {
                            //// logEl.innerHTML+="Img loaded: "+escapeHtml(img.outerHTML)+"<br>";
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
                            //// logEl.innerHTML+="Hided img<br>";

                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            //// logEl.innerHTML+="Drawed CTX<br>";

                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const data = imageData.data;
                            //// logEl.innerHTML+="Geted Image Data<br>";

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
                            //// logEl.innerHTML+=`Redrawed IMG<br>`;

                            ctx.putImageData(imageData, 0, 0);
                            //// logEl.innerHTML+="Puted data<br>";
                            img.parentElement.appendChild(canvas);
                            img.remove();
                            //// logEl.innerHTML+="Added canvas element<br>";
                        };
                        if (img.complete && img.naturalWidth !== 0) handleLoad();
                        else img.onload = handleLoad;
                    });
                });
            });
        } else {
            injectStyle("styles/colors/" + result.themeId + "_theme.css");

            let arr;
            (async function (callback) {
                arr = document.querySelectorAll("img[src$=\"/upload/assets/logo.webp\"]");
                if (arr.length > 1) {
                    callback(arr);
                } else {
                    new MutationObserver((_, obs) => {
                        arr = document.querySelectorAll("img[src$=\"/upload/assets/logo.webp\"]");
                        if (arr.length > 1) {
                            obs.disconnect();
                            callback(arr);
                        }
                    }).observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                    });
                }
            })(arr=>{
                [...arr]
                    .forEach(el=>{
                        el.src = getURL(`assets/logo/${result.themeId}.webp`);
                    });
            });
        }

        onDomReady(() => {
            // document.body.appendChild(logEl);
            injectStyle("styles/design/for_color_themes.css");
        });
    }

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

                const createBgElement = bgImg=>{
                    document.body.insertAdjacentHTML("afterbegin", "<div id=\"bg-img\"></div>");
                    data += "#bg-img{background:url(" + bgImg + ") no-repeat center center;background-size:cover;background-color:#000;width:100%;height:100%;position:fixed;top:0;left:0}";

                    // AÇIKLAMA: Basitçe araç takımı gizlendiğinde ve göründüründe arka plan resmi zıplamaması için boyutunu sabitliyor.
                    try{
                        const wndw = window.visualViewport || window;

                        let bgEl = document.getElementById("bg-img");
                        if (result.maxBgHeight) console.log(result.maxBgHeight),bgEl.style.height = result.maxBgHeight + "px";

                        let bgElHeight = result.maxBgHeight || document.documentElement.clientHeight;
                        let currentOrientation = screen.orientation?.angle || wndw.orientation;

                        function hr() {
                            const newOrientation = screen.orientation?.angle || wndw.orientation;

                            if (newOrientation !== currentOrientation) {
                                currentOrientation = newOrientation;
                            } else if (document.documentElement.clientHeight > bgElHeight) {
                                bgElHeight = document.documentElement.clientHeight;
                                bgEl.style.height = bgElHeight + "px";
                                browserObj.storage.local.set({ maxBgHeight: bgElHeight });
                                console.log(result.maxBgHeight);

                                //wndw.removeEventListener('resize', hr);
                            }
                        }

                        wndw.addEventListener('resize', hr);
                    }catch{}
                }

                if (result.homeBg.startsWith("#")) {
                    data += "body{background:transparent;background-color:transparent!important}html{background:" + result.homeBg + "!important}";
                } else if (result.homeBg.startsWith("file:")){
                    createBgElement(result.homeBg.split(":").slice(2).join(":"));
                } else {
                    createBgElement(result.homeBg);
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
    
        /* if (result.animeLinks) {
            const newScriptElement = document.createElement("script");
            newScriptElement.src = getURL("inject_scripts/link_finder.js");
            document.body.appendChild(newScriptElement);
        } */

    });

});
