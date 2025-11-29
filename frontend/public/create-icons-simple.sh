#!/bin/bash
# Simple script to create placeholder icons
# Uses ImageMagick if available, otherwise creates simple colored squares

SIZES=(192 512)

for size in "${SIZES[@]}"; do
  if command -v convert &> /dev/null; then
    # Use ImageMagick
    convert -size ${size}x${size} xc:#111827 \
            -fill "#f97316" -font Arial-Bold -pointsize $((size/3)) \
            -gravity center -annotate +0+0 "FR" \
            -roundrectangle 0,0,$((size-1)),$((size-1)),$((size/5)),$((size/5)) \
            "icon-${size}.png"
    echo "Created icon-${size}.png using ImageMagick"
  else
    # Create a simple colored square using Python
    python3 << EOF
from PIL import Image, ImageDraw, ImageFont
import os

size = ${size}
img = Image.new('RGB', (size, size), color='#111827')
draw = ImageDraw.Draw(img)

# Try to add text
try:
    font_size = size // 3
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
except:
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size // 3)
    except:
        font = ImageFont.load_default()

text = "FR"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
position = ((size - text_width) // 2, (size - text_height) // 2)

draw.text(position, text, fill='#f97316', font=font)
img.save('icon-${size}.png')
print(f'Created icon-${size}.png')
EOF
  fi
done

echo "Done! Icons created in public directory."

