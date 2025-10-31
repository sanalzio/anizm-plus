var DOMAIN = "anizm.pro";

(typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL
    ? browser
    : chrome
).storage.local.get(["animeLinks"], (r) => {
    if (typeof r.animeLinks == "boolean" && r.animeLinks === false) return;

    (function onDomReady(callback) {
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
            const row = document.getElementById("linksRow");
            const loader = document.getElementById("links-loader");

            async function getAnilistUrl(malId) {
                const query = `query($id: Int, $type: MediaType){Media(idMal: $id, type: $type){siteUrl}}`;
                const data = JSON.stringify({
                    query,
                    variables: { id: malId, type: "ANIME" },
                });

                try {
                    const response = await fetch("https://graphql.anilist.co", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: data,
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

                    // const valueRow = document.getElementById("linksValueRow");

                    loader.insertAdjacentHTML(
                        "beforebegin",
                        `<a target="_blank" class="mal-link" href="https://myanimelist.net/anime/${item.info_malid.toString()}"><img class="mal-img" src="${getURL(
                            "assets/mal.svg"
                        )}" alt="MAL sayfası"></a>`
                    );

                    getAnilistUrl(parseInt(item.info_malid))
                        .then((url) => {
                            if (url)
                                loader.insertAdjacentHTML(
                                    "beforebegin",
                                    `<a target="_blank" class="anilist-link" href="${url}"><img class="anilist-img" src="${getURL(
                                        "assets/anilist.svg"
                                    )}" alt="MAL sayfası"></a>`
                                );
                            loader.remove();
                        })
                        .catch(() => loader.remove());

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
            streamJsonObjects(
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
                .catch(console.error);
        }
    });
});
