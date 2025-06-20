import { file, write } from "bun";

function stripJsonCommentsSafe(json) {
    let insideString = false;
    let insideComment = false;
    let result = '';
    let i = 0;

    while (i < json.length) {
        const current = json[i];
        const next = json[i + 1];

        if (!insideComment && current === '"' && json[i - 1] !== '\\') {
            insideString = !insideString;
            result += current;
            i++;
            continue;
        }

        if (!insideString) {
            if (!insideComment && current === '/' && next === '/') {
                insideComment = 'line';
                i += 2;
                continue;
            } else if (!insideComment && current === '/' && next === '*') {
                insideComment = 'block';
                i += 2;
                continue;
            } else if (insideComment === 'line' && (current === '\n' || current === '\r')) {
                insideComment = false;
                result += current;
                i++;
                continue;
            } else if (insideComment === 'block' && current === '*' && next === '/') {
                insideComment = false;
                i += 2;
                continue;
            }
        }

        if (!insideComment) result += current;
        i++;
    }

    return result;
}

const manifestFileObj = file("manifest.json");
const manifestFileContent = await manifestFileObj.text();
const manifest = JSON.parse(stripJsonCommentsSafe(manifestFileContent));

write("./build/manifest.json", JSON.stringify(manifest, null, 0));

