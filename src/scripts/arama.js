/* -- Globals -- */


var json;

let overflowAnimeJsons = [];

var params = new URL(location.href).searchParams;
var hostname = "anizm.pro";

var engTitleByDef = false;

var queryInpClicked = false;

const themeIds = [
    "orange",
    "green",
    "blue",
    "pink",
    "purple",
    "red",
    "gray"
];


/* -- Globals -- */




/* -- Elements -- */


const searchBtn = document.getElementById("search-btn");
const clearQueryBtn = document.getElementById("clear-query");
const queryInput = document.getElementById("query");

const messageContainer = document.getElementById("message-container");
const messageElement = document.getElementById("message");
const loaderElement = document.getElementById("main-loader");
const resultsContainer = document.getElementById("results-container");

const resultsCountP = document.getElementById("results-count-p");
const resultsCount = document.getElementById("results-count");

const faviconLink = document.getElementById("favicon");
const logoSmallImg = document.getElementById("logo-small");

const logoBtn = document.getElementById("logo-btn");

const scrollToTop = document.getElementById("scroll-to-top");

const pageLinkElements = document.querySelectorAll("a.page-link");

const html = document.documentElement;

const faviconPath = new Object();
const logoPath = new Object();
const logoSmallPath = new Object();

const themeLink = document.getElementById("theme-link");
const logoImg = document.getElementById("logo");


/* -- Elements -- */




/* -- Functions -- */


