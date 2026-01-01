window.browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;
window.getURL = (URL = "") => browserObj.runtime.getURL(URL);


browserObj.storage.local.get([
    "watched",
    "lastSeen"
], function (result) {


    if (result.watched) document.documentElement.insertAdjacentHTML("afterbegin", '<data id="disablewatch">');
    if (result.lastSeen) document.documentElement.insertAdjacentHTML("afterbegin", '<data id="disablelastseen">');

    const myScript = document.createElement('script');
    myScript.src = getURL("inject_scripts/better_watched.js");
    myScript.async = false;
    document.documentElement.appendChild(myScript);

});