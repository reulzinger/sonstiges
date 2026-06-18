# Störungsmelder – Kurzanleitung

Eine installationsfreie Status-Seite für Störungen, Wartungen und Hinweise.
Läuft komplett über das Netzlaufwerk – kein Server, keine Installation.

## Dateien

| Datei | Zweck |
|-------|-------|
| `stoerungsmelder.html` | Die Seite, die alle öffnen (per Doppelklick im Edge). |
| `daten.js` | Die Meldungen. **Nur der Admin bearbeitet diese Datei.** |

Beide Dateien müssen **im selben Ordner** auf dem Netzlaufwerk liegen.

## Für die Anwender
1. `stoerungsmelder.html` öffnen (am besten Verknüpfung auf Desktop / Intranet-Link).
2. Aktuelle Meldungen ansehen, nach Kategorie filtern.
3. Über **„+ Störung melden“** eine Meldung erfassen → es öffnet sich eine
   fertig ausgefüllte **Outlook-Mail** an den Admin → nur noch **Senden** klicken.

## Für den Admin – neue Meldung einpflegen
1. `daten.js` mit Notepad öffnen.
2. Oben in der Liste einen neuen Block einfügen (vorhandenen kopieren), z. B.:

```js
{
  id: 4,
  typ: "stoerung",          // stoerung | wartung | info | behoben
  titel: "Kurzer Titel",
  system: "Betroffenes System",
  standort: "Standort / Alle",
  beginn: "18.06.2026 09:00",
  ende: "",                 // geplantes Ende, oder leer
  text: "Ausführliche Beschreibung.",
  updates: []
},
```

3. Speichern. Fertig – beim nächsten Öffnen/Aktualisieren (F5) sehen es alle.

### Status aktualisieren
- Erledigt? `typ` auf `"behoben"` setzen oder den Block entfernen.
- Verlauf dokumentieren? In `updates` Einträge ergänzen:
  ```js
  updates: [
    { zeit: "18.06.2026 10:15", text: "Problem behoben." },
    { zeit: "18.06.2026 09:00", text: "Störung festgestellt." }
  ]
  ```

### Admin-Mailadresse ändern
Ganz unten in `daten.js`: `window.ADMIN_EMAIL = "...";`

## Warum nicht „direkt live ohne Mail“?
Ein Browser darf aus Sicherheitsgründen nicht aus der geöffneten HTML-Datei
auf das Netzlaufwerk schreiben. Echtes Live-Melden bräuchte SharePoint/Teams,
erlaubte Excel-Makros oder einen Server. Bis dahin ist der Mail-Weg der
zuverlässige Standard, weil alle Outlook + Edge haben.
