site_js.controller.register("episodepage", {
    init: function () {
        var self = this;

        self.on("click", "[data-translatorclick]", "loadTranslator");

        self.on("click", "[data-playerclick]", "loadPlayer");

        self.on("keyup", "[data-episodefilter]", "filterEpisodes");

        self.autoSelectFansub();

        var translators = $("[data-translatorclick]");

        if (translators.length == 1) {
            // $(".episodePlayer").html("");
            // Array.from(document.getElementsByClassName("episodePlayer")).forEach(el => el.innerHTML = "");
            document.getElementsByClassName("episodePlayerContent")[0].innerHTML = "";
            site_js.loader.set(".episodePlayerContent ");
        }
    },

    loadTranslator: function (e) {
        e.preventDefault();

        // .episodePlayers ve .episodePlayerContent alanlarını temizle
        document.querySelector(".episodePlayers").innerHTML = '';
        document.querySelector(".episodePlayerContent").innerHTML = '';

        // Yükleyici göster
        site_js.loader.set(".episodePlayerContent");

        var self = this;

        // Tüm aktif çevirmenlerin "active" sınıfını kaldır
        document.querySelectorAll("[data-translatorclick]").forEach(function (el) {
            el.classList.remove("active");
        });
        document.querySelectorAll(".translatorCompactBox").forEach(function (el) {
            el.classList.remove("active");
        });

        // Tıklanan öğeyi al
        var elem = e.currentTarget;

        // Linke ve kutuya "active" sınıfını ekle
        elem.classList.add("active");
        var compactBox = elem.querySelector(".translatorCompactBox");
        if (compactBox) {
            compactBox.classList.add("active");
        }

        // "translator" attribute'unu al
        var translatorAttr = elem.getAttribute("translator");

        site_js.request.send(translatorAttr, function (result) {
            document.querySelector(".episodePlayers").innerHTML = result.data;
            self.autoSelectVideo();
        });
    },

    loadPlayer: function (e) {
        e.preventDefault();

        // Aktif olan tüm [data-playerclick] öğelerinden "active" ve içindeki "i" etiketinden "check" sınıfını kaldır
        document.querySelectorAll("[data-playerclick].active").forEach(function (el) {
            el.classList.remove("active");

            var icon = el.querySelector("i");
            if (icon) {
                icon.classList.remove("check");
            }
        });

        var elem = e.currentTarget;

        // #players span içeriğini tıklanan öğedeki span içeriğiyle değiştir
        var playersSpan = document.querySelector("#players span");
        var clickedSpan = elem.querySelector("span");
        if (playersSpan && clickedSpan) {
            playersSpan.textContent = clickedSpan.textContent;
        }

        // Tıklanan elemana "active", içindeki <i> öğesine "check" sınıfı ekle
        elem.classList.add("active");
        var icon = elem.querySelector("i");
        if (icon) {
            icon.classList.add("check");
        }

        // .episodePlayerContent içeriğini temizle ve loader göster
        var contentContainer = document.querySelector(".episodePlayerContent");
        if (contentContainer) {
            contentContainer.innerHTML = '';
            site_js.loader.set(".episodePlayerContent");
        }

        // "video" attribute’unu al
        var videoAttr = elem.getAttribute("video");

        site_js.request.send(videoAttr, function (result) {
            if (contentContainer) {
                contentContainer.innerHTML = result.player;
            }

            var translatorContainer = document.querySelector(".playerTranslator");
            if (translatorContainer) {
                translatorContainer.innerHTML = result.translator;
            }

            var uploaderContainer = document.querySelector(".playerUploader");
            if (uploaderContainer) {
                uploaderContainer.innerHTML = result.staff;
            }

            document.querySelectorAll(".playerActions, .playerTranslator").forEach(function (el) {
                el.classList.remove("passive");
            });

            // Report link güncelle
            var reportLink = document.querySelector("[data-playerreport]");
            if (reportLink) {
                var currentHref = reportLink.getAttribute("href");
                var match = videoAttr.match(/video\/(\d+)/);
                if (match) {
                    var newHref = currentHref.replace(/video\/\d+/g, "video/" + match[1]);
                    reportLink.setAttribute("href", newHref);
                }
            }

            site_js.loader.remove(".playerPanel");
        });

        // jQuery'deki .trigger("click") işlevinin yerine tıklama olayını tetikle
        var playersElem = document.querySelector("#players");
        if (playersElem) {
            playersElem.dispatchEvent(new Event("click"));
        }
    },

    autoSelectFansub: function () {

        const priorityFansubsElement = document.getElementById("$");

        if (priorityFansubsElement && priorityFansubsElement.getAttribute("content")) {

            try {

                const priorityFansubs = priorityFansubsElement.getAttribute("content").split(/(?<!\\),/).map(p => p.replaceAll("\\,", ",").toLowerCase());

                const bluRayRegExp = /(?<!\w)bd(?!\w)/i;

                const fansubBtns = Array.from(document.querySelectorAll("[data-translatorclick]"));

                if (fansubBtns.length > 1) {
                    const sortedBtns = fansubBtns
                        .filter(btn => priorityFansubs.some(f => btn.innerText.toLocaleLowerCase("tr").includes(f)))
                        .map(btn => {
                            const titleText = btn.innerText.toLocaleLowerCase("tr");

                            let priority = priorityFansubs.length;
                            for (let i = 0; i < priorityFansubs.length; i++) {
                                if (titleText.includes(priorityFansubs[i])) {
                                    priority = i;
                                    break;
                                }
                            }

                            if (bluRayRegExp.test(titleText)) priority -= 1;

                            return { btn, priority };
                        })
                        .sort((a, b) => a.priority - b.priority);

                    if (sortedBtns.length > 0) {
                        if (!sortedBtns[0].btn.classList.contains("active")) {
                            sortedBtns[0].btn.click();
                            return;
                        }
                    } else {
                        fansubBtns[0].click();
                        return;
                    }
                } else {
                    fansubBtns[0].click();
                    return;
                }

            } catch {}
        }

        document.querySelector("[data-translatorclick]").click();
    },

    autoSelectVideo: function () {

        const priorityPlayersElement = document.getElementById("%");

        if (priorityPlayersElement && priorityPlayersElement.getAttribute("content")) {
            const playerBtns = Array.from(document.querySelectorAll("[data-playerclick]"));
            const priorityPlayers = priorityPlayersElement.getAttribute("content").split(/(?<!\\),/).map(p => p.replaceAll("\\,", ",").toLowerCase());

            if (playerBtns.length > 1) {
                const sortedBtns = playerBtns
                    .filter(btn => priorityPlayers.some(p => btn.innerText.toLowerCase().includes(p)))
                    .map(btn => {
                        const titleText = btn.innerText.toLowerCase();

                        let priority = priorityPlayers.length;
                        for (let i = 0; i < priorityPlayers.length; i++) {
                            if (titleText.includes(priorityPlayers[i])) {
                                priority = i;
                                break;
                            }
                        }

                        return { btn, priority };
                    })
                    .sort((a, b) => a.priority - b.priority);

                if (sortedBtns.length > 0) {
                    if (!sortedBtns[0].btn.classList.contains("active"))
                        sortedBtns[0].btn.click();
                } else {
                    playerBtns[0].click();
                }
            } else {
                playerBtns[0].click();
            }

            return;
        }

        document.querySelector("[data-playerclick]").click();
        // players.parent().find("[data-playerclick]:first-child").click();
    },

    filteredText: "",

    filterEpisodes: site_js.helpers.delay(function () {
        try {
            var self = this;

            var filterInput = document.getElementById('episodeFilterInput');
            var text = filterInput ? filterInput.value.trim() : "";

            var searched = false;

            if (self.filteredText !== text) {
                var episodeLines = document.querySelectorAll(".info_episodeList .episodeLine");

                // Tüm bölümleri gizle
                episodeLines.forEach(function (el) {
                    el.style.display = "none";
                });

                if (text) {
                    // Uyan başlığa sahip bölümleri göster
                    var titles = document.querySelectorAll(".info_episodeList .episodeLine .title");
                    titles.forEach(function (title) {
                        if (title.textContent.toLowerCase().includes(text.toLowerCase())) {
                            var episodeLine = title.closest(".episodeLine");
                            if (episodeLine) {
                                episodeLine.style.display = "";
                                searched = true;
                            }
                        }
                    });
                } else {
                    // Metin boşsa tüm bölümleri göster
                    episodeLines.forEach(function (el) {
                        el.style.display = "";
                    });
                    searched = true;
                }

                // Daha önce oluşturulmuş "Bölüm bulunamadı" mesajlarını kaldır
                document.querySelectorAll(".episodeLine.created").forEach(function (el) {
                    el.remove();
                });

                if (!searched) {
                    var container = document.querySelector(".info_episodeList .anizm_boxContent");
                    if (container) {
                        var message = document.createElement("div");
                        message.className = "episodeLine created pfull anizm_textUpper anizm_textBold";
                        message.innerHTML = "<span>Bölüm bulunamadı.</span>";
                        container.appendChild(message);
                    }
                }

                self.filteredText = text;
            }
        } catch (err) {
            // Hata durumunda tüm bölümleri göster
            document.querySelectorAll(".info_episodeList .episodeLine").forEach(function (el) {
                el.style.display = "";
            });
        }
    }, 500)
});
