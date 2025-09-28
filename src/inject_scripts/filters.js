var filters = {};

(function (callback) {
    if (document.getElementById('apply-filters-button')) {
        callback();
    } else {
        new MutationObserver((_, obs) => {
            if (document.getElementById('apply-filters-button')) {
                obs.disconnect();
                callback();
            }
        }).observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }
})(()=>{
    const filterBtn = document.getElementById("searchFilterButton");
    const resetBtn = document.getElementById("reset-filters-button");
    const applyBtn = document.getElementById("apply-filters-button");
    const filtersContainer = document.getElementById("filtersDropDown");

    const maxYear = (new Date().getUTCFullYear() + 1).toString();

    function resetFilters() {
        // Selects
        [
            ["sort", "sim"],
            ["orderby", "desc"],
            ["tagmode", "and"],
        ].forEach((obj) => {
            document.getElementById(obj[0]).value = obj[1];
        });

        // Ranges
        [
            ["malp", "0.1", "10"],
            ["words", "1", "50"],
            ["eps", "1", "2000"],
            ["year", "1930", maxYear],
        ].forEach((obj) => {
            window[obj[0] + "RangeInput"][0].value = obj[1];
            window[obj[0] + "RangeInput"][1].value = obj[2];
            window[obj[0] + "RangePrice"][0].value = obj[1];
            window[obj[0] + "RangePrice"][1].value = obj[2];
            window[obj[0] + "Range"].style.right = "0%";
            window[obj[0] + "Range"].style.left = "0%";
        });

        // Tags
        [...document.getElementsByClassName("filter-tag")].forEach((el) => {
            el.classList.forEach((tag) => {
                if (tag != "filter-tag" && tag != "r18") el.classList.remove(tag);
            });
        });

        filters = {};
    }

    resetBtn.addEventListener("click", resetFilters);
    applyBtn.addEventListener("click", () => {
        searchByInput();
    });

    [filterBtn, applyBtn].forEach((el) =>
        el.addEventListener("click", function (e) {
            filtersContainer.style.transform =
                filtersContainer.style.transform == "scaleY(1)"
                    ? "scaleY(0)"
                    : "scaleY(1)";
        })
    );

    window.addEventListener("click", function (e) {
        if (!([...document.querySelectorAll("#filterContainer *"), document.getElementById('filterContainer')].includes(e.target)))
            filtersContainer.style.transform = "scaleY(0)";
    });

    document.getElementById("filter-tags").addEventListener("click", (event) => {
        if (event.target.classList.contains("filter-tag")) {
            if (!filters.tags) {
                filters.tags = [];
                filters.excludeTags = [];
            }
            if (event.target.classList.contains("include")) {
                filters.excludeTags.push(event.target.textContent.trim().toLocaleLowerCase("tr"));
                filters.tags = filters.tags.filter(
                    (e) => !(e == event.target.textContent.trim().toLocaleLowerCase("tr"))
                );
                event.target.classList.remove("include");
                event.target.classList.add("exclude");
            } else if (event.target.classList.contains("exclude")) {
                filters.excludeTags = filters.excludeTags.filter(
                    (e) => !(e == event.target.textContent.trim().toLocaleLowerCase("tr"))
                );
                event.target.classList.remove("exclude");
            } else {
                filters.tags.push(event.target.textContent.trim().toLocaleLowerCase("tr"));
                event.target.classList.add("include");
            }
        }
    });

    [
        document.getElementById("sort"),
        document.getElementById("orderby"),
        document.getElementById("tagmode"),
    ].forEach((el) =>
        el.addEventListener("change", (event) => {
            filters[event.target.id] = event.target.value;
        })
    );

    let malpRangeMin = 0;
    var malpRange = document.querySelector("#malp-range-selected");
    var malpRangeInput = document.querySelectorAll("#malp-range-input input");
    var malpRangePrice = document.querySelectorAll("#malp-range-price input");

    malpRangeInput.forEach((input) => {
        input.addEventListener("input", (e) => {
            let minRange = Number(malpRangeInput[0].value);
            let maxRange = Number(malpRangeInput[1].value);
            if (maxRange - minRange < malpRangeMin) {
                if (e.target.className === "min") {
                    malpRangeInput[0].value = maxRange - malpRangeMin;
                } else {
                    malpRangeInput[1].value = minRange + malpRangeMin;
                }
            } else {
                malpRangePrice[0].value = minRange;
                malpRangePrice[1].value = maxRange;
                filters.minmalp = minRange;
                filters.maxmalp = maxRange;
                malpRange.style.left =
                    (minRange / malpRangeInput[0].max) * 100 + "%";
                malpRange.style.right =
                    100 - (maxRange / malpRangeInput[1].max) * 100 + "%";
            }
        });
    });

    malpRangePrice.forEach((input) => {
        input.addEventListener("input", (e) => {
            let minPrice = Number(malpRangePrice[0].value);
            let maxPrice = Number(malpRangePrice[1].value);
            if (
                maxPrice - minPrice >= malpRangeMin &&
                maxPrice <= malpRangeInput[1].max
            ) {
                if (e.target.className === "min") {
                    malpRangeInput[0].value = minPrice;
                    filters.minmalp = minPrice;
                    malpRange.style.left =
                        (minPrice / malpRangeInput[0].max) * 100 + "%";
                } else {
                    malpRangeInput[1].value = maxPrice;
                    filters.maxmalp = maxPrice;
                    malpRange.style.right =
                        100 - (maxPrice / malpRangeInput[1].max) * 100 + "%";
                }
            }
        });
    });

    let wordsRangeMin = 0;
    var wordsRange = document.querySelector("#words-range-selected");
    var wordsRangeInput = document.querySelectorAll("#words-range-input input");
    var wordsRangePrice = document.querySelectorAll("#words-range-price input");

    wordsRangeInput.forEach((input) => {
        input.addEventListener("input", (e) => {
            let minRange = Number(wordsRangeInput[0].value);
            let maxRange = Number(wordsRangeInput[1].value);
            if (maxRange - minRange < wordsRangeMin) {
                if (e.target.className === "min") {
                    wordsRangeInput[0].value = maxRange - wordsRangeMin;
                } else {
                    wordsRangeInput[1].value = minRange + wordsRangeMin;
                }
            } else {
                wordsRangePrice[0].value = minRange;
                wordsRangePrice[1].value = maxRange;
                filters.minwords = minRange;
                filters.maxwords = maxRange;
                wordsRange.style.left =
                    (minRange / wordsRangeInput[0].max) * 100 + "%";
                wordsRange.style.right =
                    100 - (maxRange / wordsRangeInput[1].max) * 100 + "%";
            }
        });
    });

    wordsRangePrice.forEach((input) => {
        input.addEventListener("input", (e) => {
            let minPrice = Number(wordsRangePrice[0].value);
            let maxPrice = Number(wordsRangePrice[1].value);
            if (
                maxPrice - minPrice >= wordsRangeMin &&
                maxPrice <= wordsRangeInput[1].max
            ) {
                if (e.target.className === "min") {
                    wordsRangeInput[0].value = minPrice;
                    filters.minwords = minPrice;
                    wordsRange.style.left =
                        (minPrice / wordsRangeInput[0].max) * 100 + "%";
                } else {
                    wordsRangeInput[1].value = maxPrice;
                    filters.maxwords = maxPrice;
                    wordsRange.style.right =
                        100 - (maxPrice / wordsRangeInput[1].max) * 100 + "%";
                }
            }
        });
    });

    let epsRangeMin = 0;
    var epsRange = document.querySelector("#eps-range-selected");
    var epsRangeInput = document.querySelectorAll("#eps-range-input input");
    var epsRangePrice = document.querySelectorAll("#eps-range-price input");

    epsRangeInput.forEach((input) => {
        input.addEventListener("input", (e) => {
            let minRange = Number(epsRangeInput[0].value);
            let maxRange = Number(epsRangeInput[1].value);
            if (maxRange - minRange < epsRangeMin) {
                if (e.target.className === "min") {
                    epsRangeInput[0].value = maxRange - epsRangeMin;
                } else {
                    epsRangeInput[1].value = minRange + epsRangeMin;
                }
            } else {
                epsRangePrice[0].value = minRange;
                epsRangePrice[1].value = maxRange;
                filters.mineps = minRange;
                filters.maxeps = maxRange;
                epsRange.style.left = (minRange / epsRangeInput[0].max) * 100 + "%";
                epsRange.style.right =
                    100 - (maxRange / epsRangeInput[1].max) * 100 + "%";
            }
        });
    });

    epsRangePrice.forEach((input) => {
        input.addEventListener("input", (e) => {
            let minPrice = Number(epsRangePrice[0].value);
            let maxPrice = Number(epsRangePrice[1].value);
            if (
                maxPrice - minPrice >= epsRangeMin &&
                maxPrice <= epsRangeInput[1].max
            ) {
                if (e.target.className === "min") {
                    epsRangeInput[0].value = minPrice;
                    filters.mineps = minPrice;
                    epsRange.style.left =
                        (minPrice / epsRangeInput[0].max) * 100 + "%";
                } else {
                    epsRangeInput[1].value = maxPrice;
                    filters.maxeps = maxPrice;
                    epsRange.style.right =
                        100 - (maxPrice / epsRangeInput[1].max) * 100 + "%";
                }
            }
        });
    });

    let yearRangeMin = 0;
    var yearRange = document.querySelector("#year-range-selected");
    var yearRangeInput = document.querySelectorAll("#year-range-input input");
    var yearRangePrice = document.querySelectorAll("#year-range-price input");

    yearRangeInput.forEach((input) => {
        input.max = maxYear;
        if (input.className === "max") input.value = maxYear;
        input.addEventListener("input", (e) => {
            let minRange = Number(yearRangeInput[0].value);
            let maxRange = Number(yearRangeInput[1].value);
            if (maxRange - minRange < yearRangeMin) {
                if (e.target.className === "min") {
                    yearRangeInput[0].value = maxRange - yearRangeMin;
                } else {
                    yearRangeInput[1].value = minRange + yearRangeMin;
                }
            } else {
                yearRangePrice[0].value = minRange;
                yearRangePrice[1].value = maxRange;
                filters.minyear = minRange;
                filters.maxyear = maxRange;
                yearRange.style.left =
                    ((minRange - yearRangeInput[1].min) /
                        (yearRangeInput[0].max - yearRangeInput[1].min)) *
                        100 +
                    "%";
                yearRange.style.right =
                    100 -
                    ((maxRange - yearRangeInput[1].min) /
                        (yearRangeInput[1].max - yearRangeInput[1].min)) *
                        100 +
                    "%";
            }
        });
    });

    yearRangePrice.forEach((input) => {
        if (input.className === "max") input.value = maxYear;
        input.addEventListener("input", (e) => {
            let minPrice = Number(yearRangePrice[0].value);
            let maxPrice = Number(yearRangePrice[1].value);
            if (
                maxPrice - minPrice >= yearRangeMin &&
                maxPrice <= yearRangeInput[1].max
            ) {
                if (e.target.className === "min") {
                    yearRangeInput[0].value = minPrice;
                    filters.minyear = minPrice;
                    yearRange.style.left =
                        (minPrice / yearRangeInput[0].max) * 100 + "%";
                } else {
                    yearRangeInput[1].value = maxPrice;
                    filters.maxyear = maxPrice;
                    yearRange.style.right =
                        100 - (maxPrice / yearRangeInput[1].max) * 100 + "%";
                }
            }
        });
    });
});
