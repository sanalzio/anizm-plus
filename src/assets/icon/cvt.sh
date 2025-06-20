cd ~/Documents/projects/WEB/anizm-plus/src/assets/icon
for img in *.png; do
    filename=$(basename "$img" .png)
    magick "$img" -resize 256x256\! "../favicon/$filename.png"
done
