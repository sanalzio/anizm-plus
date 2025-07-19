// Tarayıcı uyumluluğu için
const browserObj = (typeof browser !== "undefined" && browser.runtime && browser.runtime.getURL) ? browser : chrome;






document.getElementById("version").textContent = browserObj.runtime.getManifest().version;






const themeSelect = document.getElementById("theme-select");
themeSelect.addEventListener("change", () => {
    switchTheme(themeSelect.value);
});


const applyColor = document.getElementById("apply-color");
applyColor.addEventListener("change", () => {

    if (!applyColor.checked) {
        document.getElementById("color-theme-select-container").setAttribute("disabled", "");
        switchTheme("orange");
    }

    else {
        document.getElementById("color-theme-select-container").removeAttribute("disabled");
        switchTheme(themeSelect.value);
    }
});

const bgSelContainers = document.getElementsByClassName("bg-select-container");
const changeBgsChBox = document.getElementById("ch-bgs");

changeBgsChBox.addEventListener("change", () => {

    if (!changeBgsChBox.checked) {
        browserObj.storage.local.set({
            changeBgs: false
        });
        for (let i = 0; i < bgSelContainers.length; i++) {
            bgSelContainers[i].setAttribute("disabled", "");
        }
    }

    else {
        browserObj.storage.local.set({
            changeBgs: true
        });
        for (let i = 0; i < bgSelContainers.length; i++) {
            bgSelContainers[i].removeAttribute("disabled");
        }
    }
});

for (let i = 0; i < bgSelContainers.length; i++) {
    const bgSelCont = bgSelContainers[i];
    const bgKey = bgSelCont.getAttribute("key");
    const bgName = bgSelCont.getAttribute("name");

    const bgSel = bgSelCont.getElementsByClassName("bg-select")[0];
    const colorInputElement = document.getElementById(bgName + "-color");
    const URLinputElement = document.getElementById(bgName + "-url");
    const fileInputBtnElement = document.getElementById(bgName + "-file-sel-btn");
    const fileInputElement = document.getElementById(bgName + "-file");
    const selectedFileElement = document.getElementById(bgName + "-seled-file");

    bgSel.addEventListener("change", () => {
        switch (bgSel.value) {
            case "default":
                browserObj.storage.local.set({
                    [bgKey]: "def"
                });
                fileInputBtnElement.style.display = "none";
                colorInputElement.style.display = "none";
                URLinputElement.style.display = "none";
                selectedFileElement.style.display = "none";
                break;

            default:
                browserObj.storage.local.set({
                    [bgKey]: "none"
                });
                fileInputBtnElement.style.display = "none";
                colorInputElement.style.display = "none";
                URLinputElement.style.display = "none";
                selectedFileElement.style.display = "none";
                break;

            case "url":
                browserObj.storage.local.get(bgKey, (results) => {
                    if (
                        results[bgKey] &&
                        !results[bgKey].startsWith("#") &&
                        !results[bgKey].startsWith("file:") &&
                        !results[bgKey] == "none" &&
                        !results[bgKey] == "def"
                    )
                        URLinputElement.value = results[bgKey];
                    else
                        browserObj.storage.local.set({
                            [bgKey]: "none",
                        });
                });
                URLinputElement.style.display = "block";
                colorInputElement.style.display = "none";
                fileInputBtnElement.style.display = "none";
                selectedFileElement.style.display = "none";
                break;

            case "color":
                browserObj.storage.local.get(bgKey, (results) => {
                    if (results[bgKey] && results[bgKey].startsWith("#"))
                        colorInputElement.value = results[bgKey];
                    else
                        browserObj.storage.local.set({
                            [bgKey]: colorInputElement.value
                        });
                });
                colorInputElement.style.display = "block";
                URLinputElement.style.display = "none";
                fileInputBtnElement.style.display = "none";
                selectedFileElement.style.display = "none";
                break;

            case "upload":
                browserObj.storage.local.get(bgKey, (results) => {
                    if (results[bgKey] && results[bgKey].startsWith("file:"))
                        selectedFileElement.innerHTML = results[bgKey].split(":")[1];
                    else {
                        browserObj.storage.local.set({
                            [bgKey]: "none"
                        });
                        selectedFileElement.innerHTML = "Dosya seçilmedi.";
                    }
                });
                fileInputBtnElement.style.display = "block";
                selectedFileElement.style.display = "block";
                colorInputElement.style.display = "none";
                URLinputElement.style.display = "none";
                break;
        }
    });

    colorInputElement.addEventListener("change", () => {
        browserObj.storage.local.set({
            [bgKey]: colorInputElement.value
        });
    });

    URLinputElement.addEventListener("input", () => {
        if (URLinputElement.value.startsWith("file:")) {
            alert("Yerel dosya bağlantısı kullanılamaz.");
            return;
        }
        browserObj.storage.local.set({
            [bgKey]: URLinputElement.value
        });
    });

    fileInputElement.addEventListener('change', function(event) {
        console.log(event.target.files);
        const file = event.target.files[0];
        if (!file) return;

        const acceptedImageTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/svg+xml",
            "image/webp",
            "image/gif"
        ];

        if (!acceptedImageTypes.includes(file.type)) {
            alert("Lütfen geçerli bir resim dosyası seçin (PNG, JPEG, SVG, WEBP, GIF).");
            return;
        }

        selectedFileElement.innerHTML = "..."

        const reader = new FileReader();

        reader.onload = function () {
            const base64Image = reader.result;

            browserObj.storage.local.set({ [bgKey]: "file:" + file.name + ":" + base64Image }/* , () => {
                alert("Resim dosyası başarıyla kaydedildi!");
            } */);
        };

        reader.readAsDataURL(file);

        selectedFileElement.innerHTML = file.name;

        event.target.value = "";
    });
}


