@ECHO OFF

bun build --minify-syntax --minify-whitespace --splitting --outdir=./build/scripts/ ./scripts/applyTheme.js ./scripts/arama.js ./scripts/options.js ./scripts/popup.js ./scripts/newversion.js

bun build --minify-syntax --minify-whitespace --splitting --outdir=./build/inject_scripts/ ./inject_scripts/link_finder.js ./inject_scripts/filters.js ./inject_scripts/aincrad_inject.js ./inject_scripts/chatango.js ./inject_scripts/document_start.js ./inject_scripts/document_end.js ./inject_scripts/player_inject_css.js ./inject_scripts/chat_window_inject.js

bun build --minify-syntax --minify-whitespace --splitting --outdir=./build/replace_scripts/ ./replace_scripts/custom.js ./replace_scripts/episodea.js ./replace_scripts/searchOverlayOnce.js

bun build --minify-syntax --minify-whitespace --splitting --outdir=build background.js

pause>nul