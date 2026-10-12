import { Bike, BookOpen, Coffee, Flower2, Hammer, Palette } from "lucide-react";
export function Art({
  kind = "landscape",
  large = false,
}: {
  kind?: string;
  large?: boolean;
}) {
  const Icon =
    kind === "bike"
      ? Bike
      : kind === "books"
        ? BookOpen
        : kind === "bakery"
          ? Coffee
          : kind === "flowers"
            ? Flower2
            : kind === "tools"
              ? Hammer
              : Palette;
  return (
    <div className={`art ${kind} ${large ? "large" : ""}`} aria-hidden="true">
      {kind === "landscape" ? (
        <>
          <div className="sun" />
          <div className="mountain back" />
          <div className="mountain front" />
          <div className="water" />
          <div className="trees">♠ ♠ ♠</div>
          <span>
            У каждого города
            <br />
            есть своя осень.
          </span>
        </>
      ) : (
        <>
          <Icon size={large ? 80 : 58} strokeWidth={1} />
          <div className="art-circle" />
        </>
      )}
    </div>
  );
}
