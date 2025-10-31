let themeIds = [
    "orange",
    "green",
    "blue",
    "pink",
    "purple",
    "red",
    "gray"
];

let faviconPath = new Object();
let logoPath = new Object();
let logoSmallPath = new Object();

themeIds.forEach(themeId => {
    faviconPath[themeId] = "../assets/favicon/"+ themeId +".png";
    logoPath[themeId] = "../assets/logo/"+ themeId +".webp";
    logoSmallPath[themeId] = "../assets/icon/"+ themeId +".png";
});

let themeLink = document.getElementById("theme-link");
let themeStyle = document.getElementById("theme-style");
let logoImg = document.getElementsByClassName("logo");
if (logoImg) logoImg = logoImg[0];
let logoSmallImg = document.getElementsByClassName("logo-small");
if (logoSmallImg) logoSmallImg = logoSmallImg[0];
let faviconLink = document.getElementById("favicon");


function replaceElements(string, array) {
    array.forEach((e,i)=>string=string.replaceAll("$"+i, e));
    return string;
}


function switchTheme(themeId) {

    try {
        [...document.querySelectorAll("canvas.logo,canvas.logo-small")]
            .forEach(el=>el.remove());
    } catch {}

    if (!themeIds.includes(themeId)) {

        if (themeId.startsWith("$")) {

            const themeArray = themeId.slice(1).split(" ");

            try {

                logoImg.src = logoPath["orange"];

                try { faviconLink.href = faviconPath["gray"] } catch {}
                try { logoSmallImg.src = logoSmallPath["orange"] } catch {}

                [logoImg, logoSmallImg].forEach(el=>{
                    function handleLoad(e) {
                        const img = e.target;
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });

                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;

                        const targetH = parseInt(themeArray[1]) / 360;
                        const targetS = parseInt(themeArray[2]) / 100;
                        const targetL = parseInt(themeArray[3]) / 100;

                        // ortalama lightness hesapla
                        /*let sumL = 0;
                        let count = 0;
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i] / 255;
                            const g = data[i + 1] / 255;
                            const b = data[i + 2] / 255;
                            const max = Math.max(r, g, b);
                            const min = Math.min(r, g, b);
                            const l = (max + min) / 2;
                            sumL += l;
                            count++;
                        }
                        const avgL = sumL / count;*/
                        const avgL = 0.23824762947990613;

                        // fark
                        const diff = targetL - avgL;

                        function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
                        function smoothstep(x) { x = clamp(x, 0, 1); return x*x*(3 - 2*x); }

                        const mixMinBright = 0.25, mixMaxBright = 0.60;
                        const gammaBrightMin = 1.25, gammaBrightMax = 1.4;

                        const mixMinDark = 0.25, mixMaxDark = 0.45;
                        const gammaDarkMin = 0.5, gammaDarkMax = 0.9;

                        // diff zaten hesaplanmış
                        const d = diff; // targetL - avgL
                        const m = clamp(Math.abs(d) / 0.5, 0, 1); // normalize
                        const s = smoothstep(m);

                        let mixAmount, gamma;
                        if (d > 0) { // hedef daha açık -> hafif etki, gamma düşük
                            mixAmount = mixMinBright + (mixMaxBright - mixMinBright) * s;
                            // gamma düşsün ama aşırı düşmesin: m arttıkça gamma biraz düşer
                            gamma = gammaBrightMin + (gammaBrightMax - gammaBrightMin) * (1 - m);
                        } else {    // hedef daha koyu -> daha güçlü etki, gamma yüksek
                            mixAmount = mixMinDark + (mixMaxDark - mixMinDark) * s;
                            gamma = gammaDarkMin + (gammaDarkMax - gammaDarkMin) * m;
                        }

                        // güvenlik: sınırlar
                        mixAmount = clamp(mixAmount, 0.05, 0.85);
                        gamma = clamp(gamma, 0.6, 2.0);

                        const maxAdjust = 0.15; // en fazla +-% ışık değişimi
                        let lightnessAdjust = diff * mixAmount;
                        lightnessAdjust = clamp(lightnessAdjust, -maxAdjust, maxAdjust);

                        const contrast = 2; // 1.0 = normal, 1.2 = %20 daha yüksek, 1.5 agresif olur

                        for (let i = 0; i < data.length; i += 4) {
                            let r = data[i] / 255;
                            let g = data[i + 1] / 255;
                            let b = data[i + 2] / 255;

                            const max = Math.max(r, g, b);
                            const min = Math.min(r, g, b);
                            let l = (max + min) / 2;

                            // aydınlık düzeltme
                            l = l + lightnessAdjust;

                            // gamma'yı fark yönüne göre uygula
                            l = Math.pow(Math.min(1, Math.max(0, l)), gamma);

                            // kontrastı uygula (orta noktadan uzaklaştır)
                            l = 0.5 + (l - 0.5) * contrast;
                            l = Math.min(1, Math.max(0, l)); // sınırları aşma

                            const q = l < 0.5 ? l * (1 + targetS) : l + targetS - l * targetS;
                            const p = 2 * l - q;

                            function hue2rgb(p, q, t) {
                                t = ((t % 1) + 1) % 1;
                                if (t < 1/6) return p + (q - p) * 6 * t;
                                if (t < 1/2) return q;
                                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                                return p;
                            }

                            data[i]     = hue2rgb(p, q, targetH + 1/3) * 255;
                            data[i + 1] = hue2rgb(p, q, targetH) * 255;
                            data[i + 2] = hue2rgb(p, q, targetH - 1/3) * 255;
                        }

                        ctx.putImageData(imageData, 0, 0);
                        img.parentElement.appendChild(canvas);
                        canvas.className = img.className;
                        img.classList.add("none");
                        canvas.classList.remove("none");
                        e.target.onload = ()=>{};
                    }
                    
                    el.onload = handleLoad;
                });
            } catch (err) {
                logoImg.src = logoPath["gray"];
                faviconLink.href = faviconPath["gray"];
                logoSmallImg.src = logoSmallPath["gray"];
                console.log(err);
            }

            fetch("../styles/colors/custom_theme.css")
                .then(res=>res.text())
                .then(data=> themeStyle.textContent = themeArray[0].replaceAll(themeArray[0], data))
        }
        return;
    }

    [logoImg, logoSmallImg].forEach(el=>el.classList.remove("none"));

    themeStyle.textContent = "";

    try { faviconLink.href = faviconPath[themeId] } catch {}
    try { logoSmallImg.src = logoSmallPath[themeId] } catch {}

    logoImg.src = logoPath[themeId];

    themeLink.href = `../styles/colors/${themeId}_theme.css`;
}

document.addEventListener("DOMContentLoaded", () => {
    browserObj.storage.local.get(["themeId", "applyColor"], function (result) {
        if (result.applyColor && result.themeId)
            switchTheme(result.themeId || "orange");
    });
});