String.prototype.differenceCount = function (target) {
	let strA = this;
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


function showMessage(message, loader=false) {
    resultsContainer.style.display = "none";

    messageElement.innerHTML = message;

    if (loader)
        loaderElement.style.display = "inline-block";
    else
        loaderElement.style.display = "none";

    messageContainer.style.display = "inline-block";

    while (messageElement.innerHTML !== message) {
        continue;
    }
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


function generateCard(animeJson) {
    const {
        info_othernames,
        info_japanese,
        info_summary,
        info_slug,
        info_poster,
        info_year,
        info_malpoint,
        info_malid,
        info_title,
        info_titleenglish,
        info_studios,
        lastEpisode,
        categories
    } = animeJson;

    const engTitle = engTitleByDef && info_titleenglish != undefined && info_titleenglish.length > 0;

    let title = engTitle ? info_titleenglish : info_title;
    let otherTitle = engTitle ? info_title : info_titleenglish;

    let otherNames = [otherTitle, info_othernames?.trim(), info_japanese]
        .filter(name => name && name.toLowerCase() !== title.toLowerCase())
        .join(", ") || "-";

    const decodedSummary = decodeEntities(info_summary || "");
    const synopsis = (decodedSummary.match(/(?<=>)[^<]+/g)?.join(" ") || decodedSummary).trim();

    let year = "?";
    if (info_year) year = parseYear(info_year);

    const tags = categories ? categories.map(tagObj => tagObj.tag_title).join(", ") : "-";

    return `
<div class="result-card">
    <div class="card-left">
        <a href="https://${hostname}/${info_slug}">
            <img width="255px" height="321px" class="card-poster" src="https://anizm.pro/storage/pcovers/${info_poster}" alt="${info_slug}-poster">
        </a>
        <div class="card-left-under">
            <span class="card-year">${year}</span>
            <a target="_blank" href="https://myanimelist.net/anime/${info_malid.toString()}" class="card-mal-score">${info_malpoint ? info_malpoint.toString() : "?"}</a>
        </div>
    </div>
    <div class="card-details">
        <a href="https://${hostname}/${info_slug}" class="card-title">${title}</a>
        <span class="card-info-container card-other-titles-container">
            <span class="card-info-span card-other-titles-span">
                <span class="card-info-label card-other-titles-label">Diğer isimler:</span>
                <span class="card-info card-other-titles">${otherNames}</span>
            </span>
        </span>
        <span class="card-info-container card-tags-container">
            <span class="card-info-span card-tags-span">
                <span class="card-info-label card-tags-label">Etiketler:</span>
                <span class="card-info card-tags">${tags}</span>
            </span>
        </span>
        <span class="card-info-container">
            <span class="card-info-span card-studios-span">
                <span class="card-info-label card-studios-label">Stüdyo:</span>
                <span class="card-info card-studios">${info_studios || "?"}</span>
            </span>

            <span class="card-info-span card-epcount-span">
                <span class="card-info-label card-epcount-label">Bölüm sayısı:</span>
                <span class="card-info card-epcount">${lastEpisode != undefined ? getEpisodeCount(lastEpisode).toString() : "?"}</span>
            </span>
        </span>
        <p class="card-synopsis">${synopsis}</p>
    </div>
</div>`;
}



function showResults() {
    messageContainer.style.display = "none";
    resultsContainer.style.display = "flex";
}


function printCards(matchedAnimes) {

    for (let i = 0; i < matchedAnimes.length; i++) {
        const animeJson = matchedAnimes[i];
        resultsContainer.innerHTML += generateCard(animeJson);
    }

    showResults();

}

function printMatchedAnimes(matchedAnimes, matchedAnimesLength) {

    if (matchedAnimesLength === 0) return;

    resultsCount.innerHTML = matchedAnimesLength;
    resultsCountP.style.display = "block";

    if (matchedAnimesLength > 7) {
        printCards(matchedAnimes.slice(0,7));
        overflowAnimeJsons = matchedAnimes.slice(7);

        return true;
    }

    printCards(matchedAnimes);
    return true;
}


function parseYear(year) {
    let parsedYear = year;
    if (year.length < 4 || year.toLowerCase() == "null") return false;
    if (year.length > 4) {
        let matchYear = year.match(/\d{4}/);
        if (matchYear) parsedYear = matchYear;
        else return false;
    }
    return parsedYear;
}

function getEpisodeCount(lastEpisode) {
    let episodeCount = lastEpisode[0].episode_sort;
    if (episodeCount < 1) episodeCount = 1;
    if (episodeCount > 9999 && lastEpisode[1])
        for (let i = 1; i < lastEpisode.length; i++) {
            if (lastEpisode[i].episode_sort && lastEpisode[i].episode_sort < 9999)
                episodeCount = lastEpisode[i].episode_sort + i;
        }
    return episodeCount;
}


Object.prototype.isEmpty = function () {
    for (const prop in this) {
        if (Object.hasOwn(this, prop)) {
            return false;
        }
    }

    return true;
}


function search(rawQuery, messageFunc, noFoundMsg) {

    const options = new Object();
    const optionsRegexp = /(["'])(#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,! \-]+))\1|#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,!\-]+)/gi;
    const optionsRegexpMatches = [...rawQuery.matchAll(optionsRegexp)];

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

    const searchQuery = rawQuery.replace(optionsRegexp, "").replace(/\s\s+/g, " ").trim();
    const query = searchQuery.toLowerCase().replace(/[^a-z\d\s]/g, "");




    /* options search */

    if (searchQuery.replace(/[^a-z\d\s]/g, "").length === 0) {
        if (!options.isEmpty()) {
            matchedAnimes = json.filter(
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


            if (printMatchedAnimes(matchedAnimes, matchedAnimes.length)) return;
        }

        messageFunc(noFoundMsg);
        return;
    }




    /* Japanese title search */

    if (isJapanese(searchQuery)) {

        const japaneseQuery = searchQuery.replace(/[\u3000-\u303f\s]/g, "");

        matchedAnimes = json.filter(
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
                    return b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery) -
                    a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery);

                return a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery) -
                b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery);
            }
        );


        if (printMatchedAnimes(matchedAnimes, matchedAnimes.length)) return;

        messageFunc(noFoundMsg);
        return;
    }




    /* Search with title matches */
    let findedIn;

    matchedAnimes = json.filter(
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

                if (!findedIn) findedIn = 0;
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

                if (!findedIn) findedIn = 1;
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
                    return b.info_titleenglish.differenceCount(query) - a.info_titleenglish.differenceCount(query)
                else
                    return b.info_titleoriginal.differenceCount(query) - a.info_titleoriginal.differenceCount(query)
            }

            if (findedIn === 1 && a.info_titleenglish && b.info_titleenglish)
                return a.info_titleenglish.differenceCount(query) - b.info_titleenglish.differenceCount(query)
            else
                return a.info_titleoriginal.differenceCount(query) - b.info_titleoriginal.differenceCount(query)
        }
    );


    if (printMatchedAnimes(matchedAnimes, matchedAnimes.length)) return;




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
                b.info_titleoriginal.differenceCount(query) -
                a.info_titleoriginal.differenceCount(query)
            );

        return (
            a.info_titleoriginal.differenceCount(query) -
            b.info_titleoriginal.differenceCount(query)
        );
    });


    // every keywords necessary search
    matchedAnimes = keywordsSort(json.filter(
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


    if (printMatchedAnimes(matchedAnimes, matchedAnimes.length)) return;


    // normal keywords search
    matchedAnimes = keywordsSort(json.filter(
        (anime) =>

            (anime.info_titleoriginal &&
                (
                    normalKeywords.length == 0 ||
                    normalKeywords.some(el =>
                        anime.info_titleoriginal
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
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
                (
                    normalKeywords.length == 0 ||
                    normalKeywords.some(el =>
                        anime.info_titleenglish
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
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
                (
                    normalKeywords.length == 0 ||
                    normalKeywords.some(el =>
                        anime.info_othernames
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
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


    if (printMatchedAnimes(matchedAnimes, matchedAnimes.length)) return;




    /* Search with title similarity */
    const tryCount = Math.floor(query.length / 2);

    if (tryCount > 0) for (let i = 1; i <= tryCount; i++) {

        matchedAnimes = json.filter(
            (anime) =>

                (anime.info_titleoriginal &&
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCount(query) === i &&
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
                        .differenceCount(query) === i &&
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
                        .differenceCount(query) === i &&
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


        if (printMatchedAnimes(matchedAnimes, matchedAnimes.length)) return;

        continue;
    }


    messageFunc(noFoundMsg);
}


/* -- Functions -- */




/* -- For theme chanages -- */

themeIds.forEach(themeId => {
    faviconPath[themeId] = "./assets/favicon/"+ themeId +".png";
    logoPath[themeId] = "./assets/logo/"+ themeId +".webp";
    logoSmallPath[themeId] = "./assets/icon/"+ themeId +".png";
});

function switchTheme(themeId) {
    if (!themeIds.includes(themeId))
        return;

    faviconLink.href = faviconPath[themeId];
    logoSmallImg.src = logoSmallPath[themeId];

    logoImg.src = logoPath[themeId];

    themeLink.href = `styles/colors/${themeId}_theme.css`;
}

/* -- For theme chanages -- */




/* -- Event listeners -- */


searchBtn.addEventListener("click", () => {

    let parameters = "";

    if (params.get("hostname"))
        parameters = "hostname=" + hostname + "&";
    if (params.get("engtitle"))
        parameters += "engtitle=" + engTitleByDef.toString() + "&";
    if (params.get("theme"))
        parameters += "theme=" + params.get("theme") + "&";

    location.search = "?" + parameters + "q=" + encodeURIComponent(queryInput.value);

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


scrollToTop.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});


window.addEventListener("scroll", () => {

    if (overflowAnimeJsons.length > 0 && html.offsetHeight + html.scrollTop >= html.scrollHeight) {

        if (overflowAnimeJsons.length > 7) {

            printCards(overflowAnimeJsons.slice(0,7));
            overflowAnimeJsons = overflowAnimeJsons.slice(7);

        }

        else {

            printCards(overflowAnimeJsons);
            overflowAnimeJsons = {};
        }

    }

    if (html.scrollTop >= window.innerHeight) {

        if (main.clientHeight - html.scrollTop - html.clientHeight < 0)
            scrollToTop.style.bottom = "calc(" +
                (
                    0 -
                    (
                        main.clientHeight -
                        html.scrollTop -
                        html.clientHeight
                    )
                ).toString() +
                "px + 1rem";

        else
            scrollToTop.style.bottom = "1rem";


        if (getComputedStyle(scrollToTop).display == "none")
            scrollToTop.style.display = "inline";
    }
    else if (getComputedStyle(scrollToTop).display != "none")
        scrollToTop.style.display = "none";

});


/* -- Event listeners -- */




document.addEventListener("DOMContentLoaded", async () => {

    if (location.hash.length > 0) {
        switchTheme(location.hash.slice(7));
    }

    if (params.get("hostname")) {
        hostname = params.get("hostname");
        logoBtn.href = "https://" + hostname;

        pageLinkElements.forEach(el => {
            el.href = "https://" + hostname + el.getAttribute("data-page-id");
        });
    }

    if (params.get("theme")) {
        switchTheme(params.get("theme"));
    }

    try {
        browserObj.storage.local.get(["hostname"], function (result) {
            if (result.hostname) hostname = result.hostname;
        });
    } catch {}


    if (params.get("engtitle")) {
        engTitleByDef = params.get("engtitle").toLowerCase() == "true" ? true : false;
    }


    if (!params.get("q")) {

        /* if (!location.host.match(/[\d]{3}\.[\d]\.[\d]\.[\d]:[\d]{4}/)) */ queryInput.focus();
        showMessage("Aramaya başlayın...");

    } else {
        
        const query = decodeURIComponent(params.get("q"));

        document.title = query + " - Anizm arama";

        queryInput.value = query;
        clearQueryBtn.style.display = "flex";

        showMessage("Veri tabanı yükleniyor...", true);

        const req = await fetch("https://anizm.pro/getAnimeListForSearch");
        json = await req.json();

        showMessage("Aranıyor...", true);

        search(query, showMessage, "Sonuç bulunamadı.");

    }

});
