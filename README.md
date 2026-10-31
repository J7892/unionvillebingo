# 🍁 Unionville Sightseeing Bingo

A mobile-friendly, touch-responsive web-based bingo game tailored for exploring historic Main Street Unionville.

🎮 **Live Game Link**: [https://j7892.github.io/unionvillebingo/](https://j7892.github.io/unionvillebingo/)

## ✨ Features

- **30 Sightseeing Items Pool**: Hand-picked landmarks from Unionville including the Old Planing Mill Water Wheel, Millennium Bandstand, Victorian Lampposts, Old Firehall Tower, Canadian flag, Unique stop sign, Cute doggo, and more. Each card shuffles 24 unique items around the central Free Space.
- **Classic 5x5 Bingo Grid**: Traditional layout with a dedicated **FREE SPACE** at the center.
- **Persistent Progress (`localStorage`)**: Your card layout and marked squares automatically save as you play. Feel free to close the tab, lock your screen, or refresh; your progress remains intact.
- **Accidental Reshuffle Protection**: Reshuffling warns you with a confirmation modal so you don't lose your marked board by accident.
- **BINGO Recognition & Celebrations**: Automatically detects winning rows, columns, and diagonals, glowing gold on winning lines and bursting celebratory confetti with congratulatory modals and fanfare.
- **Mobile Responsive & Touch-Optimized**: Designed for one-handed mobile use with haptic touch feedback, prevent-zoom touch actions, and clear rubber-stamp animations.
- **Works Offline (PWA)**: Includes a Service Worker and Web App Manifest. You can "Add to Home Screen" on iOS Safari or Android Chrome and play even without cellular data.

## 🚀 How to Run

You can open `index.html` directly in any web browser, or serve it using any lightweight static server:

```bash
# Using Python
python3 -m http.server 8000
```
Then visit `http://localhost:8000` on your mobile phone or desktop browser.
