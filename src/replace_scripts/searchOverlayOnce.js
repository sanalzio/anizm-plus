const NO_MORE_RESULT_TEXT = "😔 Maalesef daha fazla sonuç yok. 😔";
const SHOW_MORE_RESULT_TEXT = "Daha Fazla Göster";
const INITIAL_RESULT_LIMIT = 10;
const LOAD_MORE_RESULT_LIMIT = 20;
let animeList = [];
let matchedAnimes = [];
let lastSearch = "";
let shownResultsToSkip = 0;
const SearchTypes = {
    FAST: "fast",
    DETAILED: "detailed",
};
let selectedSearchType = SearchTypes.FAST;


// Mobil cihaz kontrolü için fonksiyon
const isMobile = () => {
    return window.innerWidth <= 992 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

String.prototype.differenceCountForSearch = function (target) {
    let strA = this.toLowerCase().replace(/[,.:;\-]/g, " ").replace(/\s\s+/g, " ").replace(/[^a-z\d\s]/g, "").trim();
    if (strA.length === 0) return target.length;
    if (target.length === 0) return strA.length;
    if (strA.length < target.length) [strA, target] = [ target, strA ];
    else if (strA === target) return 0;

    var costX = new Int32Array(strA.length + 1);
    for (let i = 0; i < costX.length; i++) costX[i] = i;
    var costY = new Int32Array(strA.length + 1);
    for (let i = 0; i < target.length; i++) {
        costY[0] = i + 1;
        for (let j = 0; j < strA.length; j++) {
            costY[j + 1] = Math.min(
                costY[j] + 1, // deletion
                costX[j + 1] + 1, // insertion
                strA[j] === target[i] ? costX[j] : (costX[j] + 1) // replacement
            );
        }
        [costX, costY] = [ costY, costX ];
    }
    return costX[strA.length];
}

function isJapanese(str) {
    return str.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u30f2-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/) !== null;
}

var decodeEntities = (function () {
    var element = document.createElement("div");

    function decodeHTMLEntities(str) {
        if (str && typeof str === "string") {
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "");
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, "");
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = "";
        }

        return str;
    }

    return decodeHTMLEntities;
})();

$(() => {
    $(".searchTypeSelection").removeClass("passive");

    if (selectedSearchType != SearchTypes.FAST)
	$(".searchTypeSelection .searchTypeOption").toggleClass("active");

    $(".searchBarInput").keyup(() => {
        const isFastSearch = selectedSearchType === SearchTypes.FAST;
        if (isFastSearch) return searchByInput();
        debounce(searchByInput, 500)();
    });
    $("#loadMoreSearch").click(function () {
        const upperResultLimit = shownResultsToSkip + LOAD_MORE_RESULT_LIMIT;
        const searchResults = matchedAnimes.slice(
            shownResultsToSkip,
            upperResultLimit
        );
        const isFastSearch = selectedSearchType === SearchTypes.FAST;
        const searchFuncByType = isFastSearch
            ? getFastSearchResults
            : getDetailedSearchResults;
        for (const anime of searchResults) {
            $("#fullViewSearchResults").append(
                searchFuncByType(anime, lastSearch)
            );
        }
        if (upperResultLimit >= matchedAnimes.length) {
            toggleLoadMoreButton(false);
            return;
        }
        shownResultsToSkip += LOAD_MORE_RESULT_LIMIT;
        toggleLoadMoreButton(true);
    });

    $(".searchTypeSelection .searchTypeOption").click((e) => {
        if ($(e.currentTarget).hasClass("active")) return;

        shownResultsToSkip = 0;
        selectedSearchType = $(e.currentTarget).data("type");
        $(".searchTypeSelection .searchTypeOption").toggleClass("active");

        if (document.getElementById("searchOverlay").className.includes('searchShown'))
            document.getElementById("fullViewSearchInput").focus();

        matchedAnimes = new Array();
        showSearchResults();
    });

    // searchOverlay aç/kapa işlemleri.
    $("#searching, .searchingIcon, .searchBarButton, .headerSearchIcon, #homeSearchTrigger, #homeSearchInput, #mobileSearchTrigger",).click(
        function () {
            const isCurrentlyShown = $("#searchOverlay").hasClass("searchShown");
            $("#searchOverlay, body").toggleClass("searchShown");

            if (isCurrentlyShown) {
                // Overlay kapatılıyorsa keyboard'ı kapat
                const searchInput = document.getElementById("fullViewSearchInput");
                searchInput.blur();

                // Mobil cihazlarda klavyeyi kapatmak için ek yöntem
                if (isMobile()) {
                    searchInput.setAttribute('readonly', 'readonly');
                    setTimeout(() => {
                        searchInput.removeAttribute('readonly');
                    }, 100);
                }
            } else {
                // Overlay açılıyorsa focus ver
                setTimeout(() => {
                    document.getElementById("fullViewSearchInput").focus();
                }, 100);
            }
            // It is already fetched in the current page.
            if (animeList.length > 0) return;
            fetch("getAnimeListForSearch")
                .then(req => req.json())
                .then(data => {
                    animeList = data;
                });
        }
    );

    // ESC tuşu ile overlay'ı kapatma
    $(document).keyup(function (e) {
        if (e.key === "Escape" && $("#searchOverlay").hasClass("searchShown")) {
            $("#searchOverlay, body").removeClass("searchShown");
            // ESC ile kapatıldığında da keyboard'ı kapat
            const searchInput = document.getElementById("fullViewSearchInput");
            searchInput.blur();

            // Mobil cihazlarda klavyeyi kapatmak için ek yöntem
            if (isMobile()) {
                searchInput.setAttribute('readonly', 'readonly');
                setTimeout(() => {
                    searchInput.removeAttribute('readonly');
                }, 100);
            }
        }
    });

    // Enter tuşu ile ilk sonuca gitme
    $(".searchBarInput").keypress(function (e) {
        if (e.which == 13 && matchedAnimes.length > 0) {
            const firstResult = matchedAnimes[0];
            if (firstResult && firstResult.info_slug) {
                window.location.href = firstResult.info_slug;
            }
        }
    });
});