document.getElementById("fansubs-active").addEventListener("change", (e) => {
    if (!e.target.checked)
        document.getElementById("fansubs").setAttribute("disabled", "");
    else
        document.getElementById("fansubs").removeAttribute("disabled");
});
document.getElementById("players-active").addEventListener("change", (e) => {
    if (!e.target.checked)
        document.getElementById("players").setAttribute("disabled", "");
    else
        document.getElementById("players").removeAttribute("disabled");
});


// change with scroll
themeSelect.addEventListener('wheel', (event) => {
    event.preventDefault();

    const options = Array.from(themeSelect.options);
    const currentIndex = themeSelect.selectedIndex;

    if (event.deltaY > 0) {
        if (currentIndex < options.length - 1) {
            themeSelect.selectedIndex = currentIndex + 1;
        }
    } else {
        if (currentIndex > 0) {
            themeSelect.selectedIndex = currentIndex - 1;
        }
    }

    browserObj.storage.local.set({
        themeId: themeSelect.value
    });

    themeSelect.dispatchEvent(new Event('change'));
});






const linksSelect = document.getElementById("links-select");
let links;

function saveLinks(links) {
    browserObj.storage.local.set({
        links: links
    });
}

const Links = {

    apply: (linksArray) => {
        links = linksArray;
        document.getElementById("links").innerHTML = linksArray
            .map(
                link =>
                    '<div class="link"value="' +
                link +
                '">' +
                link.replaceAll("-", " ") +
                '</div>'
            ).join("");
    },

    add: (linkValue) => {
        links.push(linkValue);
        document.getElementById("links").innerHTML += '<div class="link"value="' +
            linkValue +
            '">' +
            linkValue.replaceAll("-", " ") +
            '</div>'
        saveLinks(links);
    }

};

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("link")) {
        const element = event.target;

        links.splice(Array.from(element.parentElement.children).indexOf(element), 1);

        element.remove();
        saveLinks(links);
    }
});

