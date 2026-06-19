# Deep Still

> **Deep focus, deep calm.** A mindful space for uninterrupted work.

Deep Still is a premium focus timer with cinematic nature photography, glassmorphism UI, and ambient interactions. Designed to feel like a meditation and productivity tool — not a student project.

---

## Features

### 🏔️ Three-Page Flow

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Full-screen hero with parallax glow, "Begin your session" entry point |
| **Scene Selection** | `/scenes` | Choose from 5 gradient scenes or 13 photographic backgrounds |
| **Focus** | `/focus` | Immersive timer with duration presets, intention input, breathing ritual |

### ⏱️ Focus Timer

- **Duration presets**: 5 / 15 / 25 minutes, or **Custom** (1–999 min via inline input)
- **Breathing ritual**: A 3-second breath-in / breath-out animation before every session
- **Intention input**: Type what you want to focus on — it replaces the motivational text during the session
- **Fullscreen mode**: Auto-requests F11 fullscreen on start
- **Progress bar**: Thin, minimal, at the base of the timer display
- **Completion stats**: Glass card with duration, scene, date, and intention. Copy summary to clipboard.

### 🖼️ Photographic Backgrounds

- **13 built-in scenes**: Fuji, Puffin, Azores, Lofoten, Sakura, West Lake, and more
- **Custom uploads**: Upload your own photos — saved to localStorage with rename and delete support
- **Blur & Brightness sliders**: Fine-tune any photo background via a glass popup panel
- **Photo credit**: Author names displayed transparently at the bottom-left
- **Image preloading**: Large files are decoded off-screen before fading in, preventing jank

### 🎯 Parallax Interaction

Toggle "Parallax" on any page for mouse-driven depth:

| Page | Elements affected |
|---|---|
| Landing | Hero text, background overlay, ambient glow |
| Scene Selection | Scene gradient, veil, preview card, panel buttons |
| Focus | Photo layer (±30px), veil (±15px), timer card area (±9px) |

### 📋 Session History

- Persistent localStorage history of all completed sessions
- Streak counter, total sessions, total focus minutes
- Chronological list with date, duration, scene, and intention
- Clear history with confirmation

### 📸 Gallery & Drag-to-Reorder

- Built-in scenes + custom uploads in one horizontal scrollable strip
- **Drag to reorder**: Any photo can be dragged to a new position; order persists across sessions
- **Right-click menu**: Custom uploads get "Rename" and "Delete" options
- Rename uses an inline glass popup (not a browser prompt)
- Delete removes from both the gallery and localStorage

### 🎨 Design System

- **Typography**: Inter, 200–400 weights, thin letter-spacing
- **Glassmorphism**: `backdrop-filter: blur(20px–40px)`, translucent surfaces
- **Color palette**: No bright colors — white, gray, transparent surfaces only
- **Borders**: Subtle `rgba(255, 255, 255, 0.06–0.15)`
- **Shadows**: Deep `rgba(0, 0, 0, 0.3–0.5)` for glass depth
- **Rounded corners**: 24px–32px on cards, 100px on pills
- **Transitions**: `cubic-bezier(0.22, 1, 0.36, 1)` throughout

---

## Screenshots

| Landing | Scene Selection | Focus |
|---|---|---|
| Dark cinematic hero with glow | Scene strip + preview panel | Timer card + completed stats |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run serve

# Build for production
npm run build
```

The app runs at `http://localhost:8080` by default.

---

## Project Structure

```
src/
├── App.vue                   # Root component, page transitions
├── main.js                   # Entry point with Vue Router
├── router/
│   └── index.js              # Route definitions (/, /scenes, /focus, /history)
├── data/
│   ├── scenes.js             # Gradient scene definitions, durations, quotes
│   ├── samples.js            # 13 photographic background entries
│   └── storage.js            # localStorage for sessions, uploads, scene order
├── views/
│   ├── LandingPage.vue       # Hero page with parallax
│   ├── SceneSelection.vue    # Scene picker with crossfade
│   ├── FocusPage.vue         # Timer, ritual, stats, background controls
│   └── HistoryPage.vue       # Session history with streak
├── components/
│   └── ImagePickerModal.vue  # Gallery with upload, drag reorder, context menu
└── assets/                   # 13 photographic backgrounds (photo by ...)
```

---

## Technologies

- **Vue 3** (Options API)
- **Vue Router 4** (hash history)
- **CSS3** (backdrop-filter, mask-image, custom properties, animations)
- **localStorage** (sessions, custom uploads, scene order)
- **HTML5 Drag & Drop API** (reorder gallery)
- **Inter font** (Google Fonts)

---

## Photo Credits

| Photo | Author |
|---|---|
| Fuji, Puffin, Azores, Lofoten, Longyear, Isle of Skye | linksphotograph |
| Going-to-the-Sun Road, Goat | Garrett Holtz |
| Ecuador | Harmen Hoek |
| Bromo & Semeru | 青山摄影 |
| West Lake, Sakura, Cuiguang Pavilion | r1yadJame |

---

## Roadmap / Ideas

- [ ] Ambient soundscapes (rain, forest, white noise)
- [ ] Keyboard shortcuts (Space, R, Esc, M)
- [ ] Session tagging (Writing, Reading, Coding, Meditation)
- [ ] Dark / Dusk / Night lighting presets
- [ ] Mobile responsive polish
- [ ] PWA support for offline use

---

## Support

If you find this useful, consider [buying me a coffee](https://ko-fi.com/zyz0314).

---

## License

MIT
