import { createBoardOgImage } from "@/lib/og/board-image";
import { loadBoardOgData } from "@/lib/og/board-share";
import { OG_IMAGE_SIZE } from "@/lib/site";

export const runtime = "nodejs";
export const revalidate = 60;
export const alt = "Pay-to-rank board on outboard";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadBoardOgData(slug);
  return createBoardOgImage(data);
}