linksSelect.value = "";
let addLink = event => {
    if (!event.target.value) return;
    Links.add(event.target.value);
    event.target.value = "";
    saveLinks(links);
};
linksSelect.addEventListener("change", addLink);






// Originally inspired by  David Walsh (https://davidwalsh.name/javascript-debounce-function)
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for `wait` milliseconds.
const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};






const hideSavedCheck = debounce((optionId) => {
    document.getElementById(optionId + "-saved").style.display = "none";
}, 1500);

function saved(optionId) {
    document.getElementById(optionId + "-saved").style.display = "inline-block";

    hideSavedCheck(optionId);
}






const WAIT_MS_FOR_SAVE = 500;
const WAIT_MS_FOR_USERCSS_SAVE = 2000;

const saveValue = debounce((k, val) => {
    browserObj.storage.local.set({
        [k]: val
    });

    saved(k);
}, WAIT_MS_FOR_SAVE);

const saveFansubs = debounce((val) => {
    const fansubs = val != "" ?
        val
            /* .split(/(?<!\\),/)
            .map(f => f.replaceAll("\\,", ",").toLocaleLowerCase("tr")) */ :
        null;

        browserObj.storage.local.set({
            fansubs: fansubs
        });

        saved("fansubs");
}, WAIT_MS_FOR_SAVE);

const savePlayers = debounce((val) => {
    const players = val != "" ?
        val
            /* .split(/(?<!\\),/)
            .map(f => f.replaceAll("\\,", ",").toLocaleLowerCase("tr")) */ :
        null;

        browserObj.storage.local.set({
            players: players
        });

        saved("players");
}, WAIT_MS_FOR_SAVE);

document.addEventListener("change", function (event) {
    const el = event.target
    if (el.classList.contains("option")) {
        switch (el.id) {

            case "search":
                browserObj.storage.local.set({
                    searchActive: el.checked
                });
                break;

            case "detailed-search":
                browserObj.storage.local.set({
                    detailedSearch: el.checked
                });
                break;

            case "fansubs-active":
                browserObj.storage.local.set({
                    fansubsActive: el.checked
                });
                break;

            case "players-active":
                browserObj.storage.local.set({
                    selectPlayer: el.checked
                });
                break;

            case "min-theme":
                browserObj.storage.local.set({
                    minCssActive: el.checked
                });
                break;

            case "apply-color":
                browserObj.storage.local.set({
                    applyColor: el.checked
                });
                break;

            case "theme-select":
                browserObj.storage.local.set({
                    themeId: el.value
                });
                break;

            case "rem-bgs":
                browserObj.storage.local.set({
                    removeBgs: el.checked
                });
                break;

            case "player-css":
                browserObj.storage.local.set({
                    player: el.checked
                });
                break;

            case "last-seen":
                browserObj.storage.local.set({
                    lastSeen: el.checked
                });
                break;

            default:
                break;
        }
    }
});

document.addEventListener("input", function (event) {
    const el = event.target
    if (el.classList.contains("option")) {
        switch (el.id) {

            case "fansubs":
                document.getElementById("fansubs-saved").style.display = "none";
                saveFansubs(el.value);
                break;

            case "players":
                document.getElementById("players-saved").style.display = "none";
                savePlayers(el.value);
                break;

            case "nickname":
            case "hostname":
                document.getElementById(el.id + "-saved").style.display = "none";
                saveValue(el.id, el.value);
                break;

            default:
                break;
        }
    }
});






// Kullanıcı stili ayarı için ace editor.

const editor = ace.edit("user-style", {
    mode: "ace/mode/css",
    theme: "ace/theme/one_dark",
    selectionStyle: "text",
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
});

editor.setOptions({
    fontSize: "1rem",
    showPrintMargin: false,
    wrap: true
});

const editorSave = debounce(() => {
    browserObj.storage.local.set({
        userCss: editor.getValue()
    });

    saved("usercss");
}, WAIT_MS_FOR_USERCSS_SAVE);