const parseYear = (year) => {
    let parsedYear = year;
    if (year.length < 4 || year.toLowerCase() == "null") return false;
    if (year.length > 4) {
        let matchYear = year.match(/\d{4}/);
        if (matchYear) parsedYear = matchYear;
        else return false;
    }
    return parsedYear;
};
const getEpisodeCount = (lastEpisode) => {
    let episodeCount = lastEpisode[0].episode_sort;
    if (episodeCount < 1) episodeCount = 1;
    if (episodeCount > 9999 && lastEpisode[1])
        for (let i = 1; i < lastEpisode.length; i++) {
            if (lastEpisode[i].episode_sort && lastEpisode[i].episode_sort < 9999)
                episodeCount = lastEpisode[i].episode_sort + i;
        }
    return episodeCount;
};


let timerBeforeLoadingList;
const optionsRegexp = /(["'])(#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,! \-]+))\1|#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,!\-]+)/gi;

const searchByInput = () => {
    // User typed in search before full list is fetched.
    if (animeList.length < 1) {
        $(".searchLoaderContainer").addClass("searchLoaderActive");
        timerBeforeLoadingList = setTimeout(searchByInput, 500);
        return;
    } else {
        clearTimeout(timerBeforeLoadingList);
        $(".searchLoaderContainer").removeClass("searchLoaderActive");
    }

    const search = $(".searchBarInput").val();
    if (!search.toLowerCase().trim()) {
        $("#fullViewSearchResults").html("");
        toggleLoadMoreButton(false);
        lastSearch = undefined;
        return;
    }
    if (search.toLowerCase().trim() === lastSearch) return;

    lastSearch = search;


    if (selectedSearchType == SearchTypes.FAST) {

        matchedAnimes = animeList.filter(
        (anime) =>
            (anime.info_titleoriginal &&
            (
                anime.info_titleoriginal
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(search.toLowerCase().replace(/\s\s+/g, " ").trim().replace(/[^a-z\d\s]/g, "")) ||
                anime.info_titleoriginal
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, " ")
                    .includes(search.toLowerCase().replace(/\s\s+|[^a-z\d\s]/g, " ").trim())
            )) ||
            (anime.info_titleenglish &&
            (
                anime.info_titleenglish
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(search.toLowerCase().replace(/\s\s+/g, " ").trim().replace(/[^a-z\d\s]/g, "")) ||
                anime.info_titleenglish
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, " ")
                    .includes(search.toLowerCase().replace(/\s\s+|[^a-z\d\s]/g, " ").trim())
            )) ||
            (anime.info_othernames &&
            (
                anime.info_othernames
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(search.toLowerCase().replace(/\s\s+/g, " ").trim().replace(/[^a-z\d\s]/g, "")) ||
                anime.info_othernames
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, " ")
                    .includes(search.toLowerCase().replace(/\s\s+|[^a-z\d\s]/g, " ").trim())
            )) ||
            (anime.info_studios &&
            (
                anime.info_studios
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(search.toLowerCase().replace(/\s\s+/g, " ").trim().replace(/[^a-z\d\s]/g, "")) ||
                anime.info_studios
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, " ")
                    .includes(search.toLowerCase().replace(/\s\s+|[^a-z\d\s]/g, " ").trim())
            ))
        );

        showSearchResults();
        return;
    }

    matchedAnimes = new Array();

    const options = new Object();
    const optionsRegexpMatches = [...search.matchAll(optionsRegexp)];

    const controllOptions = (title, year, malpoint, lastEpisode, categoriesObj) => {

        if (
            (title == undefined && (options.maxwords || options.minwords || options.wordcount)) ||
            (malpoint == undefined && (options.maxmalp || options.minmalp || options.malp)) ||
            (year == undefined && (options.maxyear || options.minyear || options.year)) ||
            (lastEpisode == undefined && (options.maxeps || options.mineps || options.eps)) ||
            ((categoriesObj == undefined || categoriesObj.length == 0) && (options.tags || options.excludeTags))
        ) return false;

        if (
            (options.maxmalp && malpoint > options.maxmalp) ||
            (options.minmalp && malpoint < options.minmalp) ||
            (options.malp && malpoint !== options.malp)
        ) return false;


        if (options.tags || options.excludeTags) {
            const categories = categoriesObj.map(tagJson => tagJson.tag_title.toLocaleLowerCase("tr"));
            if (
                !(
                    (
                        options.tagmode == "or" &&
                        categories.some(tag => options.tags && options.tags.includes(tag))
                    ) ||
                    (
                        options.tags.every(tagObj => categories.includes(tagObj))
                    )
                ) ||
                (categories.some(tag => options.excludeTags && options.excludeTags.includes(tag)))
            ) return false;
        }


        if (options.maxyear || options.minyear || options.year) {

            let parsedYear = parseYear(year);
            if (!parsedYear) return false;

            if (
                (options.maxyear && parsedYear > options.maxyear) ||
                (options.minyear && parsedYear < options.minyear) ||
                (options.year && parsedYear !== options.year)
            ) return false;
        }


        if (options.maxwords || options.minwords || options.wordcount) {
            const wordCount = title.split(" ").length;
            if (
                (options.maxwords && wordCount > options.maxwords) ||
                (options.minwords && wordCount < options.minwords) ||
                (options.wordcount && wordCount !== options.wordcount)
            ) return false;
        }


        if (options.maxeps || options.mineps || options.eps) {
            let episodeCount = getEpisodeCount(lastEpisode);
            if (
                (options.maxeps && episodeCount > options.maxeps) ||
                (options.mineps && episodeCount < options.mineps) ||
                (options.eps && episodeCount !== options.eps)
            ) return false;
        }

        return true;
    };


    if (optionsRegexpMatches)
        optionsRegexpMatches.forEach(optionMatch => {

            if (optionMatch[5]) optionMatch[3] = optionMatch[5], optionMatch[4] = optionMatch[6];

            const key = optionMatch[3].toLowerCase();

            switch(key) {

                case "sort":
                case "orderby":
                case "tagmode":
                    options[key] = optionMatch[4].toLowerCase();
                    break;

                case "year":
                    options[key] = optionMatch[4];
                    break;

                case "tags":
                    optionMatch[4].toLocaleLowerCase("tr").split(",").forEach(tag => {
                        if (tag.startsWith("!"))
                            options["excludeTags"] = [...(options["excludeTags"] ?? []), tag.slice(1)]
                        else
                            options[key] = [...(options[key] ?? []), tag]
                            // options[key].push(tag);
                    })
                    // options[key] = [...(options[key] ?? []), ...(optionMatch[4].toLocaleLowerCase("tr").split(","))];
                    break;

                default:
                    options[key] = Number(optionMatch[4]);
                    break;
            }
        });

    const searchQuery = search.replace(optionsRegexp, "").replace(/\s\s+/g, " ").trim();
    const query = searchQuery.toLowerCase().replace(/[,.:;\-]/g, " ").replace(/\s\s+/g, " ").replace(/[^a-z\d\s]/g, "");




    /* options search */

    if (searchQuery.replace(/[^a-z\d\s]/g, "").length === 0) {
        if (!$.isEmptyObject(options)) {
            matchedAnimes = animeList.filter(
                (anime) => 

                    controllOptions(
                        anime.info_titleoriginal,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode,
                        anime.categories
                    )

            ).sort(
                (a, b) => {

                    if (options.sort) {

                        if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                            if (options.orderby == "asc")
                                return a.info_malpoint-b.info_malpoint;
                            return b.info_malpoint-a.info_malpoint;
                        }
                        if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                            let parsedYearA = parseYear(a.info_year);
                            let parsedYearB = parseYear(b.info_year);

                            if (options.orderby == "asc")
                                return Number(parsedYearA)-Number(parsedYearB);
                            return Number(parsedYearB)-Number(parsedYearA);
                        }
                        if (options.sort == "wordcount") {
                            if (options.orderby == "asc")
                                return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                            return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                        }
                        if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                            if (options.orderby == "asc")
                                return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                            return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                        }
                    }

                    if (options.orderby == "desc")
                        return b.info_titleoriginal.localeCompare(a.info_titleoriginal);

                    return a.info_titleoriginal.localeCompare(b.info_titleoriginal);
                }
            );


            showSearchResults();
        }
        return;
    }




    /* Japanese title search */

    if (isJapanese(searchQuery)) {

        const japaneseQuery = searchQuery.replace(/[\u3000-\u303f\s]/g, "");

        matchedAnimes = animeList.filter(
            (anime) =>
    
                (anime.info_japanese &&
                    anime.info_japanese
                        .replace(/[\u3000-\u303f\s]/g, "")
                        .includes(japaneseQuery) &&
                    controllOptions(
                        undefined,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode,
                        anime.categories
                    ))

        ).sort(
            (a, b) => {

                if (options.sort) {

                    if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                        if (options.orderby == "asc")
                            return a.info_malpoint-b.info_malpoint;
                        return b.info_malpoint-a.info_malpoint;
                    }
                    if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                        let parsedYearA = parseYear(a.info_year);
                        let parsedYearB = parseYear(b.info_year);

                        if (options.orderby == "asc")
                            return Number(parsedYearA)-Number(parsedYearB);
                        return Number(parsedYearB)-Number(parsedYearA);
                    }
                    if (options.sort == "wordcount") {
                        if (options.orderby == "asc")
                            return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                        return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                    }
                    if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                        if (options.orderby == "asc")
                            return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                        return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                    }
                }

                if (options.orderby == "desc")
                    return b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCountForSearch(japaneseQuery) -
                    a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCountForSearch(japaneseQuery);

                return a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCountForSearch(japaneseQuery) -
                b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCountForSearch(japaneseQuery);
            }
        );


        showSearchResults();
        return;
    }




    /* Search with title matches */
    let findedIn;

    matchedAnimes = animeList.filter(
        (anime) => {

            if (
                anime.info_titleoriginal &&
                anime.info_titleoriginal
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )
            ) {

                if (findedIn == undefined) findedIn = 0;
                return true;
            }

            if (
                anime.info_titleenglish &&
                anime.info_titleenglish
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    anime.info_titleenglish,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )
            ) {

                if (findedIn == undefined) findedIn = 1;
                return true;
            }

            if (
                anime.info_othernames &&
                anime.info_othernames
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )
            ) {

                return true;
            }

            if (
                anime.info_studios &&
                anime.info_studios
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )
            ) {

                return true;
            }

        }

    ).sort(
        (a, b) => {

            if (options.sort) {

                if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                    if (options.orderby == "asc")
                        return a.info_malpoint-b.info_malpoint;
                    return b.info_malpoint-a.info_malpoint;
                }
                if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                    let parsedYearA = parseYear(a.info_year);
                    let parsedYearB = parseYear(b.info_year);

                    if (options.orderby == "asc")
                        return Number(parsedYearA)-Number(parsedYearB);
                    return Number(parsedYearB)-Number(parsedYearA);
                }
                if (options.sort == "wordcount") {
                    if (options.orderby == "asc")
                        return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                    return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                }
                if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                    if (options.orderby == "asc")
                        return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                    return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                }
                if (options.sort == "title") {
                    if (options.orderby == "desc")
                        return (findedIn === 1 && a.info_titleenglish && b.info_titleenglish) ? b.info_titleenglish.localeCompare(a.info_titleenglish) : b.info_titleoriginal.localeCompare(a.info_titleoriginal);
                    return (findedIn === 1 && a.info_titleenglish && b.info_titleenglish) ? a.info_titleenglish.localeCompare(b.info_titleenglish) : a.info_titleoriginal.localeCompare(b.info_titleoriginal);
                }
            }

            if (options.orderby == "desc") {

                if (findedIn === 1 && a.info_titleenglish && b.info_titleenglish)
                    return b.info_titleenglish.differenceCountForSearch(query) - a.info_titleenglish.differenceCountForSearch(query)
                else
                    return b.info_titleoriginal.differenceCountForSearch(query) - a.info_titleoriginal.differenceCountForSearch(query)
            }

            if (findedIn === 1 && a.info_titleenglish && b.info_titleenglish)
                return a.info_titleenglish.differenceCountForSearch(query) - b.info_titleenglish.differenceCountForSearch(query)
            else
                return a.info_titleoriginal.differenceCountForSearch(query) - b.info_titleoriginal.differenceCountForSearch(query)
        }
    );


    if (matchedAnimes.length > 0) {
        showSearchResults();
        return;
    }




    /* Search with keywords */

    const prepareKeyword = inp => {
        let kw = inp;
        if (kw.match(/^".+"$/))
            kw = kw.slice(1, -1);
        return kw;
    }

    let forcedKeywords = searchQuery
        .toLowerCase()
        .replace(/[,.:;\-]/g, " ")
        .replace(/[^a-z\d"'\s]+/g, "")
        .match(/"[a-z\d\s']+"/g) || new Array();

    let normalKeywords = searchQuery
        .toLowerCase()
        .replace(/[,.:;\-]/g, " ")
        .replace(/[^a-z\d"'\s]+/g, "")
        .match(/"[a-z\d\s']+"|[a-z\d]+/g)
        .filter(el =>
            el.length > 1 &&
            el.length >= (searchQuery.length / 2) / searchQuery.split(" ").length
        );
    if (forcedKeywords) normalKeywords = normalKeywords.filter(el => !forcedKeywords.includes(el));

    const keywordsSort = matched => matched.sort((a, b) => {
        if (options.sort) {
            if (
                options.sort == "malp" &&
                a.info_malpoint != undefined &&
                b.info_malpoint != undefined
            ) {
                if (options.orderby == "asc")
                    return a.info_malpoint - b.info_malpoint;
                return b.info_malpoint - a.info_malpoint;
            }
            if (
                options.sort == "year" &&
                a.info_year != undefined &&
                b.info_year != undefined
            ) {
                let parsedYearA = parseYear(a.info_year);
                let parsedYearB = parseYear(b.info_year);

                if (options.orderby == "asc")
                    return Number(parsedYearA)-Number(parsedYearB);
                return Number(parsedYearB)-Number(parsedYearA);
            }
            if (options.sort == "wordcount") {
                if (options.orderby == "asc")
                    return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
            }
            if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                if (options.orderby == "asc")
                    return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
            }
            if (options.sort == "title") {
                if (options.orderby == "desc")
                    return b.info_titleoriginal.localeCompare(a.info_titleoriginal);
                return a.info_titleoriginal.localeCompare(b.info_titleoriginal);
            }
        }

        if (options.orderby == "desc")
            return (
                b.info_titleoriginal.differenceCountForSearch(query) -
                a.info_titleoriginal.differenceCountForSearch(query)
            );

        return (
            a.info_titleoriginal.differenceCountForSearch(query) -
            b.info_titleoriginal.differenceCountForSearch(query)
        );
    });

    // every keywords necessary search
    matchedAnimes = keywordsSort(animeList.filter(
        (anime) =>

            (anime.info_titleoriginal &&
                normalKeywords.every(el =>
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(el)
                ) &&
                forcedKeywords.every(el =>
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )) ||

            (anime.info_titleenglish &&
                normalKeywords.every(el =>
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(el)
                ) &&
                forcedKeywords.every(el =>
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime.info_titleenglish,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )) ||

            (anime.info_othernames &&
                normalKeywords.every(el =>
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(el)
                ) &&
                forcedKeywords.every(el =>
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                ))
    ));


    if (matchedAnimes.length > 0) {
        showSearchResults();
        return;
    }


    // normal keywords search
    matchedAnimes = keywordsSort(animeList.filter(
        (anime) =>

            (anime.info_titleoriginal &&
                (
                    (
                        normalKeywords.length == 0 &&
                        forcedKeywords.length !== 0 &&
                        forcedKeywords.every(el =>
                            anime.info_titleoriginal
                                .toLowerCase()
                                .replace(/[^a-z\d\s]/g, "")
                                .includes(prepareKeyword(el))
                        )
                    ) ||
                    (
                        (
                            normalKeywords.length !== 0 &&
                            normalKeywords.some(el =>
                                anime.info_titleoriginal
                                    .toLowerCase()
                                    .replace(/[^a-z\d\s]/g, "")
                                    .includes(el))
                        ) ||
                        forcedKeywords.every(el =>
                            anime.info_titleoriginal
                                .toLowerCase()
                                .replace(/[^a-z\d\s]/g, "")
                                .includes(prepareKeyword(el))
                        )
                    )
                ) &&
                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )) ||

            (anime.info_titleenglish &&
                (
                    (
                        normalKeywords.length == 0 &&
                        forcedKeywords.length !== 0 &&
                        forcedKeywords.every(el =>
                            anime.info_titleenglish
                                .toLowerCase()
                                .replace(/[^a-z\d\s]/g, "")
                                .includes(prepareKeyword(el))
                        )
                    ) ||
                    (
                        (
                            normalKeywords.length !== 0 &&
                            normalKeywords.some(el =>
                                anime.info_titleenglish
                                    .toLowerCase()
                                    .replace(/[^a-z\d\s]/g, "")
                                    .includes(el))
                        ) ||
                        forcedKeywords.every(el =>
                            anime.info_titleenglish
                                .toLowerCase()
                                .replace(/[^a-z\d\s]/g, "")
                                .includes(prepareKeyword(el))
                        )
                    )
                ) &&
                controllOptions(
                    anime.info_titleenglish,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )) ||

            (anime.info_othernames &&
                (
                    (
                        normalKeywords.length == 0 &&
                        forcedKeywords.length !== 0 &&
                        forcedKeywords.every(el =>
                            anime.info_othernames
                                .toLowerCase()
                                .replace(/[^a-z\d\s]/g, "")
                                .includes(prepareKeyword(el))
                        )
                    ) ||
                    (
                        (
                            normalKeywords.length !== 0 &&
                            normalKeywords.some(el =>
                                anime.info_othernames
                                    .toLowerCase()
                                    .replace(/[^a-z\d\s]/g, "")
                                    .includes(el))
                        ) ||
                        forcedKeywords.every(el =>
                            anime.info_othernames
                                .toLowerCase()
                                .replace(/[^a-z\d\s]/g, "")
                                .includes(prepareKeyword(el))
                        )
                    )
                ) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                ))
    ));


    if (matchedAnimes.length > 0) {
        showSearchResults();
        return;
    }




    /* Search with title similarity */
    const tryCount = Math.floor(query.length / 2);

    if (tryCount > 0) for (let i = 1; i <= tryCount; i++) {

        matchedAnimes = animeList.filter(
            (anime) =>

                (anime.info_titleoriginal &&
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCountForSearch(query) === i &&
                    controllOptions(
                        anime.info_titleoriginal,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode,
                        anime.categories
                    )) ||

                (anime.info_titleenglish &&
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCountForSearch(query) === i &&
                    controllOptions(
                        anime.info_titleenglish,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode,
                        anime.categories
                    )) ||

                (anime.info_othernames &&
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCountForSearch(query) === i &&
                    controllOptions(
                        undefined,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode,
                        anime.categories
                    ))

        ).sort(
            (a, b) => {

                if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                    if (options.orderby == "asc")
                        return a.info_malpoint-b.info_malpoint;
                    return b.info_malpoint-a.info_malpoint;
                }
                if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                    let parsedYearA = parseYear(a.info_year);
                    let parsedYearB = parseYear(b.info_year);

                    if (options.orderby == "asc")
                        return Number(parsedYearA)-Number(parsedYearB);
                    return Number(parsedYearB)-Number(parsedYearA);
                }
                if (options.sort == "wordcount") {
                    if (options.orderby == "asc")
                        return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                    return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                }
                if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                    if (options.orderby == "asc")
                        return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                    return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                }

                return 0
            }
        );


        if (matchedAnimes.length > 0) {
            showSearchResults();
            return;
        }

        continue;
    }



    showSearchResults();
    return;
};

