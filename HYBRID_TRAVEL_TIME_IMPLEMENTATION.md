# Hybrid Travel Time Estimation - Actual Implementation (No External APIs)

---

## 1. Objectives
- Provide realistic ETA estimates without external APIs or large datasets
- Accurately reflect real-world driving conditions
- Fully integrated into the Vite + React app

---

## 2. Core Approach

- **Blended Distance**: Combines vincenty geodesic and Manhattan grid distances for better urban modeling
- **Curvature Penalty**: Adjusts for typical road bends beyond straight-line
- **Dynamic Speed Model**: Calculates average speed based on trip length, transitioning from city to expressway speeds
- **Turn Penalty**: Adds delay proportional to expected number of turns
- **Time of Day Adjustment**: Penalizes during peak hours, reduces during off-peak
- **Route Complexity Penalty**: Adds fixed penalty for complex routes (e.g., river crossings)
- **Filtering**: Only shows recommendations within **60 minutes** estimated travel time

---

## 3. Implementation Details

- All calculations are **formula-based** with configurable constants
- No reliance on large country-specific datasets or external services
- ETA is computed as:

```
ETA = ((blended distance * penalties) / dynamic average speed) * 60 + turn delays
```

- The **displayed distance** is the adjusted, realistic travel distance after penalties
- Sorting is based on **ETA**, not raw distance

---

## 4. User Interface Integration

- ETA and adjusted distance shown in results
- Filtering and UI text updated to reflect **60-minute** radius
- Feature highlights and footer updated to explain the approach
- No user data stored; privacy-respecting

---

## 5. Benefits

- Lightweight, fast, and privacy-friendly
- Significantly more realistic than pure geodesic distance
- Easily tunable via constants
- No API costs or data maintenance burden