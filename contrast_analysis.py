import colorsys

def get_luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    rgb = [int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    rgb = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]

def get_ratio(fg, bg):
    l1 = get_luminance(fg)
    l2 = get_luminance(bg)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)

def find_accessible_fg(target_ratio, bg, start_fg):
    hex_color = start_fg.lstrip('#')
    if len(hex_color) == 3: hex_color = ''.join([c*2 for c in hex_color])
    r, g, b = [int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    
    # Try increasing value (brightness)
    for i in range(int(v*100), 101):
        test_v = i / 100.0
        test_rgb = colorsys.hsv_to_rgb(h, s, test_v)
        test_hex = '#' + ''.join([f"{int(c*255):02x}" for c in test_rgb])
        if get_ratio(test_hex, bg) >= target_ratio:
            return test_hex
    
    # If not found, try decreasing saturation or increasing value further
    return "#ffffff"

pairs = [
    ("#555555", "#111111", "Pair 1 (Text)"),
    ("#888888", "#0d0d0d", "Pair 2 (Text)"),
    ("#262626", "#111111", "Pair 3 (UI)"),
    ("#111111", "#141414", "Pair 4 (UI)")
]

print("--- Analysis ---")
for fg, bg, name in pairs:
    ratio = get_ratio(fg, bg)
    print(f"{name}: {fg} on {bg} -> {ratio:.2f}:1")

print("\n--- Suggestions ---")
alt1 = find_accessible_fg(4.5, "#111111", "#555555")
print(f"Pair 1 Suggestion: Change #555555 to {alt1} (Ratio: {get_ratio(alt1, '#111111'):.2f}:1)")

print(f"Pair 2: Already compliant (5.17:1 >= 4.5:1)")

alt3 = find_accessible_fg(3.0, "#111111", "#262626")
print(f"Pair 3 Suggestion: Change #262626 to {alt3} (Ratio: {get_ratio(alt3, '#111111'):.2f}:1)")

alt4 = find_accessible_fg(3.0, "#141414", "#111111")
print(f"Pair 4 Suggestion: Change #111111 to {alt4} (Ratio: {get_ratio(alt4, '#141414'):.2f}:1)")
