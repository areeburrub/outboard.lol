import { revalidatePath } from "next/cache";

export function revalidatePublicBoard(slug: string) {
  revalidatePath(`/b/${slug}`);
  revalidatePath(`/b/${slug}/opengraph-image`);
  revalidatePath(`/b/${slug}/twitter-image`);
}
