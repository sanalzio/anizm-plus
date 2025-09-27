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

fetch("https://sanalzio.github.io/anizm-plus/changelog")
    .then(res => res.text())
    .then(changelogContent => {
        try {
            if (changelogContent.match(/<h1[\s\S]*?<\/h1>/ig)[1].match(/>([\d.]+)</)[1] != window.location.hash.slice(1))
                return;

            document.getElementById('features').innerHTML = changelogContent.match(/<ul[\s\S]*?<\/ul>/i);
        } catch {}
    });
