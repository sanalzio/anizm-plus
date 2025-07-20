// Tarayıcı uyumluluğu için
/* const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;
const getURL = (URL = "") => browserObj.runtime.getURL(URL); */





// css dilindeki işlevsiz boşlukları seçen bir regexp ifadesi
// const cssMinifyRegexp = /(?=\{)\s|\s(?<=\})|\s(?=\{)|(?<=\})\s|\s{4}|\s{2}|\/\*[^*]*\*\/|\n/g;

// verilen css dosyası içeriğini sıkıştırıp dom objesine ekler
/* function injectStyle(URL) {
    fetch(getURL(URL))
        .then(req => req.text())
        .then(data => {
            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML = data.replace(cssMinifyRegexp, "");
            document.body.appendChild(newStyleElement);
        });
} */






// Ana sayfadaki sağ üstteki linkler için bir sözlük
const links = {
    takvim: "/takvim",
    arama: "/arama",
    "izleme-geçmişim": "/izlemeGecmisim",
    "tavsiye-robotu": "/tavsiyeRobotu",
    fansublar: "/fansublar",
    manga: "https://serimangas.com/",
    "anime-haber": "https://yeppuu.com/",
    kategoriler: "/kategoriler"
}






// Profildeki "İzleme Geçmişim" düğmesini düzeltme
/* try {
    const igBtn = document.querySelector('a[href="izlemeGecmisim"]');
    if(igBtn) igBtn.href = "/izlemeGecmisim";
}
catch {} */





// Anime detayı sayfalarındaki kategoriler başlığına link ekleme
try {
    // burada DOM'un tamamen yüklenip yüklenmediğini kontrol ediyor.
    (function onDomReady(callback) {
        if (document.querySelector(".anizm_sectionTitle span")) {
            callback();
        } else {
            new MutationObserver((_, obs) => {
                if (document.querySelector(".anizm_sectionTitle span")) {
                    obs.disconnect();
                    callback();
                }
            }).observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        }
    })(() => {
        Array.from(
            document.querySelectorAll(".anizm_sectionTitle span")
        ).filter(el => el.textContent.toLowerCase() == "kategoriler")[0]
        .outerHTML = "<a href=\"/kategoriler\" class=\"span\">Kategoriler</a>";
    });
}
catch {}






/* -- Klavye ile bölümlerde dolaşma -- */
/*
 * "CTRL" + "Sağ/Sol ok" tuş kombinasyonları ile bölümler arası geçiş yapmanızı sağlar.
 */

try {
    // burada da DOM'un tamamen yüklenip yüklenmediğini kontrol ediyor.
    (function onDomReady(callback) {
        if (document.querySelector("div:has(>a[data-playerreport],>a[data-title=\"Sorun bildir\"])")) {
            callback();
        } else {
            new MutationObserver((_, obs) => {
                if (document.querySelector("div:has(>a[data-playerreport],>a[data-title=\"Sorun bildir\"])")) {
                    obs.disconnect();
                    callback();
                }
            }).observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        }
    })(() => {

        const episodeButtons = Array.from(document.querySelectorAll("div:has(>a[data-playerreport],>a[data-title=\"Sorun bildir\"])>a:not(a[href*=\"raporver\"])"));
        
        if (episodeButtons[0].textContent.trim().toLocaleLowerCase("tr").startsWith("sonraki"))
            document.addEventListener("keydown", function (event) {
                if (event.ctrlKey && event.key == "ArrowRight") { event.preventDefault();document.querySelector("div:has(>a[data-playerreport],>a[data-title=\"Sorun bildir\"])>a:not(a[href*=\"raporver\"])").click(); }
            });
        else {
            if (episodeButtons.length == 1)
                document.addEventListener("keydown", function (event) {
                    if (event.ctrlKey && event.key == "ArrowLeft") { event.preventDefault();document.querySelector("div:has(>a[data-playerreport],>a[data-title=\"Sorun bildir\"])>a:not(a[href*=\"raporver\"])").click(); }
                });
            else
                document.addEventListener("keydown", function (event) {
                    if (event.ctrlKey && event.key == "ArrowLeft") { event.preventDefault();document.querySelector("div:has(>a[data-playerreport],>a[data-title=\"Sorun bildir\"])>a:not(a[href*=\"raporver\"])").click(); }
                    if (event.ctrlKey && event.key == "ArrowRight") { event.preventDefault();document.querySelectorAll("div:has(>a[data-playerreport],>a[data-title=\"Sorun bildir\"])>a:not(a[href*=\"raporver\"])")[1].click(); }
                });
        }

    });
} catch {
    console.log("Bilgilendirme: Bölüm geçme tuşlarına klavye kısayolları atanamadı.");
}

