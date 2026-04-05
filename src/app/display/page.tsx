import { BoardDisplay } from "@/components/board/board-display";
import { getBoardDisplayPayload } from "@/lib/board/get-display-payload";

export const dynamic = "force-dynamic";

export default async function DisplayPage() {
  const initialPayload = await getBoardDisplayPayload(new Date());

  return <BoardDisplay initialPayload={initialPayload} />;
}
