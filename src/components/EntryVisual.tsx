import type { Entry } from "../data";
export function EntryVisual({ entry }: { entry: Entry }) {
  let slot = "city";
  if (entry.section === "services") slot = "master";
  else if (entry.section === "shops")
    slot =
      entry.art === "flowers"
        ? "flowers"
        : entry.art === "books"
          ? "things"
          : "cafe";
  else if (entry.section === "ads") slot = "things";
  else if ("kind" in entry) {
    slot =
      entry.kind === "medical"
        ? "doctor"
        : entry.kind === "cinema"
          ? "cinema"
          : entry.kind === "events"
            ? entry.art === "books"
              ? "things"
              : entry.art === "workshop"
                ? "flowers"
                : "city"
            : "city";
  }
  return (
    <div
      className={`entry-visual photo-${slot}`}
      role="img"
      aria-label="Иллюстративное фото · demo"
    >
      <span className="visual-label">demo</span>
    </div>
  );
}