/* -- Klavye ile bölümlerde dolaşma -- */





// Eklenti ayarlarına göre işlemler

browserObj.storage.local.get(["removeBgs", "themeId", "fansubs", "fansubsActive", "searchActive", "applyColor", "detailedSearch", "minCssActive", "links"], function (result) {

    /* if (result.applyColor && result.themeId) {

        document.querySelectorAll('head > link[rel*="icon"]').forEach(el =>{
            el.href = getURL("assets/favicon/" + result.themeId + ".png");
        });
        document.querySelector('.logo img').src = getURL("assets/logo/" + result.themeId + ".webp");
    } */




    /* -- "izledim/izlemedim" düğmesi yer düzenlemesi -- */
    
    if (result.minCssActive !== false) {

        // player seçenekleri için grafik arayüzü düzenlemesi
        try {
            // burada da DOM'un tamamen yüklenip yüklenmediğini kontrol ediyor.
            (function onDomReady(callback) {
                if (document.getElementById("fanList")) {
                    callback();
                } else {
                    new MutationObserver((_, obs) => {
                        if (document.getElementById("fanList")) {
                            obs.disconnect();
                            callback();
                        }
                    }).observe(document.documentElement, {
                        childList: true,
                        subtree: true,
                    });
                }
            })(() => {
                const cont = document.getElementById("videoFrame");
                const vidContainer = document.getElementsByClassName("episodePlayerContent")[0];
                const fl = document.getElementById("fanList");

                cont.insertBefore(fl, vidContainer);

                fl.classList.remove("mt-5");
            });
            
        } catch {}
    }
    
    /* -- "izledim/izlemedim" düğmesi yer düzenlemesi -- */





        
    // Ana sayfadaki sağ üstteki linkleri düzenle
    try {
        // burada da DOM'un tamamen yüklenip yüklenmediğini kontrol ediyor.
        (function onDomReady(callback) {
            if (document.querySelector("#menuContent ul")) {
                callback();
            } else {
                new MutationObserver((_, obs) => {
                    if (document.querySelector("#menuContent ul")) {
                        obs.disconnect();
                        callback();
                    }
                }).observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        })(() => {
            const linkItems = result.links ?? ["takvim", "tavsiye-robotu", "fansublar", "arama"];
    
            if (result.links.length > 0) {
    
                const listsList = document.querySelector("#menuContent ul");
    
                [...listsList.children]
                    .filter(el => !el.classList.contains("headerSearchContainer"))
                    .forEach(el => el.remove());
        
                    const listHTML = linkItems.map(link => {
                    const linkTitle = link.replace(/-/g, " ");
                    return `<li><a title="${linkTitle.toLocaleUpperCase("tr")}" href="${links[link]}">${linkTitle}</a></li>`;
                }).join("");
    
                listsList.insertAdjacentHTML("afterbegin", listHTML);
            }/*  else {
    
                document.body.insertAdjacentHTML("beforeend", "<style>div.menu:has(ul)>ul>li:not(li:has(a[title=\"TAKVİM\"]),li:has(a[title=\"ARAMA\"]),li:has(a[title=\"Tavsiye Robotu\"]),li:has(a[title=\"Fansublar\"]),li.headerSearchContainer){display:none}</style>");
            } */
        });
    } catch {}


    if (result.detailedSearch !== false)
        // burada da DOM'un tamamen yüklenip yüklenmediğini kontrol ediyor.
        (function onDomReady(callback) {
            if (document.querySelector(".searchTypeSelection .searchTypeOption")) {
                callback();
            } else {
                new MutationObserver((_, obs) => {
                    if (document.querySelector(".searchTypeSelection .searchTypeOption")) {
                        obs.disconnect();
                        callback();
                    }
                }).observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        })(() => {
            document.querySelector(".searchTypeSelection .searchTypeOption[data-type=\"detailed\"]").click();
        });

});
