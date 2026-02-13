const NO_MORE_RESULT_TEXT = "😔 Maalesef daha fazla sonuç yok. 😔";
const SHOW_MORE_RESULT_TEXT = "Daha Fazla Göster";
const INITIAL_RESULT_LIMIT = 10;
const LOAD_MORE_RESULT_LIMIT = 20;
let animeListLoaded = false;
let matchedAnimes = [];
let lastSearch = "";
let shownResultsToSkip = 0;
const SearchTypes = {
    FAST: "fast",
    DETAILED: "detailed",
};
let selectedSearchType = SearchTypes.FAST;


const notFound = document.createElement("div");
notFound.id = "not-found";
notFound.innerHTML = "Tam eşleşme bulunamadı, benzer sonuçlar gösteriliyor.";
notFound.setAttribute(
    "style",
    "width:100%;text-align:center;margin:.5rem 0;font-size:medium;font-weight:bold!important;color:var(--primaryColorDarker)"
);


const optionsRegexp = /(["'])(#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,! \-]+))\1|#(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby|tags|tagmode):([A-Za-z0-9çğıöşüÇĞİÖŞÜ_,!\-]+)/gi;


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


function getTitleProp(anime) {
    return titleProp = (
            anime.info_titleoriginal
             && anime.info_titleoriginal != anime.info_titleenglish
             && anime.info_titleoriginal != anime.info_japanese
        ) || !anime.info_title
         ? "info_titleoriginal"
         : "info_title";
}


async function getAnilistUrl(malId) {

    try {
        const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: `{"query":"query{Media(idMal: ${malId}, type: ANIME){siteUrl}}"}`,
        });

        const responseData = await response.json();
        return responseData.data.Media.siteUrl || null;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}


const extensionPath = document.getElementById("anizmpluspath").getAttribute("content");

let worker;
fetch(extensionPath + "replace_scripts/searchWorker.js")
    .then(r => r.text())
    .then(data => {
        const blob = new Blob([data], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        worker = new Worker(blobUrl);

        // Worker'dan gelen mesajları dinle
        worker.addEventListener('message', function (e) {
            if (e.data == "loaded") {
                animeListLoaded = true;
                return;
            }

            matchedAnimes = e.data;
            showSearchResults();
        });

        // Worker'a ping gönder
        /* worker.postMessage({ type: selectedSearchType, search: search, options: options });
        worker.postMessage("load"); */
    });


// aratılan url'leri kaydetmek için'
window.anilistUrls = new Object();

window.mal2anilistOpen = function (malIdInp) {

    // eğer daha önceden kaydedildiyse direkt oradan alıyor
    if (window.anilistUrls[malIdInp]) {
        window.open(window.anilistUrls[malIdInp], "_blank");
        return;
    }

    getAnilistUrl(malIdInp)
        .then(url => {
            window.anilistUrls[malIdInp] = url;
            window.open(url, "_blank");
        });
}


// Mobil cihaz kontrolü için fonksiyon
const isMobile = () => {
    return window.innerWidth <= 992 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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

$(async () => {

    selectedSearchType = localStorage.getItem("preferedSearchType") || SearchTypes.FAST;

    $(".searchTypeSelection").removeClass("passive");

    if (selectedSearchType != SearchTypes.FAST)
	$(".searchTypeSelection .searchTypeOption").toggleClass("active");

    $(".searchBarInput").keyup(searchByInput);
    /* $(".searchBarInput").keyup(() => {
        const isFastSearch = selectedSearchType === SearchTypes.FAST;
        if (isFastSearch) return searchByInput();
        debounce(searchByInput, 800)();
    }); */

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

        localStorage.setItem("preferedSearchType", selectedSearchType);

        $(".searchTypeSelection .searchTypeOption").toggleClass("active");

        if (document.getElementById("searchOverlay").className.includes('searchShown'))
            document.getElementById("fullViewSearchInput").focus();

        searchByInput();
        /* matchedAnimes = new Array();
        showSearchResults(); */
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
            if (animeListLoaded) return;
            worker.postMessage("load");
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


let timerBeforeLoadingList;

function searchByInput(e, type) {
    // User typed in search before full list is fetched.
    if (!animeListLoaded) {
        $(".searchLoaderContainer").addClass("searchLoaderActive");
        timerBeforeLoadingList = setTimeout(searchByInput, 500);
        return;
    } else {
        clearTimeout(timerBeforeLoadingList);
        $(".searchLoaderContainer").removeClass("searchLoaderActive");
    }

    const search = $(".searchBarInput").val();
    if (!search.toLowerCase().trim() && type != "filter") {
        $("#fullViewSearchResults").html("");
        toggleLoadMoreButton(false);
        lastSearch = undefined;
        return;
    }
    if (search.toLowerCase().trim() == lastSearch && type != "filter") return;

    lastSearch = search.toLowerCase().trim();

    const options = typeof filters == "object" ? {...filters} : new Object();
    worker.postMessage({ type: (type || selectedSearchType), search: search, options: options });
};

const showSearchResults = () => {

    // Reset elements before showing new results.
    $("#fullViewSearchResults").html("");

    if (matchedAnimes.length && matchedAnimes[0] !== true)
        document.getElementById("fullViewSearchResults").insertAdjacentElement("afterbegin", notFound);
    else matchedAnimes.shift();

    const isFastSearch = selectedSearchType === SearchTypes.FAST;
    const resultLimit = isFastSearch
        ? INITIAL_RESULT_LIMIT * 2
        : INITIAL_RESULT_LIMIT;
    const searchFuncByType = isFastSearch
        ? getFastSearchResults
        : getDetailedSearchResults;
    const searchResults = matchedAnimes.slice(0, resultLimit);

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
    const animeUrl = "/" + animeInfo.info_slug;
    const titleHighlightedOriginal = getHighlightedText(
        animeInfo[getTitleProp(animeInfo)],
        searchValue
    );
    const shouldIncludeEnglishTitle =
        animeInfo.info_titleenglish !== animeInfo[getTitleProp(animeInfo)];
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
                        <a class="anizmLinkWrapper" href="/${episode.episode_slug}" target="_blank">
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
                        <a class="anizmLinkWrapper" href="/${episode.episode_slug}" target="_blank">
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
  <img class="card-poster mal-img" src="${extensionPath}assets/mal.svg" alt="MAL sayfası">
 </a>
 <span class="anilist-link" onclick="mal2anilistOpen(${animeInfo.info_malid})">
  <img class="card-poster anilist-img" src="${extensionPath}assets/anilist.svg" alt="AniList sayfası">
 </span>
</div>
</div>
<div class="resultImgDate">
<a href="${animeUrl}">
 <img src="images/loading.gif" data-src="/storage/pcovers/${animeInfo.info_poster}" class="animeImg lazyload" />
 ${episodeCount ? '<span class="animeEpisodeCount">' + episodeCount + "</span>" : ""}
</a>
<span class="animeDate">Yapım Yılı: ${animeInfo.info_year || "bilinmiyor"}</span>
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
        animeInfo[getTitleProp(animeInfo)],
        searchValue,
        true
    );
    const shouldIncludeEnglishTitle =
        animeInfo.info_titleenglish !== animeInfo[getTitleProp(animeInfo)];
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
                  <a class="anizmLinkWrapper" href="/${episode.episode_slug}" target="_blank">
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
            <a class="anizmAbsoluteDetailLink" href="/${animeInfo.info_slug}" target="_blank">
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
