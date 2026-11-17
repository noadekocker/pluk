# pluk

Elke dag een journal-vraagje om te plukken.

- Je krijgt elke dag een vraagje om je te inspireren tijdens het journalen.
- Niet jouw ding? Je mag per dag **3 keer opnieuw plukken**.
- Kies je een vraagje met **"deze neem ik!"**, dan plant je een bloemetje in **mijn tuin**. Dat vraagje krijg je nooit meer opnieuw.

Alles wordt bewaard op je eigen toestel (in de browser). Er is geen account nodig.

## Op je telefoon zetten

Open de app-link in je browser:

- **iPhone (Safari):** tik op het deel-icoon › *Zet op beginscherm*.
- **Android (Chrome):** tik op ⋮ › *App installeren* of *Toevoegen aan startscherm*.

## Vraagjes aanpassen

Alle vraagjes staan in [`prompts.js`](prompts.js). Zet nieuwe vraagjes altijd **onderaan** de lijst
en verwijder geen bestaande, want de app onthoudt gebruikte vraagjes via hun plaats in de lijst.
Verhoog daarna het versienummer (`pluk-v1` → `pluk-v2`) bovenaan in [`sw.js`](sw.js),
zodat telefoons de nieuwe versie ophalen.

## Bestanden

| Bestand | Wat |
|---|---|
| `index.html` | de schermen |
| `style.css` | de vormgeving (kleuren, lettertypes, knoppen) |
| `app.js` | hoe de app werkt (plukken, kiezen, tuin) |
| `prompts.js` | alle journal-vraagjes |
| `assets/` | wolkjes, gras, madeliefjes en app-iconen |
| `sw.js`, `manifest.webmanifest` | zodat je de app kan installeren en offline gebruiken |

Ontwerp: [Figma](https://www.figma.com/design/M4wDaCho5AlBm8etFmdSkc) · Lettertypes: [Grandstander](https://fonts.google.com/specimen/Grandstander) en [Nunito](https://fonts.google.com/specimen/Nunito)
