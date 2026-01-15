# TypeFlow - Typing Practice Website

Eine moderne Typing-Website mit Gamification-System.

---

## 🚀 Kostenlos online stellen

### Option 1: Vercel (Empfohlen - Am einfachsten)

1. **GitHub-Repository erstellen:**
   - Gehe zu [github.com](https://github.com) und erstelle ein Konto (falls noch nicht vorhanden)
   - Klicke auf "New Repository"
   - Name: `typeflow`
   - Klicke "Create repository"

2. **Code hochladen:**
   ```bash
   # Im Projektordner:
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/DEIN-USERNAME/typeflow.git
   git push -u origin main
   ```

3. **Mit Vercel deployen:**
   - Gehe zu [vercel.com](https://vercel.com)
   - "Sign up" mit deinem GitHub-Account
   - Klicke "Add New Project"
   - Wähle dein `typeflow` Repository
   - Klicke "Deploy"
   - ✅ Fertig! Deine Website ist live unter `typeflow-xxx.vercel.app`

---

### Option 2: Netlify

1. **GitHub-Repository erstellen** (wie oben)

2. **Mit Netlify deployen:**
   - Gehe zu [netlify.com](https://netlify.com)
   - "Sign up" mit GitHub
   - Klicke "Add new site" → "Import an existing project"
   - Wähle dein Repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Klicke "Deploy"

---

### Option 3: GitHub Pages (Komplett kostenlos)

1. **Repository erstellen und Code pushen** (wie oben)

2. **vite.config.js anpassen:**
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/typeflow/'  // Dein Repository-Name
   })
   ```

3. **GitHub Actions Workflow erstellen:**
   - Erstelle `.github/workflows/deploy.yml` (siehe unten)

4. **In GitHub Settings:**
   - Settings → Pages → Source: "GitHub Actions"

---

## 💻 Lokal entwickeln

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build
```

---

## 📁 Projektstruktur

```
typeflow/
├── index.html          # HTML-Einstiegspunkt
├── package.json        # Dependencies
├── vite.config.js      # Vite-Konfiguration
├── tailwind.config.js  # Tailwind CSS
├── postcss.config.js   # PostCSS
└── src/
    ├── main.jsx        # React-Einstiegspunkt
    ├── App.jsx         # Hauptkomponente
    └── index.css       # Styles
```

---

## ✨ Features

- ⌨️ Echtzeit-Typing-Tests
- 📊 WPM, Accuracy & Fehler-Tracking
- 🏆 8-stufiges Rang-System
- ⭐ XP & Level-Progression
- 🎯 Daily Challenges
- 🔥 Streak-System
- 🏅 10 Achievements
- 📈 Fortschritts-Diagramme

---

## 🔧 Anpassungen

### Eigene Texte hinzufügen

In `src/App.jsx` findest du das `sampleTexts` Objekt:

```javascript
const sampleTexts = {
  beginner: [
    "Dein eigener Text hier...",
  ],
  // ...
};
```

### Farben ändern

Die Hauptfarben sind Tailwind-Klassen:
- Emerald (`emerald-400/500`) - Erfolg/Fortschritt
- Amber (`amber-400/500`) - XP/Highlights
- Violet (`violet-400/500`) - Achievements
- Red (`red-400/500`) - Fehler

---

## 📝 Lizenz

MIT - Frei verwendbar für persönliche und kommerzielle Projekte.