const showSearchResults = () => {
    const isFastSearch = selectedSearchType === SearchTypes.FAST;
    const resultLimit = isFastSearch
        ? INITIAL_RESULT_LIMIT * 2
        : INITIAL_RESULT_LIMIT;
    const searchFuncByType = isFastSearch
        ? getFastSearchResults
        : getDetailedSearchResults;
    const searchResults = matchedAnimes.slice(0, resultLimit);
    // Reset elements before showing new results.
    $("#fullViewSearchResults").html("");
    // Append new results to the container.
    for (const anime of searchResults) {
        $("#fullViewSearchResults").append(searchFuncByType(anime, lastSearch));
    }
    // If there are more results, show the load more button.
    if (matchedAnimes.length > resultLimit) {
        toggleLoadMoreButton(true);
        shownResultsToSkip = resultLimit;
    } else {
        toggleLoadMoreButton(false);
    }
};

const getDetailedSearchResults = (animeInfo, searchValue) => {
    const score = animeInfo.info_malpoint;
    const animeUrl = animeInfo.info_slug;
    const titleHighlightedOriginal = getHighlightedText(
        animeInfo.info_titleoriginal,
        searchValue
    );
    const shouldIncludeEnglishTitle =
        animeInfo.info_titleenglish !== animeInfo.info_titleoriginal;
    const subtitleTextToHighlight = shouldIncludeEnglishTitle
        ? `${animeInfo.info_titleenglish}, ${animeInfo.info_othernames}`
        : animeInfo.info_othernames;
    const subtitleHighlighted = getHighlightedText(
        subtitleTextToHighlight,
        searchValue
    );
    const studiosTextToHighlight = animeInfo.info_studios == undefined ? "?" : animeInfo.info_studios;
    const studiosHighlighted = getHighlightedText(
        studiosTextToHighlight,
        searchValue
    );
    const decodedSummary = decodeEntities(animeInfo.info_summary || "");
    const synopsis = (decodedSummary.match(/(?<=>)[^<]+/g)?.join(" ") || decodedSummary).trim();

    let studiosSection = `<p class="animeOtherTitle">Stüdyolar: ${studiosTextToHighlight}</p>`;
    if (studiosHighlighted) {
        //console.log("highlited " + studiosHighlighted);
        studiosSection = `<p class="animeOtherTitle">Stüdyolar: ${studiosHighlighted}</p>`;
    }

    // let tagsSection = animeInfo.categories ? `<p class="animeOtherTitle">Etiketler: ${animeInfo.categories.map(tagObj => tagObj.tag_title).join(", ")}</p>` : "";

    let otherNameSection = "";
    if (subtitleHighlighted) {
        //console.log("highlited " + subtitleHighlighted);
        otherNameSection = `<p class="animeOtherTitle">Diğer Adlar:
    ${subtitleHighlighted}
    </p>`;
    }

    let episodeCount = animeInfo.lastEpisode && animeInfo.lastEpisode.length > 0 ? getEpisodeCount(animeInfo.lastEpisode) : null;

    // Kategorileri hazırla
    let categoriesHTML = "";
    if (animeInfo.categories && animeInfo.categories.length > 0) {
        categoriesHTML = animeInfo.categories.map(category =>
            `<a href="/kategoriler/${category.tag_id}" class="ui label small">${category.tag_title}</a>`
        ).join('');
    }

    // Son eklenen bölümleri hazırla
    const hasAnyEpisode =
        animeInfo && animeInfo.lastEpisode && animeInfo.lastEpisode.length > 0;

    // Mobil cihazlarda "Son eklenen bölüm" olarak göster ve sadece 1 bölüm listele
    let latestEpisodeArea = "";

    if (hasAnyEpisode) {
        if (isMobile()) {
            // Mobil için sadece 1 bölüm göster
            if (animeInfo.lastEpisode && animeInfo.lastEpisode.length > 0) {
                const episode = animeInfo.lastEpisode[0]; // İlk bölümü al
                latestEpisodeArea = `<div class="latestEpisodesContainer">
                    <span class="episodesText">Son eklenen bölüm:</span>
                    <div class="buttonsInnerWrapper">
                        <a class="anizmLinkWrapper" href="${episode.episode_slug}" target="_blank">
                            <button class="anizmEpisodeButton">
                                <p>
                                    <span class="bg"></span>
                                    <span class="text">${episode.episode_title}</span>
                                </p>
                            </button>
                        </a>
                    </div>
                </div>`;
            }
        } else {
            // Masaüstü için tüm bölümleri göster
            latestEpisodeArea = `<div class="latestEpisodesContainer" style="display: flex;align-items: center;">
                <span style="margin-right: 10px;" class="episodesText">Son eklenen bölümler:</span>
                <div class="buttonsInnerWrapper">
                ${(animeInfo.lastEpisode || [])
                    .map((episode) => {
                        return `
                        <a class="anizmLinkWrapper" href="${episode.episode_slug}" target="_blank">
                            <button class="anizmEpisodeButton">
                                <p>
                                    <span class="bg"></span>
                                    <span class="text">${episode.episode_title}</span>
                                </p>
                            </button>
                        </a>
                `;
                    })
                    .join("")}
                </div>
            </div>`;
        }
    }

    return `<div class="searchResultItem">
<div class="aramaPuanCircle">
<div class="circleProgressBar anizm_alignCenter">
 <section>
  <svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" width="70" height="70"
   xmlns="http://www.w3.org/2000/svg">
   <circle class="circle-chart__background" stroke="#2f2c2c" stroke-width="2" fill="none"
    cx="16.91549431" cy="16.91549431" r="15.91549431" />
   <circle class="circle-chart__circle" stroke="#1d439b" stroke-width="2"
    stroke-dasharray="${
        score * 10
    }, 100" stroke-linecap="round" fill="none" cx="16.91549431"
    cy="16.91549431" r="15.91549431" />
   <g class="circle-chart__info">
    <text class="circle-chart__percent" x="16.91549431" y="15.5" alignment-baseline="central"
     text-anchor="middle" font-size="12">${score}</text>
   </g>
  </svg>
 </section>
 <a target="_blank" class="mal-link" href="https://myanimelist.net/anime/${animeInfo.info_malid.toString()}">
  <img class="card-poster mal-img" src="/mal.svg" alt="MAL sayfası">
 </a>
</div>
</div>
<div class="resultImgDate">
<a href="${animeUrl}">
 <img src="images/loading.gif" data-src="/storage/pcovers/${
     animeInfo.info_poster
 }" class="animeImg lazyload" />
 ${episodeCount ? '<span class="animeEpisodeCount">' + episodeCount + "</span>" : ""}
</a>
<span class="animeDate">Yapım Yılı: ${animeInfo.info_year}</span>
</div>
<div class="resultRightSide">
<div class="resultContent">
 <div class="animeTitlesContainer">
  <h5 class="animeTitle">
   <a href="${animeUrl}" class="animeTitleLink">${titleHighlightedOriginal}</a>
  </h5>
  ${otherNameSection}
  ${studiosSection}
 </div>
 <p class="animeSummary">${synopsis}</p>
 <!-- Kategori etiketlerini animeSummary'nin altına taşıdık -->
 <div class="ui tag labels tiny gelismisAramaLabelWrapper">
   ${categoriesHTML}
 </div>
 ${latestEpisodeArea}
</div>
<!-- Boş resultTags div'ini kaldırdık -->
</div>
</div>`;
};

