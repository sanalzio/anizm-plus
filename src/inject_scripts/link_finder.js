window.browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL
    ? browser
    : chrome
);
window.getURL = (URL = "") => browserObj.runtime.getURL(URL);

var DOMAIN = "anizm.pro";



function getFromStorage(...keys) {
    return new Promise((resolve) => {
        browserObj.storage.local.get([...keys], (result) => {
            resolve(result);
        });
    });
}



async function startWorker(url) {
    const workerUrl = getURL(url);
    
    // 1. Script dosyasını fetch ile çekin
    const response = await fetch(workerUrl);
    const scriptText = await response.text();

    // 2. İçeriği bir Blob nesnesine dönüştürün
    const blob = new Blob([scriptText], { type: 'application/javascript' });
    
    // 3. Bu blob için geçici bir URL oluşturun
    const blobUrl = URL.createObjectURL(blob);

    // 4. Worker'ı bu URL ile başlatın
    const worker = new Worker(blobUrl);
    
    return worker;
}




browserObj.storage.local.get(["animeLinks"], async (r) => {
    if (typeof r.animeLinks == "boolean" && r.animeLinks === false) return;

    await (async function onDomReady(callback) {
        if (document.getElementById("pageContent")) {
            await callback();
        } else {
            new MutationObserver(async (_, obs) => {
                if (document.getElementById("pageContent")) {
                    obs.disconnect();
                    await callback();
                }
            }).observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        }
    })(async () => {
        // Eğer kullanıcı bir anime detayı sayfasında ise animenin başlığını alır
        const animeTitle =
            document.getElementsByClassName("animeDetayInfoWrapper").length >
                0 &&
            document.getElementsByClassName("anizm_pageTitle") &&
            document
                .getElementsByClassName("anizm_pageTitle")[0]
                .textContent.replace(/\s\s+/g, " ")
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
                .insertAdjacentHTML(
                    "beforebegin",
                    `<li id="linksRow" class="dataRow"><span class="dataTitle">Bağlantılar</span><span id="linksValueRow" class="dataValue"><div id="links-loader"></div></span></li>`
                );
            // const row = document.getElementById("linksRow");
            const loader = document.getElementById("links-loader");


            function addLinks(malID, alURL = undefined) {

                // const valueRow = document.getElementById("linksValueRow");

                loader.insertAdjacentHTML(
                    "beforebegin",
                    `<a target="_blank" class="mal-link" href="https://myanimelist.net/anime/${malID}"><img class="mal-img" src="${getURL(
                        "assets/mal.svg"
                    )}" alt="MAL sayfası"></a>`
                );


                if (alURL) {
                    loader.insertAdjacentHTML(
                                "beforebegin",
                                `<a target="_blank" class="anilist-link" href="${alURL}"><img class="anilist-img" src="${getURL(
                                    "assets/anilist.svg"
                                )}" alt="MAL sayfası"></a>`
                            );
                    loader.remove();
                    return;
                }

                getAnilistUrl(malID)
                    .then((url) => {
                        if (url) {
                            loader.insertAdjacentHTML(
                                "beforebegin",
                                `<a target="_blank" class="anilist-link" href="${url}"><img class="anilist-img" src="${getURL(
                                    "assets/anilist.svg"
                                )}" alt="MAL sayfası"></a>`
                            );
                            browserObj.storage.local.set({
                                ["alURL-" + animeTitle]: url
                            });
                        }
                        loader.remove();
                    })
                    .catch(() => loader.remove());
            }

            const cacheMalIDKey = "malID-" + animeTitle,
                  cacheAlURLKey = "alURL-" + animeTitle,
                  cacheResult = await getFromStorage(cacheMalIDKey, cacheAlURLKey);

            if (cacheResult[cacheMalIDKey]) {
                console.log("Anime kayıtlardan bulundu.");
                return addLinks(cacheResult[cacheMalIDKey], cacheResult[cacheAlURLKey]);
            }


            async function getAnilistUrl(malId) {

                try {
                    const response = await fetch("https://graphql.anilist.co", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: `{"query":"query{Media(idMal: ${malId}, type: ANIME){siteUrl}}"}`,
                    });

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
                const title =
                    item.info_title ||
                    item.info_titleoriginal ||
                    item.info_titleenglish ||
                    item.info_japanese;
                if (
                    title
                        .replace(/\s\s+/g, " ")
                        .trim()
                        .toLowerCase()
                        .replaceAll("\t", "")
                        .replaceAll("\r", "") == animeTitle
                ) {
                    found = true;

                    browserObj.storage.local.set({
                        ["malID-" + animeTitle]: item.info_malid
                    });

                    addLinks(item.info_malid);

                    return true; // Anime bulunduğu için arama işlemini durduruyor.
                }
            }



            startWorker("inject_scripts/link_finder_worker.js").then(worker => {

                worker.addEventListener('message', function (e) {
                    if (e.data) {
                        const stopped = processItem(e.data);
                        if (stopped) worker.postMessage("!stop");
                    }
                });

                worker.postMessage(`https://${DOMAIN}/getAnimeListForSearch`);

            });


            /* streamJsonObjects(
                `https://${DOMAIN}/getAnimeListForSearch`,
                processItem
            )
                .then(() => {
                    if (found) {
                        console.log("Anime bulundu.");
                    } else {
                        row.remove();
                        console.log("Anime bulunamadı.");
                    }
                })
                .catch(console.error); */
        }
    });
});
