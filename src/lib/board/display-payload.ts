import { createHash } from "node:crypto";
import {
  padBoardRows,
  type BoardDisplayMode,
  type BoardDisplayPayload,
  type BoardRowData,
} from "./board-data";

type CreateBoardDisplayPayloadArgs = {
  issue?: string;
  mode: BoardDisplayMode;
  now?: Date;
  pollIntervalMs: number;
  rows: BoardRowData[];
  sourceLabel: string;
};

export function createBoardDisplayPayload({
  issue,
  mode,
  now = new Date(),
  pollIntervalMs,
  rows,
  sourceLabel,
}: CreateBoardDisplayPayloadArgs): BoardDisplayPayload {
  const paddedRows = padBoardRows(rows);
  const version = createHash("sha1")
    .update(JSON.stringify(paddedRows))
    .digest("hex")
    .slice(0, 12);

  return {
    generatedAt: now.toISOString(),
    issue,
    mode,
    pollIntervalMs,
    rows: paddedRows,
    sourceLabel,
    version,
  };
}
