import { createHash } from "node:crypto";
import {
  padBoardRows,
  type BoardDisplayMode,
  type BoardDisplayPayload,
  type BoardRowData,
} from "./board-data";

type CreateBoardDisplayPayloadArgs = {
  headerMessage: string;
  issue?: string;
  mode: BoardDisplayMode;
  now?: Date;
  pollIntervalMs: number;
  rows: BoardRowData[];
  sourceLabel: string;
};

export function createBoardDisplayPayload({
  headerMessage,
  issue,
  mode,
  now = new Date(),
  pollIntervalMs,
  rows,
  sourceLabel,
}: CreateBoardDisplayPayloadArgs): BoardDisplayPayload {
  const paddedRows = padBoardRows(rows);
  const version = createHash("sha1")
    .update(JSON.stringify({ headerMessage, rows: paddedRows }))
    .digest("hex")
    .slice(0, 12);

  return {
    generatedAt: now.toISOString(),
    headerMessage,
    issue,
    mode,
    pollIntervalMs,
    rows: paddedRows,
    sourceLabel,
    version,
  };
}
