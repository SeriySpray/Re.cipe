# RE.cipe — Full Codebase Explanation

> Everything explained from scratch. Assumes zero prior knowledge.

---

## 📁 Project Structure

```
re.cipe/
├── index.html            ← Landing page (what visitors see first)
├── auth.html             ← Login / Register page
├── styles.css            ← All visual styling for both pages
└── CODEBASE_EXPLAINED.md ← This file
```

---

## 📄 `index.html` — The Landing Page

### `<head>` — Page Setup (invisible to users)

**`<!DOCTYPE html>`**
Tells the browser "this is a modern HTML5 document." Always the first line of every HTML file.

**`<html lang="en">`**
The root element that wraps everything. `lang="en"` tells browsers and screen readers the page is in English.

**`<meta charset="UTF-8" />`**
Tells the browser to use UTF-8 character encoding. This is what allows special characters like `✓`, `▼`, `▷`, `█` to display correctly.

**`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`**
Makes the page work correctly on phones. Without this, phones zoom out and show a tiny desktop-sized page.
- `width=device-width` = use the phone's actual screen width
- `initial-scale=1.0` = don't zoom by default

**`<title>RE.cipe — Your Recipes, Your Terminal</title>`**
The text in the browser tab and in Google search results.

**`<meta name="description" content="..." />`**
Used by Google as the subtitle under the link in search results. Not visible on the page itself.

**`<link rel="preconnect" href="https://fonts.googleapis.com" />`** (×2)
Tells the browser to start connecting to Google's font servers *early*, before the font is requested. Makes the font load faster. `crossorigin` is a security attribute required specifically for font files.

**`<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />`**
Loads the **JetBrains Mono** font from Google Fonts. It's a monospace font (every character is the same width), which gives the terminal/code aesthetic.
- `wght@400;700` = load two weights: regular (400) and bold (700)
- `display=swap` = show a fallback font while loading, then swap in JetBrains Mono when ready

**`<link rel="stylesheet" href="styles.css" />`**
Loads our own CSS file that applies all visual styling to the page.

---

### `<nav class="navbar">` — The Top Navigation Bar

**`<nav>`**
A semantic HTML element meaning "navigation." Browsers and screen readers understand this is a navigation section.

**`<span class="logo">[RE.cipe]</span>`**
`<span>` is a generic inline container with no special meaning. Used here to hold the logo text and apply accent color styling.

**`<div class="nav-links">`**
A generic block container holding the page section links.
- `href="#demo"` = links to an element on the **same page** with `id="demo"`. The `#` means "scroll to this anchor."
- Works smoothly because of `scroll-behavior: smooth` in CSS.

**`&gt;`**
An HTML entity — the safe way to write the `>` character in HTML so the browser doesn't confuse it with an HTML tag. Displays as `>`.

**`href="auth.html#register"`**
Goes to the auth page AND opens the Register tab (handled by JavaScript on that page).

---

### `<section class="hero">` — The Big Welcome Screen

**`<section>`**
Semantic element meaning "a standalone section of content."

**`<p class="eyebrow">// terminal-style recipe management</p>`**
Small text above the main title. The `//` makes it look like a code comment, fitting the terminal theme.

**`<h1 class="hero-title">`**
The most important heading on the page (there should only be one `<h1>` per page).
- `<span class="accent">RE.</span>` — makes just "RE." display in accent color
- `<span class="cursor"></span>` — an **empty element** with no text, styled in CSS as a small blinking rectangle like a real terminal cursor

**`<div class="hero-cta">`**
CTA = Call To Action. The two main buttons. Currently they don't do anything on click since no backend exists yet.

**`<p class="scroll-hint">&gt; scroll to explore</p>`**
Absolutely positioned at the bottom center of the hero screen, hinting to scroll down.

---

### `<hr class="divider" />`

A self-closing element that draws a horizontal line between sections. Styled to use `--border` color with no default browser styling.

---

### Terminal Demo Section

A fake terminal window made of three parts:

**`term-bar`** — Top bar with three colored dots (red/yellow/green) mimicking macOS window controls, plus a centered title.

**`term-body`** — Content area with fake command-line output. Lines are colored differently using classes:
- `.t-cmd` = accent color — represents typed commands
- `.t-dim` = dim gray — represents folder/structure info
- `.t-text` = normal text — represents regular content
- `.t-acc` = accent color — represents successful output

