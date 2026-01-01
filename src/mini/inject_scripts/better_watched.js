const disableWatch = document.getElementById("disablewatch")
const disableLastSeen = document.getElementById("disablelastseen")

const originalWatched = window.Watched;
const originalLastSeen = window.updateLastSeen;

window.Watched = function () {
    if (disableWatch) {
        console.log("🚫 İzledi bilgisi engellendi.");
        return;
    }

    originalWatched();
    document.getElementById('addWatched').style.display = "none";
    document.getElementById('deleteWatched').style.display = "inherit";
}

window.updateLastSeen = function () {
    if (disableLastSeen) {
        console.log("🚫 Son görülme bilgisi engellendi.");
        return;
    }
    originalLastSeen();
}

globalThis.a=Watched;
globalThis.b=updateLastSeen