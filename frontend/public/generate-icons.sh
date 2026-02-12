#!/bin/bash
# Generate placeholder PWA icons

SIZES=(72 96 128 144 152 192 384 512)
COLOR="#6366f1"

for size in "${SIZES[@]}"; do
  convert -size ${size}x${size} xc:"$COLOR" \
    -gravity center \
    -pointsize $((size/3)) \
    -fill white \
    -font Arial-Bold \
    -annotate +0+0 "ɳ" \
    icon-${size}.png 2>/dev/null || {
    # Fallback if ImageMagick not installed: create simple colored square
    cat > icon-${size}.png.svg << EOF
<svg width="$size" height="$size" xmlns="http://www.w3.org/2000/svg">
  <rect width="$size" height="$size" fill="$COLOR"/>
  <text x="50%" y="50%" font-size="$((size/2))" font-family="Arial" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">ɳ</text>
</svg>
EOF
  }
done

# Create badge icon
convert -size 72x72 xc:"$COLOR" \
  -gravity center \
  -pointsize 36 \
  -fill white \
  -font Arial-Bold \
  -annotate +0+0 "ɳ" \
  badge-72.png 2>/dev/null || echo "Badge icon needs manual creation"

echo "Icons generated!"
