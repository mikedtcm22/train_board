export type BoardStatusLabel = "" | "STARTING SOON" | "IN PROGRESS" | "ALMOST OVER";

type ComputeBoardStatusArgs = {
  almostOverMinutes: number;
  end: Date;
  now: Date;
  start: Date;
  startingSoonMinutes: number;
};

export function computeBoardStatus({
  almostOverMinutes,
  end,
  now,
  start,
  startingSoonMinutes,
}: ComputeBoardStatusArgs): BoardStatusLabel {
  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (nowMs >= endMs) {
    return "";
  }

  if (nowMs >= startMs) {
    if (almostOverMinutes > 0 && endMs - nowMs <= almostOverMinutes * 60_000) {
      return "ALMOST OVER";
    }

    return "IN PROGRESS";
  }

  if (startingSoonMinutes > 0 && startMs - nowMs <= startingSoonMinutes * 60_000) {
    return "STARTING SOON";
  }

  return "";
}
