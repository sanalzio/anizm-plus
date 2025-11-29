let animeList = [];

// Originally inspired by  David Walsh (https://davidwalsh.name/javascript-debounce-function)
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for `wait` milliseconds.
const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            self.postMessage(func(...args) || []);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const searchDebounce = debounce(searchFunc, 500);




self.addEventListener('message', function (e) {
    if (!e.data) return;


    if (e.data == "load") {
        fetch("https://anizm.pro/getAnimeListForSearch")
            .then(req => req.json())
            .then(data => {
                animeList = data;
                console.log("loaded");
                self.postMessage("loaded");
            });
        return;
    }


    if (e.data.type) {
        const { type, search, options } = e.data;
        console.log("searching for:", search);

        if (type != "detailed") {
            self.postMessage(searchFunc(type, search, options) || []);
            return;
        }
        searchDebounce(type, search, options);
    }
});




function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
}



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

function isJapanese(str) {
    return str.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u30f2-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/) !== null;
}

function getTitleProp(anime) {
    return titleProp = (
            anime.info_titleoriginal
             && anime.info_titleoriginal != anime.info_titleenglish
             && anime.info_titleoriginal != anime.info_japanese
        ) || !anime.info_title
         ? "info_titleoriginal"
         : "info_title";
}


const optionsRegexp = /(["'])(#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,! \-]+))\1|#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,!\-]+)/gi;


function searchFunc(type, search, options){


    if (type == "fast") {
        if (!search.length) return;
        return animeList.filter(
        (anime) =>
            (anime[getTitleProp(anime)] &&
            (
                anime[getTitleProp(anime)]
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(search.toLowerCase().replace(/\s\s+/g, " ").trim().replace(/[^a-z\d\s]/g, "")) ||
                anime[getTitleProp(anime)]
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
    }

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

            let parsedYear = Number(parseYear(year));
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
        if (!isEmpty(options))
            return [true, ...animeList.filter(
                (anime) => 

                    controllOptions(
                        anime[getTitleProp(anime)],
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode,
                        anime.categories
                    )

            ).sort(
                (a, b) => {

                    const AtitleProp = getTitleProp(a), BtitleProp = getTitleProp(b);

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
                                return a[AtitleProp].split(" ").length-b[BtitleProp].split(" ").length;
                            return b[BtitleProp].split(" ").length-a[AtitleProp].split(" ").length;
                        }
                        if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                            if (options.orderby == "asc")
                                return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                            return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                        }
                    }

                    if (options.orderby == "desc")
                        return b[BtitleProp].localeCompare(a[AtitleProp]);

                    return a[AtitleProp].localeCompare(b[BtitleProp]);
                }
            )];
        return;
    }




    /* Japanese title search */

    if (isJapanese(searchQuery)) {

        const japaneseQuery = searchQuery.replace(/[\u3000-\u303f\s]/g, "");

        return [true, ...animeList.filter(
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

                const AtitleProp = getTitleProp(a), BtitleProp = getTitleProp(b);

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
                            return a[AtitleProp].split(" ").length-b[BtitleProp].split(" ").length;
                        return b[BtitleProp].split(" ").length-a[AtitleProp].split(" ").length;
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
        )];
    }




    /* Search with title matches */
    let findedIn, matchedAnimes;

    matchedAnimes = animeList.filter(
        (anime) => {

            if (
                anime[getTitleProp(anime)] &&
                anime[getTitleProp(anime)]
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    anime[getTitleProp(anime)],
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

            const AtitleProp = getTitleProp(a), BtitleProp = getTitleProp(b);

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
                        return a[AtitleProp].split(" ").length-b[BtitleProp].split(" ").length;
                    return b[BtitleProp].split(" ").length-a[AtitleProp].split(" ").length;
                }
                if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                    if (options.orderby == "asc")
                        return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                    return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                }
                if (options.sort == "title") {
                    if (options.orderby == "desc")
                        return (findedIn === 1 && a.info_titleenglish && b.info_titleenglish) ? b.info_titleenglish.localeCompare(a.info_titleenglish) : b[BtitleProp].localeCompare(a[AtitleProp]);
                    return (findedIn === 1 && a.info_titleenglish && b.info_titleenglish) ? a.info_titleenglish.localeCompare(b.info_titleenglish) : a[AtitleProp].localeCompare(b[BtitleProp]);
                }
            }

            if (options.orderby == "desc") {

                if (findedIn === 1 && a.info_titleenglish && b.info_titleenglish)
                    return b.info_titleenglish.differenceCountForSearch(query) - a.info_titleenglish.differenceCountForSearch(query)
                else
                    return b[BtitleProp].differenceCountForSearch(query) - a[AtitleProp].differenceCountForSearch(query)
            }

            if (findedIn === 1 && a.info_titleenglish && b.info_titleenglish)
                return a.info_titleenglish.differenceCountForSearch(query) - b.info_titleenglish.differenceCountForSearch(query)
            else
                return a[AtitleProp].differenceCountForSearch(query) - b[BtitleProp].differenceCountForSearch(query)
        }
    );


    if (matchedAnimes.length > 0) {
        return [true, ...matchedAnimes];
    }




    /* Search with keywords */

    const prepareKeyword = inp => {
        let kw = inp;
        if (kw.startsWith("'") || kw.startsWith('"'))
            kw = kw.slice(1, -1);
        return kw;
    }

    let forcedKeywords = searchQuery
        .toLowerCase()
        .replace(/[^a-z\d"'\s]+/g, "")
        .match(/"[a-z\d\s']+"|'[a-z\d\s"]+'/g) || new Array();

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

        const AtitleProp = getTitleProp(a), BtitleProp = getTitleProp(b);
    
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
                    return a[AtitleProp].split(" ").length-b[BtitleProp].split(" ").length;
                return b[BtitleProp].split(" ").length-a[AtitleProp].split(" ").length;
            }
            if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                if (options.orderby == "asc")
                    return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
            }
            if (options.sort == "title") {
                if (options.orderby == "desc")
                    return b[BtitleProp].localeCompare(a[AtitleProp]);
                return a[AtitleProp].localeCompare(b[BtitleProp]);
            }
        }

        if (options.orderby == "desc")
            return (
                b[BtitleProp].differenceCountForSearch(query) -
                a[AtitleProp].differenceCountForSearch(query)
            );

        return (
            a[AtitleProp].differenceCountForSearch(query) -
            b[BtitleProp].differenceCountForSearch(query)
        );
    });

    // every keywords necessary search
    matchedAnimes = keywordsSort(animeList.filter(
        (anime) =>

            (anime[getTitleProp(anime)] &&
                normalKeywords.every(el =>
                    anime[getTitleProp(anime)]
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(el)
                ) &&
                forcedKeywords.every(el =>
                    anime[getTitleProp(anime)]
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime[getTitleProp(anime)],
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
        return matchedAnimes;
    }


    // normal keywords search
    matchedAnimes = keywordsSort(animeList.filter(
        (anime) =>

            (anime[getTitleProp(anime)] &&
                (
                    normalKeywords.length && !forcedKeywords.length
                     ? normalKeywords.some(el =>
                        anime[getTitleProp(anime)]
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
                     : true
                ) &&
                forcedKeywords.every(el =>
                    anime[getTitleProp(anime)]
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime[getTitleProp(anime)],
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode,
                    anime.categories
                )
            ) ||

            (anime.info_titleenglish &&
                (
                    normalKeywords.length && !forcedKeywords.length
                     ? normalKeywords.some(el =>
                        anime.info_titleenglish
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
                     : true
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
                )
            ) ||

            (anime.info_othernames &&
                (
                    normalKeywords.length && !forcedKeywords.length
                     ? normalKeywords.some(el =>
                        anime.info_othernames
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
                     : true
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
                )
            )
    ));


    if (matchedAnimes.length > 0) {
        return matchedAnimes;
    }




    /* Search with title similarity */
    const tryCount = Math.floor(query.length / 2) || 1;

    for (let i = 1; i <= tryCount; i++) {

        matchedAnimes = animeList.filter(
            (anime) =>

                (anime[getTitleProp(anime)] &&
                    anime[getTitleProp(anime)]
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCountForSearch(query) == i &&
                    controllOptions(
                        anime[getTitleProp(anime)],
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode,
                        anime.categories
                    )) ||

                (anime.info_titleenglish &&
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCountForSearch(query) == i &&
                    controllOptions(
                        anime.info_titleenglish,
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
                        return a[AtitleProp].split(" ").length-b[BtitleProp].split(" ").length;
                    return b[BtitleProp].split(" ").length-a[AtitleProp].split(" ").length;
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
            return matchedAnimes;
        }

        continue;
    }



    return;
};