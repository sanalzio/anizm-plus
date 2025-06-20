// Tarayıcı uyumluluğu için
const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;
const getURL = (URL = "") => browserObj.runtime.getURL(URL);




// oynatıcı url'lerine göre ayarlar
const jw_logo_title = ".jw-poster,.jw-title,.jw-logo{display:none!important}";
const jw_margin = ".jw-controls{margin-top:-1px}";
const vidmoly_margin = ".jw-controls{margin-top:-2px}";
const sistenn = ".player-logo{display:none!important}:root{--media-slider-track-bg:#00000088!important;--media-slider-track-progress-bg:#00000066!important;--video-brand:var(--primaryColorDarker)!important;--video-time-bg:#000000AA!important;--media-slider-value-color:#FFFFFFCC!important;--media-tooltip-bg-color: var(--primaryColorDarker)!important}:where(.vds-video-layout){--media-focus-ring:none!important}:where(.vds-menu-items){--color-inverse:#f0f0f0;--color-gray-50:rgba(255, 255, 255, 0.05);--color-gray-100:rgba(255, 255, 255, 0.1);--color-gray-200:rgba(255, 255, 255, 0.15);--color-gray-300:#2a2a2a;--color-gray-400:#1a1a1a;--text-color:#f0f0f0;--text-secondary-color:#999;--root-border:1px solid #444;--font-family:sans-serif;--font-size:14px;--font-weight:500;--root-bg:#1a1a1a;--root-padding:12px;--root-border-radius:4px;--divider:1px solid rgba(255, 255, 255, 0.05);--section-bg:#2a2a2a;--section-border:unset;--section-divider:var(--divider);--top-bar-bg:rgba(255, 255, 255, 0.05);--top-bar-divider:transparent;--text-hint-color:#999;--chapter-divider:var(--divider);--chapter-active-bg:rgba(255, 255, 255, 0.05);--chapter-active-border-left:unset;--chapter-progress-bg:#f0f0f0;--chapter-time-font-size:12px;--chapter-time-font-weight:500;--chapter-time-gap:6px;--chapter-duration-bg:unset;--item-border:0;--item-bg:transparent;--item-hover-bg:#3a3a3a;--item-icon-size:18px;--item-padding:10px;--item-min-height:40px;--item-border-radius:2px;--scrollbar-track-bg:transparent;--scrollbar-thumb-bg:#444;--webkit-scrollbar-bg:#1a1a1a;--webkit-scrollbar-track-bg:#333;--checkbox-bg:rgba(255, 255, 255, 0.12);--checkbox-active-bg:#1ba13f;--checkbox-handle-bg:#1a1a1a;--checkbox-handle-border:unset;--radio-icon-color:#f0f0f0}#player-button:hover{background:var(--primaryColor)}";

const players = [
    { // google drive player bottom left corner
        url: "https://youtube.googleapis.com/embed/",
        css: ".ytp-big-mode .ytp-prev-button::before,.ytp-big-mode .ytp-play-button:not(.ytp-play-button-playlist)::before{display:none!important}"
    },
    { // sibnet white outline
        url: "https://video.sibnet.ru/shell.php?videoid=",
        css: "*{outline:none!important}"
    },
    {
        url: "https://sistenn.uns.bio/",
        css: sistenn
    },
    {
        url: "https://anizm.rpmvid.com/",
        css: sistenn
    },
    {
        url: "https://vidmoly.to/embed-",
        css: jw_logo_title + vidmoly_margin
    },
    {
        url: "https://optraco.top/explorer/",
        css: jw_logo_title + jw_margin
    },
    {
        url: "https://anizmplayer.com/",
        css: jw_logo_title + jw_margin
    },
    {
        url: "https://anizm.strp2p.com/",
        css: jw_logo_title + jw_margin
    }
];




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




// verilen css kodunu dom objesine ekler
function injectCSS(content, themeId) {
    fetch(getURL("styles/colors/" + (themeId != undefined ? themeId : "orange") + "_theme.css"))
        .then(req => req.text())
        .then(data => {
            const newStyleElement = document.createElement("style");
            newStyleElement.innerHTML =
                data.replace(/(?=\{)\s|\s(?<=\})|\s(?=\{)|(?<=\})\s|\s{4}|\s{2}|\/\*[^*]*\*\/|\n/g, "") +
                content;
            document.documentElement.appendChild(newStyleElement);
        });
}




browserObj.storage.local.get(["player", "applyColor", "themeId"], function (result) {

    if (result.player === false) return;

    players.forEach(playerObj => {
        if (window.location.href.startsWith(playerObj.url))
            onDomReady(() => {
                injectCSS(playerObj.css, result.applyColor ? result.themeId : null);
            });
    });

});