**`&nbsp;`** — Non-breaking space. Regular spaces in HTML collapse to one; `&nbsp;` forces a visible space. Used for alignment in fake terminal output.

**`<span class="term-cursor"></span>`** — Empty blinking cursor at the end of the last line, making it look like the terminal is waiting for input.

**`term-status`** — Bottom status bar with a colored dot, a status message, and a line count.

---

### Features Section

Three cards in a CSS Grid (3 columns on desktop → 1 column on mobile). Each `.preview` div has `white-space: pre` in CSS, meaning whitespace and line breaks in the HTML are rendered exactly as written — like a `<pre>` tag — giving the code-block look without needing a `<pre>` element.

---

### Theme Switcher — CSS-Only Interactive Component

```html
<input type="radio" name="theme" id="t-green" class="theme-radio" checked />
```
Five hidden radio inputs. `name="theme"` groups them so only one can be checked at a time. `checked` on the first makes green the default. Hidden with `display: none` in CSS — users never see the actual inputs.

```html
<label for="t-green" class="swatch" data-theme="green">
```
Clicking a `<label>` that has a `for` attribute checks the matching radio input — this is built-in HTML behavior, no JavaScript needed. `data-theme="green"` is a custom data attribute used in CSS to apply per-swatch accent colors.

All 5 color-name spans exist in the HTML at once but are all hidden. CSS shows only the one matching the selected radio using the **sibling selector** (`~`) trick (explained in the CSS section below).

---

### How It Works Steps

Four steps in a CSS Grid. Each has a numbered circle, a function-style label, and a description. The grid adapts: 4 columns → 2 → 1 as the screen gets smaller.

---

### CTA Section (Bottom of Landing Page)

**`<pre class="ascii-art">`** — Preformatted text. Preserves whitespace and line breaks exactly. Used to display block-letter ASCII art of "RE" made from Unicode box-drawing characters (`█`, `╗`, `╔`, etc.).

**`<form action="#" method="post">`**
- `action="#"` = submits to the current page URL (does nothing real yet)
- `method="post"` = how data would be sent to a server when one exists
- `type="email"` = browser validates it looks like an email address
- `required` = browser won't submit if empty
- `autocomplete="email"` = hints to password managers what this field is for

---

### Footer

Just the logo and version number. `<footer>` is a semantic HTML element.

---

## 📄 `auth.html` — Login / Register Page

### `<body class="auth-page">`

The `auth-page` class makes the body a vertical flex column at least `100dvh` tall.
- `dvh` = **dynamic viewport height** — handles mobile browser address bars correctly (regular `vh` can be wrong on phones)
- This layout ensures the footer always sticks to the bottom even if the form content is short

### Navbar

Same structure as `index.html` but the logo `<span>` is now an `<a href="index.html">` — clicking the logo takes you back to the landing page.

### `<main class="auth-main">`

`<main>` is a semantic element for "the main content of the page." Styled to be centered both horizontally and vertically, taking all available space between the navbar and footer.

---

### The Tab Switcher — How It Works

The two hidden radio inputs sit **before** the terminal div in the HTML:

```html
<input type="radio" id="tab-login"    checked />
<input type="radio" id="tab-register" />
<div class="terminal">
  <label for="tab-login">$ login()</label>
  <label for="tab-register">$ register()</label>
  <div class="login-panel">...</div>
  <div class="register-panel">...</div>
</div>
```

The labels inside the terminal are linked to the inputs via `for`/`id`. Clicking a label checks its radio. CSS then uses the **general sibling selector** (`~`) to detect which radio is checked and show/hide the correct panel.

> ⚠️ The radio inputs **must be before** the terminal in HTML. CSS can only look forward in the document, never backward. This is why they're placed above the terminal div.

---

### Form Fields

Every input is paired with a `<label>` via matching `for`/`id`. Clicking the label focuses the input — important for usability and accessibility.

**`autocomplete="current-password"`** vs **`autocomplete="new-password"`**
Tells the browser/password manager whether this is a login form (fill an existing saved password) or registration form (suggest generating a new one).

**`novalidate`** on the `<form>` elements
Disables the browser's default validation popups so we can implement our own custom-styled validation later.

---

### Status Bar Messages

