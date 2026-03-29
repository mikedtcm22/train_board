const BOARD_CHARSET = new Set([
  " ",
  "&",
  "-",
  ".",
  "/",
  ":",
  ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
  ...Array.from("0123456789"),
]);

export function formatBoardText(value: string, width: number) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/['’]/g, "")
    .replace(/[_(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sanitized = [...normalized]
    .map((char) => (BOARD_CHARSET.has(char) ? char : " "))
    .join("");

  return sanitized.padEnd(width, " ").slice(0, width);
}
