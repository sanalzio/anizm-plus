rm -rf ../build_mini

cp -R ../build ../build_mini

bun minjson.js ../mini/manifest.json ../build_mini/manifest.json


cp -r ../scripts/ace/ ../build/scripts/

#### Minify Javascript ####

# scripts/
bun build --minify-syntax --minify-whitespace --splitting --outdir=../build_mini/scripts/ ../mini/scripts/options.js
# inject_scripts/
bun build --minify-syntax --minify-whitespace --splitting --outdir=../build_mini/inject_scripts/ ../mini/inject_scripts/document_start.js
# backgorund.js
#bun build --minify-syntax --minify-whitespace --splitting --outdir=../build_mini ../mini/background.js

#### Minify Javascript ####



#### Minify CSS ####

minify ../mini/styles/options.css > ../build_mini/styles/options.css

#### Minify CSS ####



#### Minify HTML ####

minify ../mini/pages/options.html > ../build_mini/pages/options.html

#### Minify HTML ####



rm -rf ../build_mini/docs/
rm -rf ../build_mini/replace_scripts/
rm -rf ../build_mini/components/
rm -rf ../build_mini/assets/favicon/



# rm ../build_mini/assets/icon/cvt.sh
rm ../build_mini/anizm-plus.zip
rm ../build_mini/styles/design/chat_window.css
rm ../build_mini/styles/design/chatango.css
rm ../build_mini/styles/design/filters.css
rm ../build_mini/background.js
rm ../build_mini/pages/newversion.html
rm ../build_mini/styles/newversion.css
rm ../build_mini/scripts/newversion.js
rm ../build_mini/inject_scripts/chat_window_inject.js
rm ../build_mini/inject_scripts/chatango.js
rm ../build_mini/inject_scripts/aincrad_inject.js
rm ../build_mini/inject_scripts/filters.js
rm ../build_mini/inject_scripts/player_inject_css.js
