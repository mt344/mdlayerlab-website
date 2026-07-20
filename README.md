# MD Layer Lab – Website

Statische Website (reines HTML/CSS/JS, kein Build-Schritt nötig) für MD Layer Lab.

## Lokal ansehen

Am einfachsten über einen kleinen lokalen Server (Doppelklick auf `index.html` funktioniert grundsätzlich auch, aber das Video scrubbt beim Scrollen dann nicht immer sauber):

```bash
npx serve .
```

Dann `http://localhost:3000` (oder die angezeigte Adresse) im Browser öffnen.

## Struktur

```
index.html          Startseite
impressum.html       Impressum (Platzhalter-Angaben ausfüllen!)
datenschutz.html      Datenschutzerklärung (Platzhalter-Angaben prüfen)
assets/
  css/style.css       Styles
  js/main.js          Sprachumschalter, Video-Scrub, Material-/Farbtabs, Menü
  img/                Optimierte Bilder (Logo, Galerie, Farbmuster)
  video/              Hero-Video
```

Der Ordner `Bilder/` (Rohfotos, Video-Original, Farbkatalog-PDF) liegt nur lokal
und wird von der Website nicht referenziert — er ist absichtlich nicht Teil
dieses Repos (siehe `.gitignore`).

## Vor dem Livegang unbedingt prüfen

- **Impressum & Datenschutz**: `[Platzhalter]`-Angaben (Firmenname, Adresse,
  UID etc.) durch echte Daten ersetzen.
- **Kontaktformular**: Läuft über [FormSubmit](https://formsubmit.co/) an
  `mdlayerlab@outlook.com`. Bei der ersten echten Einsendung muss der
  Bestätigungslink in der Mailbox einmal angeklickt werden, danach laufen
  weitere Anfragen automatisch durch.

## Hosting — allgemein (beliebiger Webspace / Provider)

Der komplette Ordnerinhalt (außer `Bilder/`) kann 1:1 auf jeden Static-Hosting-
Anbieter oder klassischen Webspace hochgeladen werden — es gibt keinen
Build-Schritt und keine Server-Abhängigkeiten.

- **Klassischer Webspace (FTP)**: Alles außer dem Ordner `Bilder/` in das
  öffentliche Verzeichnis (oft `htdocs`, `public_html` oder `www`) hochladen,
  sodass `index.html` direkt darin liegt.
- **Netlify / Vercel (Drag & Drop)**: Diesen Ordner (ohne `Bilder/`) einfach
  per Drag & Drop auf [app.netlify.com/drop](https://app.netlify.com/drop)
  ziehen — fertig, sofort live.

## Hosting — GitHub Pages

1. Auf [github.com/new](https://github.com/new) ein neues Repository anlegen
   (z. B. `mdlayerlab-website`), **ohne** README/gitignore/Lizenz anzuhaken.
2. In diesem Ordner (Terminal hier im Projekt):
   ```bash
   git remote add origin https://github.com/<dein-benutzername>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. Auf GitHub: Repository → **Settings → Pages** → unter „Build and
   deployment" als Source **„Deploy from a branch"** wählen, Branch **main**,
   Ordner **/ (root)** → **Save**.
4. Nach ein bis zwei Minuten ist die Seite unter
   `https://<dein-benutzername>.github.io/<repo-name>/` erreichbar.

Die Datei `.nojekyll` sorgt dafür, dass GitHub Pages die Seite unverändert
ausliefert statt sie als Jekyll-Projekt zu verarbeiten.
