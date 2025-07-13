const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);


if (isTouchDevice && isMobileUA) {

    let isVideoPlaying, lastClickX = 0, lastClickTime = 0;

    document.addEventListener('click', (e) => {
        const now = Date.now();
        const x = e.clientX;
        const y = e.clientY;

        const DOUBLE_CLICK_DELAY = 300; // ms
        const MAX_DISTANCE = 30; // px — aynı yerde çift tıklanmalı

        if (
            now - lastClickTime < DOUBLE_CLICK_DELAY &&
            Math.abs(x - lastClickX) < MAX_DISTANCE
        ) {
            // Çift tıklama tespit edildi
            const width = window.innerWidth;
            const region = x < width * 0.33 ? 'left' :
                           x > width * 0.66 ? 'right' : undefined; //'center';

            if (region === 'left') {
                const video = document.getElementsByTagName("video")[0];
                if (!video) return;

                e.stopImmediatePropagation();
                e.preventDefault();

                video.currentTime -= 5;
                if (isVideoPlaying) video.play();
                else video.pause();
            } else if (region === 'right') {
                const video = document.getElementsByTagName("video")[0];
                if (!video) return;

                e.stopImmediatePropagation();
                e.preventDefault();

                video.currentTime += 5;
                if (isVideoPlaying) video.play();
                else video.pause();
            }

            lastClickTime = 0; // Reset
            lastClickX = 0;
        } else {
            // İlk tıklama
            lastClickTime = now;
            lastClickX = x;

            const video = document.getElementsByTagName("video")[0];
            if (!video) return;
            isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
        }
    }, true); // capture fazında dinle
}
else {

    document.addEventListener("click", (e) => {
        if (e.target.id == "skip-outro" || e.target.id == "skip-intro")
            document.getElementsByTagName("video")[0].focus();
    });

    // "ç" tuşu ile bir kare geriye, "." tuşu ile bir kare ileriye atlamayı sağlar.
    document.addEventListener("keydown", function (e) {
      const video = document.getElementsByTagName("video")[0];
      if (!video) return;

      const frameTime = 1 / 30;

      if (e.key === ".") {
        video.pause();
        video.currentTime = Math.min(video.duration, video.currentTime + frameTime);
      }

      if (e.key === "ç") {
        video.pause();
        video.currentTime = Math.max(0, video.currentTime - frameTime);
      }
    });

}
