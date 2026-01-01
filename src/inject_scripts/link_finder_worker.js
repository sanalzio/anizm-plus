let stopped = false;

async function streamJsonObjects(url, onItem) {

    stopped = false;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let braceDepth = 0;
    let inString = false;
    let escapeNext = false;
    let started = false;

    while (!stopped) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        for (let ch of chunk) {

            if (stopped) break;

            // Başlangıçta sadece '[' bekle
            if (!started) {
                if (ch === "[") started = true;
                continue;
            }

            // Eğer henüz nesne başlamadıysa '{' bekle
            if (braceDepth === 0 && ch !== "{") {
                if (ch === "]") return; // Stream bitti
                continue;
            }

            buffer += ch;

            if (escapeNext) {
                escapeNext = false;
                continue;
            }

            if (ch === "\\") {
                escapeNext = true;
                continue;
            }

            if (ch === '"') {
                inString = !inString;
                continue;
            }

            if (!inString) {
                if (ch === "{") {
                    braceDepth++;
                } else if (ch === "}") {
                    braceDepth--;
                }
            }

            if (braceDepth === 0 && buffer.trim()) {
                try {
                    const obj = JSON.parse(buffer);
                    if (onItem?.(obj)) break; // Callback
                } catch (e) {
                    console.error(
                        "JSON parse error:",
                        e,
                        "Buffer was:",
                        buffer
                    );
                }
                buffer = "";
            }
        }
    }
}


function postObj(obj) {
    self.postMessage(obj);
}


self.addEventListener('message', function (e) {
    if (!e.data) return;

    if (e.data == "!stop")
        stopped = true;

    streamJsonObjects(e.data, postObj);
});