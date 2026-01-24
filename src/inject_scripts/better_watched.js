const disableWatch = document.getElementById("disablewatch")

const originalWatched = window.Watched;

window.Watched = function () {
    if (disableWatch) {
        console.log("🚫 İzledi bilgisi engellendi.");
        return;
    }

    originalWatched();
    document.getElementById('addWatched').style.display = "none";
    document.getElementById('deleteWatched').style.display = "inherit";
}

globalThis.a=Watched;