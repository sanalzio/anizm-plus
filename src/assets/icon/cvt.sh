cd ~/Documents/projects/WEB/anizm-plus/src/assets/icon
for img in *.png; do
    filename=$(basename "$img" .png)
    convert "$img" -resize 64x64\! "../favicon/$filename.png"
done
