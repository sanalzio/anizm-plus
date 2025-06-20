bun minify_manifest.js



#### Minify Javascript ####

# scripts/
bun build --minify-syntax --minify-whitespace --splitting --outdir=./build/scripts/ ./scripts/applyTheme.js ./scripts/arama.js ./scripts/options.js ./scripts/popup.js
# inject_scripts/
bun build --minify-syntax --minify-whitespace --splitting --outdir=./build/inject_scripts/ ./inject_scripts/aincrad_inject.js ./inject_scripts/chatango.js ./inject_scripts/document_start.js ./inject_scripts/document_end.js ./inject_scripts/player_inject_css.js ./inject_scripts/chat_window_inject.js
# replace_scripts/
bun build --minify-syntax --minify-whitespace --splitting --outdir=./build/replace_scripts/ ./replace_scripts/custom.js ./replace_scripts/episodea.js ./replace_scripts/searchOverlayOnce.js
# backgorund.js
bun build --minify-syntax --minify-whitespace --splitting --outdir=build background.js

#### Minify Javascript ####



#### Minify CSS ####

# styles/
css-minify -d ./styles/
mv ./css-dist/main.min.css ./build/styles/main.css
mv ./css-dist/options.min.css ./build/styles/options.css
mv ./css-dist/popup.min.css ./build/styles/popup.css
rm -rf css-dist
# minify ./styles/main.css > ./build/styles/main.css
# minify ./styles/options.css > ./build/styles/options.css
# minify ./styles/popup.css > ./build/styles/popup.css

# styles/design/
minify ./styles/design/chat_window.css > ./build/styles/design/chat_window.css
minify ./styles/design/chatango.css > ./build/styles/design/chatango.css
minify ./styles/design/for_color_themes.css > ./build/styles/design/for_color_themes.css
minify ./styles/design/min_theme.css > ./build/styles/design/min_theme.css
minify ./styles/design/necessary.css > ./build/styles/design/necessary.css
minify ./styles/design/remove_bgs.css > ./build/styles/design/remove_bgs.css

# styles/colors/
minify ./styles/colors/blue_theme.css > ./build/styles/colors/blue_theme.css
minify ./styles/colors/gray_theme.css > ./build/styles/colors/gray_theme.css
minify ./styles/colors/green_theme.css > ./build/styles/colors/green_theme.css
minify ./styles/colors/orange_theme.css > ./build/styles/colors/orange_theme.css
minify ./styles/colors/pink_theme.css > ./build/styles/colors/pink_theme.css
minify ./styles/colors/purple_theme.css > ./build/styles/colors/purple_theme.css
minify ./styles/colors/red_theme.css > ./build/styles/colors/red_theme.css

# docs/assets/css/
minify ./docs/assets/css/github-markdown.css > ./build/docs/assets/css/github-markdown.css
minify ./docs/assets/css/pilcrow.css > ./build/docs/assets/css/pilcrow.css

#### Minify CSS ####



#### Minify HTML ####

minify arama.html > ./build/arama.html
minify options.html > ./build/options.html
minify popup.html > ./build/popup.html

#### Minify HTML ####



#### Convert and minify help.md ####

cp -r docs inp
rm ./inp/help.html
generate-md --layout github --input ./inp --output ./out
rm -rf inp
mv ./out/help.html ./docs/help.html
rm -rf out
minify ./docs/help.html > ./build/docs/help.html

#### Convert and minify help.md ####
