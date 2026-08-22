import { BoardSettingsForm } from "@/components/settings/board-settings-form";
import { boardLinks, boardMinBidCents } from "@/lib/db/boards";
import { getOperatorContext } from "@/lib/db/get-operator";
import { centsToDollars } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { board } = await getOperatorContext();
  const minBidDollars = Math.max(1, Math.round(centsToDollars(boardMinBidCents(board))));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
          Settings
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-ob-ink">
          Board settings
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ob-mute">
          Name, minimum bid, links, and rules. Name and links sit in the public
          nav. Rules open from the nav.
        </p>
      </div>

      <BoardSettingsForm
        name={board.name}
        minBidDollars={minBidDollars}
        rules={board.rules ?? ""}
        links={boardLinks(board)}
      />
    </main>
  );
}