editor.getSession().on('change', () => {

    document.getElementById("usercss-saved").style.display = "none";
    editorSave();
});






function applySettings(result) {
    document.getElementById("min-theme").checked = result.minCssActive == undefined ? true : result.minCssActive;

    applyColor.checked = result.applyColor == undefined ? false : result.applyColor;
    if (result.applyColor) document.getElementById("color-theme-select-container").removeAttribute("disabled");
    else document.getElementById("color-theme-select-container").setAttribute("disabled", "");

    if (result.fansubsActive) document.getElementById("fansubs").removeAttribute("disabled");
    else document.getElementById("fansubs").setAttribute("disabled", "");
    if (result.selectPlayer) document.getElementById("players").removeAttribute("disabled");
    else document.getElementById("players").setAttribute("disabled", "");

    themeSelect.value = result.themeId || "orange";
    // document.getElementById("rem-bgs").checked = result.removeBgs == undefined ? false : result.removeBgs;
    document.getElementById("search").checked = result.searchActive == undefined ? true : result.searchActive;
    document.getElementById("detailed-search").checked = result.detailedSearch == undefined ? true : result.detailedSearch;
    document.getElementById("fansubs-active").checked = result.fansubsActive == undefined ? false : result.fansubsActive;
    document.getElementById("fansubs").value = result.fansubs == undefined ? "" : result.fansubs;//.map(f => f.replaceAll(",", "\\,")).join(",");
    document.getElementById("nickname").value = result.nickname == undefined ? "" : result.nickname;
    document.getElementById("hostname").value = result.hostname == undefined ? "" : result.hostname;
    document.getElementById("player-css").checked = result.player == undefined ? true : result.player;
    document.getElementById("players-active").checked = result.selectPlayer == undefined ? false : result.selectPlayer;
    document.getElementById("players").value = result.players == undefined ? "" : result.players;//.map(f => f.replaceAll(",", "\\,")).join(",");
    
    editor.setValue(result.userCss, 1);

    Links.apply(result.links == undefined ? defaultSettings.links : result.links);

    changeBgsChBox.checked = result.changeBgs == undefined ? false : result.changeBgs;

    for (let i = 0; i < bgSelContainers.length; i++) {
        const bgSelCont = bgSelContainers[i];

        if (changeBgsChBox.checked)
            bgSelCont.removeAttribute("disabled");

        const bgKey = bgSelCont.getAttribute("key");

        const bgSel = bgSelCont.getElementsByClassName("bg-select")[0];
        const bgName = bgSelCont.getAttribute("name");

        const colorInputElement = document.getElementById(bgName + "-color");
        const URLinputElement = document.getElementById(bgName + "-url");
        const fileInputBtnElement = document.getElementById(bgName + "-file-sel-btn");
        const selectedFileElement = document.getElementById(bgName + "-seled-file");

        if (result[bgKey]) {

            if (result[bgKey] == "def") {
                bgSel.value = "default";

                fileInputBtnElement.style.display = "none";
                colorInputElement.style.display = "none";
                URLinputElement.style.display = "none";
                selectedFileElement.style.display = "none";

            } else if (result[bgKey] == "none") {
                bgSel.value = "none";

                fileInputBtnElement.style.display = "none";
                colorInputElement.style.display = "none";
                URLinputElement.style.display = "none";
                selectedFileElement.style.display = "none";

            } else if (result[bgKey].startsWith("#")) {
                bgSel.value = "color";
                colorInputElement.value = result[bgKey];

                colorInputElement.style.display = "block";
                URLinputElement.style.display = "none";
                fileInputBtnElement.style.display = "none";
                selectedFileElement.style.display = "none";

            } else if (result[bgKey].startsWith("file:")) {
                bgSel.value = "upload";
                selectedFileElement.innerHTML = result[bgKey].split(":")[1];

                fileInputBtnElement.style.display = "block";
                selectedFileElement.style.display = "block";
                colorInputElement.style.display = "none";
                URLinputElement.style.display = "none";

            } else {
                bgSel.value = "url";
                URLinputElement.value = result[bgKey];

                URLinputElement.style.display = "block";
                colorInputElement.style.display = "none";
                fileInputBtnElement.style.display = "none";
                selectedFileElement.style.display = "none";
            }
        } else {
            bgSel.value = "default";

            fileInputBtnElement.style.display = "none";
            colorInputElement.style.display = "none";
            URLinputElement.style.display = "none";
            selectedFileElement.style.display = "none";
        }
    }

    document.getElementById("last-seen").checked = result.lastSeen == undefined ? false : result.lastSeen;
}






