mkdir ../build/
mkdir ../build/styles/
mkdir ../build/styles/colors/
mkdir ../build/styles/design/
mkdir ../build/docs/
mkdir ../build/docs/assets/
mkdir ../build/docs/assets/css/
mkdir ../build/pages/
mkdir ../build/inject_scripts/
mkdir ../build/scripts/
mkdir ../build/scripts/ace/
mkdir ../build/scripts/ace/snippets/
mkdir ../build/replace_scripts/
mkdir ../build/components/
mkdir ../build/assets/favicon/

bun minjson.js ../manifest.json ../build/manifest.json
bun minjson.js ../styles/colors/themes.json ../build/styles/colors/themes.json

cp -r ../assets/ ../build/


cp -r ../scripts/ace/ ../build/scripts/

#### Minify Javascript ####

# scripts/
bun build --format cjs --minify-syntax --minify-whitespace --splitting --outdir=../build/scripts/ ../scripts/applyTheme.js ../scripts/arama.js ../scripts/options.js ../scripts/popup.js ../scripts/newversion.js
# inject_scripts/
bun build --format cjs --minify-syntax --minify-whitespace --splitting --outdir=../build/inject_scripts/ ../inject_scripts/link_finder.js ../inject_scripts/filters.js ../inject_scripts/aincrad_inject.js ../inject_scripts/document_start.js ../inject_scripts/document_end.js ../inject_scripts/player_inject_css.js ../inject_scripts/chat_window_inject.js
# replace_scripts/
bun build --format cjs --minify-syntax --minify-whitespace --splitting --outdir=../build/replace_scripts/ ../replace_scripts/custom.js ../replace_scripts/episodea.js ../replace_scripts/searchOverlayOnce.js ../replace_scripts/searchWorker.js
# backgorund.js
bun build --format cjs --minify-syntax --minify-whitespace --splitting --outdir=../build ../background.js

#### Minify Javascript ####



#### Minify CSS ####

# styles/
css-minify -d ../styles/
mv ./css-dist/main.min.css ../build/styles/main.css
mv ./css-dist/options.min.css ../build/styles/options.css
mv ./css-dist/popup.min.css ../build/styles/popup.css
mv ./css-dist/newversion.min.css ../build/styles/newversion.css
rm -rf css-dist
# minify ../styles/main.css > ../build/styles/main.css
# minify ../styles/options.css > ../build/styles/options.css
# minify ../styles/popup.css > ../build/styles/popup.css

# styles/design/
minify ../styles/design/chat_window.css > ../build/styles/design/chat_window.css
#minify ../styles/design/chatango.css > ../build/styles/design/chatango.css
minify ../styles/design/for_color_themes.css > ../build/styles/design/for_color_themes.css
minify ../styles/design/min_theme.css > ../build/styles/design/min_theme.css
minify ../styles/design/necessary.css > ../build/styles/design/necessary.css
#minify ../styles/design/glassy.css > ../build/styles/design/glassy.css
#minify ../styles/design/remove_bgs.css > ../build/styles/design/remove_bgs.css
minify ../styles/design/filters.css > ../build/styles/design/filters.css

# styles/colors/
minify ../styles/colors/blue_theme.css > ../build/styles/colors/blue_theme.css
minify ../styles/colors/gray_theme.css > ../build/styles/colors/gray_theme.css
minify ../styles/colors/green_theme.css > ../build/styles/colors/green_theme.css
minify ../styles/colors/orange_theme.css > ../build/styles/colors/orange_theme.css
minify ../styles/colors/pink_theme.css > ../build/styles/colors/pink_theme.css
minify ../styles/colors/purple_theme.css > ../build/styles/colors/purple_theme.css
minify ../styles/colors/red_theme.css > ../build/styles/colors/red_theme.css
minify ../styles/colors/custom_theme.css > ../build/styles/colors/custom_theme.css

# docs/assets/css/
minify ../docs/assets/css/github-markdown.css > ../build/docs/assets/css/github-markdown.css
minify ../docs/assets/css/pilcrow.css > ../build/docs/assets/css/pilcrow.css

#### Minify CSS ####



#### Minify HTML ####

minify ../pages/arama.html > ../build/pages/arama.html
minify ../pages/options.html > ../build/pages/options.html
minify ../pages/popup.html > ../build/pages/popup.html
minify ../pages/newversion.html > ../build/pages/newversion.html
minify ../components/filtermenu.html > ../build/components/filtermenu.html

#### Minify HTML ####



#### Convert and minify help.md ####

cp -r ../docs/ ../inp/
rm ../inp/help.html
generate-md --layout github --input ../inp/ --output ../out/
rm -rf ../inp/
mv ../out/help.html ../docs/help.html
rm -rf ../out/
minify ../docs/help.html > ../build/docs/help.html

#### Convert and minify help.md ####


rm ../build/assets/icon/cvt.sh

echo Building mini version...
./build_mini.sh
