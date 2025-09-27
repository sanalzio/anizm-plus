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

browserObj.storage.local.get(["removeBgs", "themeId", "fansubs", "fansubsActive", "applyColor", "detailedSearch", "minCssActive", "links", "animeLinks", "bottomControls"], function (result) {

    /* if (result.applyColor && result.themeId) {

        document.querySelectorAll('head > link[rel*="icon"]').forEach(el =>{
            el.href = getURL("assets/favicon/" + result.themeId + ".png");
        });
        document.querySelector('.logo img').src = getURL("assets/logo/" + result.themeId + ".webp");
    } */




    /* -- "izledim/izlemedim" düğmesi yer düzenlemesi -- */
    
    // if (result.minCssActive !== false) {

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
            const translators = document.getElementsByClassName("episodeTranslators")[0];

            if (result.bottomControls) {
                cont.insertBefore(vidContainer, translators);
                translators.style.paddingTop = "10px";
                fl.classList.remove("mt-5");
            } else {
                cont.insertBefore(fl, vidContainer);
                fl.classList.remove("mt-5");
            }
        });
        
    } catch {}
    // }
    
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






    if (result.animeLinks) (function onDomReady(callback) {
        if (document.getElementById("pageContent")) {
            callback();
        } else {
            new MutationObserver((_, obs) => {
                if (document.getElementById("pageContent")) {
                    obs.disconnect();
                    callback();
                }
            }).observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        }
    })(() => {
        // Eğer kullanıcı bir anime detayı sayfasında ise animenin başlığını alır
        const animeTitle =
            document.getElementsByClassName("animeDetayInfoWrapper").length > 0 &&
            document.getElementsByClassName("anizm_pageTitle") &&
            document
                .getElementsByClassName("anizm_pageTitle")[0]
                .textContent
                .replace(/\s\s+/g, " ")
                .trim()
                .toLowerCase()
                .replaceAll("\t", "")
                .replaceAll("\r", "");

        // Eğer kullanıcı bir anime detayı sayfasında ise animenin "MyAnimeList" ve "AniList" bağlantıları için düğmeler ekleme işlemi.
        // Not: Bu kodu basitçe yazıp yapay zekaya tamamlattrıdım bu arada. Pek önemli değil ama commentler ondan dolayı.
        // Açıklmak gerekirse animelerin tümünün bilgisinin bulunduğu veri setini parça parça çekerek tümünü çekmeden hızlıca çekme esnasında bulmaya yarıyor.
        if (animeTitle) {


            document
                .getElementsByClassName("episodeButtons")[0]
                .insertAdjacentHTML("beforebegin",
                    `<li id="linksRow" class="dataRow"><span class="dataTitle">Bağlantılar</span><span id="linksValueRow" class="dataValue"><div id="links-loader"></div></span></li>`
                );
            const row = document.getElementById("linksRow");
            const loader = document.getElementById("links-loader");


            async function getAnilistUrl(malId) {
                const query = `query($id: Int, $type: MediaType){Media(idMal: $id, type: $type){siteUrl}}`;
                const data = JSON.stringify({
                    query,
                    variables: { id: malId, type: "ANIME" },
                });

                try {
                    const response = await fetch(
                        "https://graphql.anilist.co",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: data,
                        }
                    );

                    const responseData = await response.json();
                    return responseData.data.Media.siteUrl || null;
                } catch (error) {
                    console.error("Error fetching data:", error);
                    return null;
                }
            }


            let found;

            function processItem(item) {
                // Burada her bir JSON nesnesi üzerinde başlık uyşuşması arıyor.
                const title = item.info_title || item.info_titleoriginal || item.info_titleenglish || item.info_japanese;
                if (
                    title
                        .replace(/\s\s+/g, " ")
                        .trim()
                        .toLowerCase()
                        .replaceAll("\t", "")
                        .replaceAll("\r", "")
                    ==
                    animeTitle
                ) {
                    found = true;

                    // const valueRow = document.getElementById("linksValueRow");

                    loader.insertAdjacentHTML("beforebegin", `<a target="_blank" class="mal-link" href="https://myanimelist.net/anime/${item.info_malid.toString()}"><img class="mal-img" src="/mal.svg" alt="MAL sayfası"></a>`);

                    getAnilistUrl(parseInt(item.info_malid))
                        .then(url => {
                            loader.insertAdjacentHTML("beforebegin", `<a target="_blank" class="anilist-link" href="${url}"><img class="anilist-img" src="/anilist.svg" alt="MAL sayfası"></a>`);
                            loader.remove();
                        })
                        .catch(()=>loader.remove());

                    return true; // Anime bulunduğu için arama işlemini durduruyor.
                }
            }

            async function streamJsonObjects(url, onItem) {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

                const reader = res.body.getReader();
                const decoder = new TextDecoder("utf-8");

                let buffer = "";
                let braceDepth = 0;
                let inString = false;
                let escapeNext = false;
                let started = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    for (let ch of chunk) {
                        // Başlangıçta sadece '[' bekle
                        if (!started) {
                            if (ch === "[") started = true;
                            continue;
                        }

                        // Eğer henüz nesne başlamadıysa '{' bekle
                        if (braceDepth === 0 && ch !== "{") {
                            if (ch === "]") return; // Stream bitti
                            continue;
                        }

                        buffer += ch;

                        if (escapeNext) {
                            escapeNext = false;
                            continue;
                        }

                        if (ch === "\\") {
                            escapeNext = true;
                            continue;
                        }

                        if (ch === '"') {
                            inString = !inString;
                            continue;
                        }

                        if (!inString) {
                            if (ch === "{") {
                                braceDepth++;
                            } else if (ch === "}") {
                                braceDepth--;
                            }
                        }

                        if (braceDepth === 0 && buffer.trim()) {
                            try {
                                const obj = JSON.parse(buffer);
                                if (onItem?.(obj)) break; // Callback
                            } catch (e) {
                                console.error(
                                    "JSON parse error:",
                                    e,
                                    "Buffer was:",
                                    buffer
                                );
                            }
                            buffer = "";
                        }
                    }
                }
            }


            // Kullanımı:
            streamJsonObjects("/getAnimeListForSearch", processItem)
                .then(() => {
                    if (found) {
                        console.log("Anime bulundu.");
                    } else {
                        row.remove();
                        console.log("Anime bulunamadı.");
                    }
                }).catch(console.error);
        }
    });
});
