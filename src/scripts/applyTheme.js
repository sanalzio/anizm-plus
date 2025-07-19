let themeIds = [
    "orange",
    "green",
    "blue",
    "pink",
    "purple",
    "red",
    "gray"
];

let faviconPath = new Object();
let logoPath = new Object();
let logoSmallPath = new Object();

themeIds.forEach(themeId => {
    faviconPath[themeId] = "./assets/favicon/"+ themeId +".png";
    logoPath[themeId] = "./assets/logo/"+ themeId +".webp";
    logoSmallPath[themeId] = "./assets/icon/"+ themeId +".png";
});

let themeLink = document.getElementById("theme-link");
let logoImg = document.getElementById("logo");
let faviconLink = document.getElementById("favicon");


function switchTheme(themeId) {
    if (!themeIds.includes(themeId))
        return;

    try {
        faviconLink.href = faviconPath[themeId];
        logoSmallImg.src = logoSmallPath[themeId];
    } catch{}

    logoImg.src = logoPath[themeId];

    themeLink.href = `styles/colors/${themeId}_theme.css`;
}

document.addEventListener("DOMContentLoaded", () => {
    browserObj.storage.local.get(["themeId", "applyColor"], function (result) {
        if (result.applyColor && result.themeId)
            switchTheme(result.themeId || "orange");
    });
});
