// Tarayıcı uyumluluğu için
const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;

browserObj.runtime.onStartup.addListener(() => {
    fetch(
        "https://raw.githubusercontent.com/sanalzio/anizm-plus/refs/heads/master/src/manifest.json"
    ).then(res => res.text())
    .then(data => {
        const newVersion = data.match(/(["'])version\1\s*?:\s*?(["'])([\d.]+)\2/i)[3];
        if (newVersion && newVersion > browserObj.runtime.getManifest().version)
            browserObj.tabs.create({ url: "newversion.html#" + newVersion });
    });
});

const getURL = (URL = "") => browserObj.runtime.getURL(URL);


let blockList = [
    "/js/poo-undr.js",
    "/js/poo-und.js",
    "/js/pooo-und.js",
    "/js/pund.js",
    "/js/avgrtbdasdwsawqs.js",
    "https://cdn.jsdelivr.net/npm/devtools-detector",
    "/metrics",
    "ugloubeehun.com"
];

(async function () {
    try {
        fetch("https://raw.githubusercontent.com/sanalzio/anizm-plus/refs/heads/master/src/blocklist.json")
            .then(res => res.json())
            .then(json => {
                if (json.length > 0)
                    blockList = [...blockList, ...json];
            });
    } catch {}
})();

const settings = new Object();

// storage'dan ilk değeri al
browserObj.storage.local.get(["searchActive", "applyColor", "themeId", "fansubs", "players"], (data) => { //, "fansubsActive"
    if (typeof data.searchActive !== "undefined") {
        settings.searchActive = data.searchActive;
    }
    /* if (typeof data.fansubsActive !== "undefined") {
        settings.fansubsActive = data.fansubsActive;
    } */
    if (typeof data.applyColor !== "undefined") {
        settings.applyColor = data.applyColor;
        settings.themeId = data.themeId;
    }

    if (data.fansubs && typeof data.fansubs !== "string") {
        browserObj.storage.local.set({fansubs:data.fansubs.map(f => f.replaceAll(",", "\\,")).join(",")})
    }
    if (data.players && typeof data.players !== "string") {
        browserObj.storage.local.set({players:data.players.map(f => f.replaceAll(",", "\\,")).join(",")})
    }
});

// değer değişirse güncelle
browserObj.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.searchActive) {
        settings.searchActive = changes.searchActive.newValue;
    }
    if (area === "local" && changes.applyColor) {
        settings.applyColor = changes.applyColor.newValue;
    }
    /* if (area === "local" && changes.fansubsActive) {
        settings.fansubsActive = changes.fansubsActive.newValue;
    } */
    if (area === "local" && changes.themeId) {
        settings.themeId = changes.themeId.newValue;
    }
});


browserObj.webRequest.onBeforeRequest.addListener(
    function (details) {

        if (blockList.some(el => details.url.includes(el))) return { cancel: true };

        if (settings.searchActive !== false && details.url.includes("/js/custom/searchOverlayOnce.js"))
            return { redirectUrl: getURL("replace_scripts/searchOverlayOnce.js") };

        if (details.url.includes("/js/custom.js"))
            return { redirectUrl: getURL("replace_scripts/custom.js") };

        if (details.url.includes("/js/custom/episodea.js")) // settings.fansubsActive && 
            return { redirectUrl: getURL("replace_scripts/episodea.js") };


        if (details.url.includes("/upload/assets/logo.webp") && settings.applyColor)
            return { redirectUrl: getURL("assets/logo/"+ settings.themeId +".webp") };

        if ((details.url.includes("/favicon.ico") || details.url.includes("/images/logo_")) && settings.applyColor)
            return { redirectUrl: getURL("assets/favicon/" + settings.themeId + ".png") };


        if (details.url.split("#")[0].split("?")[0].endsWith("/mal.svg"))
            return { redirectUrl: getURL("assets/mal.svg") };


        if (settings.searchActive !== false && (details.url.split("#")[0].split("?")[0].endsWith("/arama"))) {

            if (settings.applyColor !== true) {
                return { redirectUrl: getURL("arama.html?hostname=" + details.url.split("/")[2]) };
            }

            return { redirectUrl: getURL("arama.html?hostname=" + details.url.split("/")[2]) + "&theme=" + settings.themeId };
        }
    },
    {
        urls: [
            "https://anizle.com/*",
            "https://puffytr.com/*",
            "https://anizm.pro/*",
            "https://anizm.net/*",

            "https://cdn.jsdelivr.net/npm/devtools-detector",
            "https://cdn.jsdelivr.net/npm/devtools-detector/",

            "https://ugloubeehun.com/",
            "*://ugloubeehun.com/*",
            "http://ugloubeehun.com/*"
        ]
    },
    ["blocking"]
);
