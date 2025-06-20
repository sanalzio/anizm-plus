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
            document.getElementById("videoFrame").innerHTML = "";
            site_js.loader.set(".episodePlayer ");
        }
    },

    loadTranslator: function (e) {
        $(".episodePlayers").html("");
        $(".episodePlayer").html("");
        site_js.loader.set(".episodePlayer ");
        var self = this;
        e.preventDefault();

        $("[data-translatorclick].active").removeClass("active");

        var elem = $(e.currentTarget);

        elem.addClass("active");

        site_js.request.send(elem.attr("translator"), function (result) {
            $(".episodePlayers").html(result.data);
            self.autoSelectVideo();
        });
    },

    loadPlayer: function (e) {
        e.preventDefault();

        $("[data-playerclick].active").each(function () {
            var elem = $(this);

            elem.removeClass("active");

            elem.find("i").removeClass("check");
        });

        var elem = $(e.currentTarget);

        $("#players span").text(elem.find("span").text());

        elem.addClass("active").find("i").addClass("check");
        $(".episodePlayer").html("");
        site_js.loader.set(".episodePlayer"); // Noktalı virgülü kaldırdım

        site_js.request.send(elem.attr("video"), function (result) {
            $(".episodePlayer").html(result.player);
            $(".playerTranslator").html(result.translator);
            $(".playerUploader").html(result.staff);
            $(".playerActions, .playerTranslator").removeClass("passive");

            var reportLink = $("[data-playerreport]");

            reportLink.attr(
                "href",
                reportLink
                    .attr("href")
                    .replace(
                        /video\/\d+/g,
                        "video/" + elem.attr("video").match(/video\/(\d+)/)[1]
                    )
            );

            site_js.loader.remove(".playerPanel ");
        });

        $("#players").trigger("click");
    },

    autoSelectFansub: function () {

        const priorityFansubsElement = document.getElementById("$");

        if (priorityFansubsElement && priorityFansubsElement.getAttribute("content")) {

            try {

                const priorityFansubs = priorityFansubsElement.getAttribute("content").split(/(?<!\\),/).map(p => p.replaceAll("\\,", ",").toLowerCase())                

                const bluRayRegExp = /(?<!\w)bd(?!\w)/i;

                const fansubBtns = Array.from(document.querySelectorAll("[data-translatorclick]"));

                if (fansubBtns.length > 1) {
                    const sortedBtns = fansubBtns
                        .filter(btn => priorityFansubs.some(f => btn.getElementsByClassName("title")[0].innerText.toLocaleLowerCase("tr").includes(f)))
                        .map(btn => {
                            const titleText = btn.getElementsByClassName("title")[0].innerText.toLocaleLowerCase("tr");

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
            const priorityPlayers = priorityPlayersElement.getAttribute("content").split(/(?<!\\),/).map(p => p.replaceAll("\\,", ",").toLowerCase())

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

        var players = $("[data-playerclick]");

        document.querySelector("[data-playerclick]").click();
        // players.parent().find("[data-playerclick]:first-child").click();
    },

    filteredText: "",

    filterEpisodes: site_js.helpers.delay(function (e) {
        var self = this;
        var text = $(e.currentTarget).val().trim();
        var searched = false;

        if (self.filteredText != text) {
            $(".info_episodeList .episodeLine").hide();

            $(
                ".info_episodeList .episodeLine .title:contains(" + text + ")"
            ).each(function () {
                searched = true;

                $(this).closest(".episodeLine").show();
            });

            $(".episodeLine.created").remove();

            if (searched == false) {
                $(".info_episodeList .anizm_boxContent ").append(
                    '<div class="episodeLine created pfull anizm_textUpper anizm_textBold">' +
                        "<span>Bölüm bulunamadı.</span>" +
                        "</div>"
                );
            }

            self.filteredText = text;
        }
    }, 500),
});
