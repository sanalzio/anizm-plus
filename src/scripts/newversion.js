var params = new URL(location.href).searchParams;
if (window.location.hash) {
    document.getElementById("new-version").textContent = window.location.hash.slice(1);
} else {
    window.close();
}


// Tarayıcı uyumluluğu için
const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;
const version = browserObj.runtime.getManifest().version;


document.getElementById("version").textContent = version;
document.getElementById("this-version").textContent = version;
