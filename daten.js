/* =========================================================================
   STÖRUNGSMELDER – Datendatei
   -------------------------------------------------------------------------
   Diese Datei enthält ALLE Meldungen. Nur der Admin bearbeitet sie.
   Zum Pflegen einfach diese Datei im Editor (z. B. Notepad) öffnen und
   einen neuen Block oben in die Liste einfügen, dann speichern.

   Felder pro Meldung:
     id        : eindeutige Nummer (einfach hochzählen)
     typ       : "stoerung" | "wartung" | "info" | "behoben"
     titel     : Überschrift der Meldung
     system    : betroffenes System / Fachverfahren
     standort  : betroffener Standort / Bereich  (oder "Alle")
     beginn    : "TT.MM.JJJJ HH:MM"  (oder "")
     ende      : "TT.MM.JJJJ HH:MM"  (geplant/voraussichtlich, oder "")
     text      : ausführliche Beschreibung
     updates   : Liste von Verlaufseinträgen [{zeit:"...", text:"..."}]
   ========================================================================= */

window.STOERUNGEN = [
  {
    id: 3,
    typ: "stoerung",
    titel: "Fachverfahren XYZ nicht erreichbar",
    system: "Fachverfahren XYZ",
    standort: "Alle",
    beginn: "18.06.2026 07:40",
    ende: "",
    text: "Aufgrund einer Störung ist das Fachverfahren XYZ derzeit nicht erreichbar. An einer Lösung wird gearbeitet.",
    updates: [
      { zeit: "18.06.2026 08:10", text: "Ursache eingegrenzt, Dienstleister informiert." },
      { zeit: "18.06.2026 07:40", text: "Störung festgestellt." }
    ]
  },
  {
    id: 2,
    typ: "wartung",
    titel: "Wartungsfenster Druckserver",
    system: "Zentraler Druckserver",
    standort: "Standort Mitte",
    beginn: "20.06.2026 18:00",
    ende: "20.06.2026 22:00",
    text: "Geplante Wartungsarbeiten am zentralen Druckserver. In diesem Zeitraum kann es zu Verzögerungen beim Drucken kommen.",
    updates: []
  },
  {
    id: 1,
    typ: "info",
    titel: "Neue Telefonanlage ab 01.07.",
    system: "Telefonie",
    standort: "Alle",
    beginn: "",
    ende: "",
    text: "Zum 01.07.2026 wird die neue Telefonanlage in Betrieb genommen. Weitere Informationen folgen per Hausmitteilung.",
    updates: []
  }
];

/* E-Mail-Adresse des Admins, an die Meldungen aus dem Formular gehen */
window.ADMIN_EMAIL = "reulzinger@googlemail.com";