const messageDiv = document.getElementById("import-message");

function showImportMessage(message, color = "var(--success)") {
    messageDiv.textContent = message;
    messageDiv.style.color = color;
    messageDiv.style.display = "inline-block";
}






// - Ayarları içe/dışa aktarma işlemleri - //

const dataKeys = [
    "themeId",
    "applyColor",
    // "removeBgs",
    "fansubs",
    "fansubsActive",
    "searchActive",
    "minCssActive",
    "detailedSearch",
    "userCss",
    "nickname",
    "hostname",
    "player",
    "links",
    "selectPlayer",
    "players",
    "changeBgs",
    "homeBg",
    "homeSliderBg",
    "episodeBg",
    "lastSeen"
];

const defaultSettings = {
    themeId: null,
    applyColor: false,
    // removeBgs: false,
    fansubs: "",
    fansubsActive: false,
    searchActive: true,
    minCssActive: true,
    detailedSearch: true,
    userCss: null,
    nickname: null,
    hostname: null,
    player: true,
    links: ["takvim", "tavsiye-robotu", "fansublar", "arama"],
    selectPlayer: false,
    players: "",
    changeBgs: false,
    homeBg: null,
    homeSliderBg: null,
    episodeBg: null,
    lastSeen: false
}

function exportSettings() {
    browserObj.storage.local.get(
        dataKeys,
        function (result) {
            const blob = new Blob([JSON.stringify({...defaultSettings, ...result}, null, 0)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = "Anizm+ backup " + (new Date()).toISOString().slice(0,10);

            a.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));

            URL.revokeObjectURL(url);
        }
    );
}

document.getElementById("export").onclick = exportSettings;


document.getElementById('fileinput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type != "application/json") {
        alert("Lütfen geçerli bir ayarlar dosyası seçin (.json).");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        let contentKeys;

        let content;
        try {
            content = JSON.parse(e.target.result);

            contentKeys = Object.keys(content).filter(k => dataKeys.includes(k));
            contentKeys
                .filter(key => ( key == "fansubs" || key == "players" ) && typeof content[key] !== "string")
                .forEach(key => {
                    content[key] = content[key].map(f => f.replaceAll(",", "\\,")).join(",");
                });

        } catch {
            showImportMessage("Hata: Kayıt dosyası bozuk.", "var(--error)");
            return;
        }

        if (contentKeys.length == 0) {
            showImportMessage("Hata: Kayıt dosyası bozuk.", "var(--error)");
            return;
        }

        browserObj.storage.local.set(content, () => {

            const newSettings = {...defaultSettings};
            contentKeys.forEach(k => {
                newSettings[k] = content[k];
            });

            applySettings(newSettings);

            if (applyColor.checked) switchTheme(themeSelect.value);
            else switchTheme("orange");

            showImportMessage("Ayarlarınız başarıyla içe aktarıldı.");
        });
    };

    reader.readAsText(file);

    event.target.value = "";
});

// - Ayarları içe/dışa aktarma işlemleri - //






// Eklenti ayarlarını uygula
document.addEventListener("DOMContentLoaded", () => {

    browserObj.storage.local.get(dataKeys, applySettings);
});
