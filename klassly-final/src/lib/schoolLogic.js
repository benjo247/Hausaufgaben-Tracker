// ─── Kurs-System Matrix ──────────────────────────────────────────────────────
// Gibt pro Fach + Bundesland + Klasse zurück welches Kurssystem gilt.

export const HAUPTFAECHER = [
  { id: "mathe",    label: "Mathe",    emoji: "📐", color: "#FF6B6B" },
  { id: "englisch", label: "Englisch", emoji: "🌍", color: "#45B7D1" },
  { id: "deutsch",  label: "Deutsch",  emoji: "📝", color: "#4ECDC4" },
];

export const ALLE_FAECHER = [
  ...HAUPTFAECHER,
  { id: "sachkunde", label: "Sachkunde", emoji: "🔬", color: "#96CEB4" },
  { id: "sport",     label: "Sport",     emoji: "⚽", color: "#DDA0DD" },
  { id: "kunst",     label: "Kunst",     emoji: "🎨", color: "#FFB347" },
  { id: "musik",     label: "Musik",     emoji: "🎵", color: "#F7C948" },
  { id: "religion",  label: "Religion",  emoji: "✨", color: "#87CEEB" },
];

/**
 * Gibt die relevanten Fächer MIT ihrem Kurssystem zurück.
 * system: "ABC" | "EG" | null
 */
export function getKursFaecher(schulart, bundesland, klasse) {
  if (["Gymnasium", "Realschule"].includes(schulart)) return [];
  if (schulart === "Grundschule") return [];

  // Hessen Gesamtschule
  if (schulart === "Gesamtschule" && bundesland === "Hessen") {
    if (klasse <= 5) return [];
    if (klasse <= 7) return [
      { ...HAUPTFAECHER[0], system: "ABC" },
      { ...HAUPTFAECHER[1], system: "ABC" },
    ];
    return [
      { ...HAUPTFAECHER[0], system: "ABC" },
      { ...HAUPTFAECHER[1], system: "ABC" },
      { ...HAUPTFAECHER[2], system: "EG"  },
    ];
  }

  // NRW / Nord-Länder → E/G
  const EG_LAENDER = ["Nordrhein-Westfalen","Berlin","Brandenburg","Hamburg",
                      "Schleswig-Holstein","Niedersachsen","Mecklenburg-Vorpommern"];
  if (["Gesamtschule","Integrierte Sekundarschule","Stadtteilschule",
       "Oberschule","Gemeinschaftsschule"].includes(schulart)) {
    if (klasse <= 5) return [];
    const sys = EG_LAENDER.includes(bundesland) ? "EG" : "ABC";
    return HAUPTFAECHER.map(f => ({ ...f, system: sys }));
  }

  // Hauptschule / Mittelschule → ABC
  if (["Hauptschule", "Mittelschule", "Werkrealschule"].includes(schulart)) {
    if (klasse <= 4) return [];
    return HAUPTFAECHER.map(f => ({ ...f, system: "ABC" }));
  }

  return [];
}

export function getKlassen(schulart, bundesland) {
  if (schulart === "Grundschule")
    return ["Berlin","Brandenburg"].includes(bundesland) ? [1,2,3,4,5,6] : [1,2,3,4];
  if (schulart === "Gymnasium") return [5,6,7,8,9,10,11,12];
  return [5,6,7,8,9,10];
}

export const SCHULARTEN_MAP = {
  "Bayern":            ["Grundschule","Mittelschule","Realschule","Gymnasium"],
  "Baden-Württemberg": ["Grundschule","Werkrealschule","Realschule","Gemeinschaftsschule","Gymnasium"],
  "Berlin":            ["Grundschule","Integrierte Sekundarschule","Gymnasium"],
  "Brandenburg":       ["Grundschule","Oberschule","Gesamtschule","Gymnasium"],
  "Hamburg":           ["Grundschule","Stadtteilschule","Gymnasium"],
  "default":           ["Grundschule","Hauptschule","Realschule","Gesamtschule","Gymnasium"],
};

export const BUNDESLAENDER = [
  "Baden-Württemberg","Bayern","Berlin","Brandenburg","Bremen","Hamburg",
  "Hessen","Mecklenburg-Vorpommern","Niedersachsen","Nordrhein-Westfalen",
  "Rheinland-Pfalz","Saarland","Sachsen","Sachsen-Anhalt","Schleswig-Holstein","Thüringen",
];

export const SCHULART_EMOJI = {
  "Grundschule":"🏫","Hauptschule":"📚","Mittelschule":"📚","Realschule":"📖",
  "Gymnasium":"🎓","Gesamtschule":"🏛️","Gemeinschaftsschule":"🏛️",
  "Integrierte Sekundarschule":"🏛️","Oberschule":"📚","Stadtteilschule":"🏛️",
};