const getFastSearchResults = (animeInfo, searchValue) => {
    const titleHighlightedOriginal = getHighlightedText(
        animeInfo.info_titleoriginal,
        searchValue,
        true
    );
    const shouldIncludeEnglishTitle =
        animeInfo.info_titleenglish !== animeInfo.info_titleoriginal;
    const subtitleTextToHighlight = shouldIncludeEnglishTitle
        ? `${animeInfo.info_titleenglish}, ${animeInfo.info_othernames}`
        : animeInfo.info_othernames;
    const subtitleHighlighted = getHighlightedText(
        subtitleTextToHighlight,
        searchValue,
        true
    );

    const hasAnyEpisode =
        animeInfo && animeInfo.lastEpisode && animeInfo.lastEpisode.length > 0;
    const latestEpisodeArea = `<div class="latestEpisodesContainer">
          <span class="episodesText">Son eklenen bölümler:</span>
          <div class="buttonsInnerWrapper">
          ${(animeInfo.lastEpisode || [])
              .map((episode) => {
                  return `
                  <a class="anizmLinkWrapper" href="${episode.episode_slug}" target="_blank">
                    <button class="anizmEpisodeButton">
                        <p>
                            <span class="bg"></span>
                            <span class="text">${episode.episode_title}</span>
                        </p>
                    </button>
                  </a>
          `;
              })
              .join("")}
          </div>
        </div>`;

    const hasOtherNames = subtitleHighlighted && subtitleHighlighted.length > 2;
    const otherNamesSection = `<p class="animeOtherTitle">Diğer Adlar:
        ${subtitleHighlighted}
        </p>`;

    return `
        <div class="fastResultTitleContainer">
            <a class="anizmAbsoluteDetailLink" href="${
                animeInfo.info_slug
            }" target="_blank">
            </a>
            <h5 class="animeTitle">${titleHighlightedOriginal}</h5>
            ${hasOtherNames ? otherNamesSection : ""}
            ${hasAnyEpisode ? latestEpisodeArea : ""}
        </div>`;
};

const toggleLoadMoreButton = (isEnabled) => {
    if (isEnabled) {
        $("#loadMoreSearch")
            .removeClass("disabled")
            .html(SHOW_MORE_RESULT_TEXT)
            .css("visibility", "visible");
        return;
    }
    $("#loadMoreSearch")
        .addClass("disabled")
        .html(NO_MORE_RESULT_TEXT)
        .css("visibility", "hidden");
};

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

const getHighlightedText = (title, searchValue, isFastSearch = false) => {
    if (!title) return "";

    return title.replace(
        new RegExp(
            isFastSearch ?
                searchValue.replace(/\s\s+/g, " ").trim() :
                searchValue.replace(optionsRegexp, "").replace(/\s\s+/g, " ").trim(),

            "i"
        ),
        `<span class="higlightedMatch">$&</span>`
    );
};
