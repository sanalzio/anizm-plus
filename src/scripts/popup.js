// Tarayıcı uyumluluğu için
const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;






let HOSTNAME;
let themeId;

const searchBtn = document.getElementById("search-btn");
const clearQueryBtn = document.getElementById("clear-query");
const queryInput = document.getElementById("query");

searchBtn.addEventListener("click", () => {

    let parameters = "";

    if (HOSTNAME) parameters = "hostname=" + HOSTNAME + "&";
    //if (themeId) parameters = "theme=" + themeId + "&";

    window.open(`./arama.html?${parameters}q=${encodeURIComponent(queryInput.value)}`, "_blank");

});

queryInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchBtn.click();
    }
});

queryInput.addEventListener("input", () => {
    if (queryInput.value === "") {
        clearQueryBtn.style.display = "none";
    } else {
        clearQueryBtn.style.display = "flex";
    }
});

clearQueryBtn.addEventListener("click", () => {
    queryInput.value = "";
    clearQueryBtn.style.display = "none";
    queryInput.focus();
});




// Ayarlar düğmesi işlevi
document.getElementById('options-link').addEventListener("click", e=>{
    e.preventDefault();
    browserObj.tabs.create({ url: "/pages/options.html" });
});






// Eklenti ayarlarını uygula

document.addEventListener("DOMContentLoaded", () => {

    if (window.innerWidth !== document.body.clientWidth) {
        document.documentElement.style.width = "100%";
        document.getElementsByTagName('footer')[0].style.marginBottom = "10rem";
    }

    browserObj.storage.local.get(["nickname", "hostname", "applyColor", "themeId"], result => {

        if (result.hostname) HOSTNAME = result.hostname;
        if (result.applyColor) themeId = result.themeId;

        if (HOSTNAME)
            [...document.getElementsByClassName("link")].forEach(el => {
                el.href = el.href.replace("anizm.pro", HOSTNAME);
            });

        if (result.nickname) {
            document.getElementById("list-links-container").style.display = "flex";
            [...document.getElementsByClassName("list-link")].forEach(el => {
                let newHref = el.href;
                if (HOSTNAME) newHref = newHref.replace("anizm.pro", HOSTNAME);
                newHref = newHref.replace("$NICKNAME", result.nickname);
                el.href = newHref;
            });
        }

    });
});