```html
<span class="auth-status-login">READY — awaiting credentials</span>
<span class="auth-status-register">READY — new user setup</span>
```

Both texts exist in the HTML at all times but are hidden by default. CSS shows only the one matching the active tab. This makes the terminal status bar text change when you switch tabs — no JavaScript needed.

---

### The JavaScript — Only Script in the Project

```js
function applyHash() {
  if (window.location.hash === '#register') {
    document.getElementById('tab-register').checked = true;
  } else {
    document.getElementById('tab-login').checked = true;
  }
}
applyHash();
window.addEventListener('hashchange', applyHash);
```

**`window.location.hash`** — The `#register` part of the current URL.

**`.checked = true`** — Programmatically checks a radio input. This triggers all the CSS rules that show/hide panels and highlight tabs, as if the user clicked it manually.

**`applyHash()`** called immediately — Runs when the page loads. Handles arriving from `index.html` via `> sign_up` (which links to `auth.html#register`).

**`window.addEventListener('hashchange', applyHash)`** — Fires whenever the URL hash changes *without a page reload*. Handles clicking `> sign_up` when already on `auth.html` — the URL changes from `auth.html` → `auth.html#register` without reloading, so we need this listener to catch it.

---

## 📄 `styles.css` — All Visual Styling

### `@import` — Load Font

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
```
Loads JetBrains Mono from Google, same as the `<link>` tag in HTML but done in CSS. Both methods work.

---

### `:root` — Design Tokens (CSS Variables)

```css
:root {
  --bg:      #0d0d0d;  /* near-black — main page background */
  --surface: #141414;  /* slightly lighter — cards, terminal backgrounds */
  --border:  #262626;  /* subtle dark lines between elements */
  --accent:  #00ff88;  /* the green highlight color — changes per theme */
  --text:    #e0e0e0;  /* light gray — main readable text */
  --muted:   #555;     /* very dim — footer text, placeholders */
  --dim:     #888;     /* medium dim — secondary/helper text */
  --font:    'JetBrains Mono', monospace;
  --radius:  4px;      /* slight corner rounding on all boxes */
}
```

`:root` targets the very top of the HTML document. Variables defined here are available **everywhere** in the CSS via `var(--name)`. Changing `--accent` in one place updates every accent-colored element across both pages instantly.

```css
[data-theme="amber"] { --accent: #ffb300; }
[data-theme="cyan"]  { --accent: #00d4ff; }
[data-theme="rose"]  { --accent: #ff4d6d; }
[data-theme="violet"]{ --accent: #a855f7; }
```
These override `--accent` only inside elements that have the matching `data-theme` attribute. Used by the theme preview terminal to show different accent colors without affecting the rest of the page.

---

### Reset

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
```
- `*` = every element on the page
- `::before`, `::after` = CSS pseudo-elements (decorative content added via CSS)
- `box-sizing: border-box` = padding and border are **included** in an element's total width/height (the sane default — without this, padding adds to width unexpectedly)
- `margin: 0; padding: 0` = removes all browser default spacing (browsers add margins to headings, paragraphs, etc. by default)

```css
html { scroll-behavior: smooth; }
```
Makes anchor links (`href="#demo"`) scroll smoothly instead of jumping instantly.

---

### `.navbar`

```css
.navbar {
  position: fixed;              /* stays at the top even when scrolling */
  top: 0; left: 0; right: 0;   /* stretches full width */
  display: flex;                /* children laid out in a row */
  align-items: center;          /* vertically centered */
  gap: 32px;                    /* space between logo, nav-links, nav-actions */
  padding: 0 40px;              /* left/right breathing room */
  height: 52px;
  background: rgba(13,13,13,0.92); /* 92% opaque dark — slightly see-through */
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(6px);   /* blurs content scrolling behind the navbar */
  z-index: 100;                 /* sits above all other content on the page */
}
```

```css
.nav-actions { display: flex; gap: 12px; margin-left: auto; }
```
`margin-left: auto` pushes this element all the way to the right by consuming all available leftover space.

---

### Buttons

```css
.btn {
  display: inline-flex;   /* flex layout but doesn't take full width */
  align-items: center;
  gap: 6px;
  padding: 7px 16px;      /* top/bottom 7px, left/right 16px */
  border-radius: var(--radius);
  transition: all 0.15s;  /* all property changes animate over 0.15 seconds */
}
```

**`.btn-ghost`** — Transparent background with a border outline. On hover: border and text turn accent color.

**`.btn-primary`** — Filled with accent color, dark text on top. On hover: slightly dimmer (`opacity: 0.85`).

**`.btn.large`** — Modifier class for bigger padding/font on the hero buttons.

---

### `.hero`

```css
.hero {
  min-height: 100dvh;       /* at least full screen tall */
  display: flex;
  flex-direction: column;   /* stack children vertically */
  align-items: center;      /* center horizontally */
  justify-content: center;  /* center vertically */
  text-align: center;
  padding: 80px 24px 48px;  /* top 80px clears the 52px fixed navbar */
  position: relative;       /* required so .scroll-hint can position inside it */
}
```

```css
font-size: clamp(56px, 12vw, 120px);
```
`clamp(min, preferred, max)`:
- minimum: 56px (never smaller)
- preferred: 12% of the viewport width (scales with screen)
- maximum: 120px (never larger)
This makes the title responsive without needing media queries.

```css
.cursor {
  position: absolute; left: 100%; bottom: 0.12em;
  /* positioned relative to .hero-title */
  /* left: 100% places it just after the end of the title text */
  width: 0.5em; height: 0.08em; /* thin wide rectangle */
  background: var(--accent);
  animation: blink 1s step-end infinite;
}
```

```css
.scroll-hint {
  position: absolute; bottom: 32px; left: 50%;
  transform: translateX(-50%);
  /* left: 50% moves the left edge to center */
  /* translateX(-50%) shifts it left by half its own width — true centering */
}
```

---

### Terminal Components

```css
.terminal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden; /* clips children to rounded corners */
}
```

```css
.term-body {
  padding: 16px 20px;
  font-size: 12px;
  line-height: 1.9; /* each line is 1.9× the font size tall — spacious terminal look */
  min-height: 120px;
}
```

```css
.term-cursor {
  display: inline-block;
  width: 0.5em; height: 0.08em;
  background: var(--accent);
  vertical-align: 0.1em; /* lifts slightly to align with text baseline */
  margin-left: 3px;
  animation: blink 1s step-end infinite;
}
```

---

### Theme Switcher — CSS Sibling Selector Trick

```css
#t-green:checked ~ .theme-row label[for="t-green"] {
  border-color: var(--swatch-color, #00ff88);
  color: var(--text);
  background: var(--bg);
}
```
Reads: "When the element with `id="t-green"` is `:checked`, find any `.theme-row` that is a **general sibling** (`~`) after it, and inside that find `label[for="t-green"]`, and apply these styles."

This highlights the active swatch label with zero JavaScript. The `~` selector only works forward in the document — this is why the radio inputs must appear before the labels in the HTML.

```css
.theme-display { display: none; }
#t-amber:checked ~ .theme-terminal .theme-name-amber { display: inline; }
```
All color name spans are hidden by default. Only the one matching the checked radio is shown.

```css
#t-amber:checked ~ .theme-terminal { --accent: #ffb300; }
```
Overrides `--accent` only within `.theme-terminal` when amber is selected — changing the color of all accent elements inside the preview without affecting the rest of the page.

---

### Auth Page Layout

```css
.auth-page { display: flex; flex-direction: column; min-height: 100dvh; }
```
**Sticky footer pattern** — the page is a vertical flex column at least as tall as the screen.

```css
.auth-main { flex: 1; }
```
`flex: 1` makes `<main>` grow to fill all remaining space between the navbar and footer. This pushes the footer to the bottom.

```css
padding: 88px 24px 48px;
/* top 88px = 52px navbar height + 36px breathing room */
```

---

### Auth Tab CSS

```css
/* All panels hidden by default */
.auth-panel { display: none; }

/* Show only the matching panel */
#tab-login:checked    ~ .terminal .login-panel    { display: block; }
#tab-register:checked ~ .terminal .register-panel { display: block; }

/* Active tab label styling */
#tab-login:checked ~ .terminal .auth-tabs label[for="tab-login"] {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
```

Same sibling selector pattern as the theme switcher — the checked radio state drives everything visually.

---

### Form Inputs

```css
.form-input {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-family: var(--font);
  font-size: 13px;
  color: var(--text);
  outline: none;             /* removes browser's default focus ring */
  transition: border-color 0.15s;
  width: 100%;
}
.form-input:focus { border-color: var(--accent); } /* custom focus indicator */
```

---

### Autofill Fix

```css
.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus,
.form-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 100px var(--bg) inset;
  -webkit-text-fill-color: var(--text);
  caret-color: var(--text);
  border-color: var(--accent);
  transition: background-color 0s 999999s;
}
```

**`:-webkit-autofill`** — Special browser pseudo-class that activates when a browser or password manager fills in a field automatically. Browsers force a white/yellow background and you cannot override it with the `background` property directly.

**`-webkit-box-shadow: 0 0 0 100px var(--bg) inset`** — The workaround: apply a massive **inset box shadow** (100px covers the whole input) in your desired background color. This visually paints over the forced white background.

**`-webkit-text-fill-color`** — `color` is ignored on autofilled inputs in some browsers. This property overrides text color reliably.

**`transition: background-color 0s 999999s`** — Delays the background-color transition by ~11.5 days (999999 seconds). Prevents the browser's autofill animation from flashing white even briefly when multiple fields are filled at once.

---

### Animations

```css
@keyframes blink {
  0%, 100% { opacity: 1; }  /* fully visible */
  50%       { opacity: 0; }  /* fully invisible */
}
```
Used with `animation: blink 1s step-end infinite`:
- `1s` = one full blink cycle per second
- `step-end` = jumps instantly between states (no smooth fade) — real terminal cursors blink hard, not softly
- `infinite` = loops forever

---

### Responsive Breakpoints

```css
@media (max-width: 768px) {
  /* Tablets and smaller phones */
  .navbar { padding: 0 16px; }            /* less side padding */
  .nav-links { display: none; }           /* too cramped — hide page section links */
  .cards { grid-template-columns: 1fr; }  /* 3 columns → 1 column */
  .steps { grid-template-columns: repeat(2, 1fr); } /* 4 columns → 2 */
  .footer { flex-direction: column; gap: 12px; text-align: center; padding: 24px 16px; }
}

@media (max-width: 480px) {
  /* Small phones */
  .steps { grid-template-columns: 1fr; }         /* 2 columns → 1 */
  .hero-cta { flex-direction: column; align-items: center; } /* buttons stack */
  .cta-form { flex-direction: column; }          /* email input + button stack */
}
```

`@media (max-width: 768px)` = "apply these rules only when the screen is 768px wide or narrower." 768px is a common tablet breakpoint. 480px targets small phones.

---

## Quick Reference — All Techniques Used

| Technique | Where Used | What It Does |
|---|---|---|
| CSS Variables (`--accent`) | Everywhere | One place controls all colors across both pages |
| CSS Sibling Selector (`~`) | Theme switcher, auth tabs | Interactive UI with zero JavaScript |
| Hidden radio inputs + labels | Theme switcher, auth tabs | CSS-only toggle/tab switching behavior |
| `clamp()` | Hero title font size | Responsive typography without media queries |
| `position: fixed` | Navbar | Stays visible at top while page scrolls |
| `margin-left: auto` | Nav actions | Pushes element all the way to the right |
| `inset box-shadow` hack | Autofill fix | Only reliable way to override browser autofill background |
| `transition: bg 0s 999999s` | Autofill fix | Prevents white flash when multiple fields autofill at once |
| `step-end` animation timing | Cursors | Hard instant blink like a real terminal cursor |
| `hashchange` event listener | auth.html script | Switches tab when URL hash changes without page reload |
| `flex: 1` on `<main>` | auth.html layout | Sticky footer — main content fills all available space |
| `100dvh` | auth.html, hero | Full height that correctly accounts for mobile browser bars |
| `white-space: pre` | `.preview` cards | Preserves whitespace/line breaks for code-block look |
| `overflow: hidden` | `.terminal` | Clips children to rounded corners cleanly |
| `novalidate` on forms | auth.html forms | Disables browser validation for custom styling later |
| `autocomplete` hints | All form inputs | Tells browsers/password managers what each field is for |
| Semantic HTML elements | Throughout | `<nav>`, `<main>`, `<section>`, `<footer>` for accessibility |
| `data-*` attributes | Theme swatches | Custom HTML attributes used as CSS hooks |
| `&gt;` / `&nbsp;` | Throughout | HTML entities for special characters and forced spaces |
