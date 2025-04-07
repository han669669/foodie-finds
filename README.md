# imHungryAF 🍽️

A fast, privacy-friendly React + Vite web app for discovering influencer-recommended food spots near you, with realistic travel time estimates — all without external APIs or large datasets.

---

## Features

- **Location-based recommendations** filtered within a 60-minute drive radius
- **Advanced ETA calculation** using blended geodesic and grid distances, dynamic speed modeling, and heuristic adjustments
- **No external API calls** or large country-specific datasets required
- **Responsive design** with Tailwind CSS
- **Clean, modern UI** with feature highlights and influencer reviews
- **Privacy-respecting**: your location is used only in-browser and never stored

---

## How It Works

- Uses your browser's Geolocation API to get your current location
- Calculates realistic travel times with a formula-based approach:
  - Blends straight-line and grid distances
  - Adjusts for road types, turns, traffic lights, time of day, and route complexity
  - Filters results within 60 minutes estimated driving time
- Displays influencer-reviewed food spots sorted by quickest arrival time

---

## Tech Stack

- **React 18** with Hooks
- **Vite** for lightning-fast development and builds
- **Tailwind CSS** for styling
- **Font Awesome** for icons

---

## Getting Started

1. **Clone the repo**

```
git clone https://github.com/han669669/imHungryAF.git
cd imHungryAF
```

2. **Install dependencies**

```
npm install
```

3. **Run the app**

```
npm run dev
```

4. **Open in browser**

Visit `http://localhost:5173`

---

## Credits

- Data manually curated and web app made by [han](https://www.craftedbyhan.xyz/)
- Influencer reviews and images credited to respective owners

---

## License

MIT License