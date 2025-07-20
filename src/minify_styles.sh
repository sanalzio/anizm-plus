css-minify -d ./styles/
mv ./css-dist/main.min.css ./build/styles/main.css
mv ./css-dist/options.min.css ./build/styles/options.css
mv ./css-dist/popup.min.css ./build/styles/popup.css
mv ./css-dist/newversion.min.css ./build/styles/newversion.css
rm -rf css-dist

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