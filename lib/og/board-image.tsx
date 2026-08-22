import { ImageResponse } from "next/og";

import { boardShareMeta, type BoardOgData, type BoardOgRow } from "@/lib/og/board-share";
import { loadOgFonts } from "@/lib/og/fonts";
import { OG_IMAGE_SIZE } from "@/lib/site";

const RANKING_PATH =
  "M240,200h-8V144a16,16,0,0,0-16-16H176V56a16,16,0,0,0-16-16H96A16,16,0,0,0,80,56V88H40a16,16,0,0,0-16,16v96H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM80,200H40V104H80Zm60-64a8,8,0,0,1-16,0V107.1l-1.47.49a8,8,0,0,1-5.06-15.18l12-4A8,8,0,0,1,140,96Zm76,64H176V144h40Z";

function clip(value: string, max: number) {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function Text({
  children,
  style,
}: {
  children: string;
  style?: Record<string, string | number>;
}) {
  return (
    <div
      style={{
        display: "flex",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function RankingMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="#0D9488">
      <path d={RANKING_PATH} />
    </svg>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <RankingMark />
      <Text
        style={{
          marginLeft: 12,
          fontFamily: "Jakarta",
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#12141A",
        }}
      >
        outboard
      </Text>
    </div>
  );
}

function Row({ row }: { row: BoardOgRow }) {
  const win = row.rank === 1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: 16,
        backgroundColor: win ? "#D5F5EE" : "transparent",
        borderRadius: win ? 12 : 0,
        borderBottom: win ? "none" : "1px solid #E4E7EC",
      }}
    >
      <Text
        style={{
          width: 32,
          paddingTop: 8,
          justifyContent: "center",
          fontFamily: "JetBrains Mono",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: win ? "#12141A" : "#667085",
        }}
      >
        {String(row.rank)}
      </Text>
      <Text
        style={{
          width: 52,
          height: 52,
          marginLeft: 12,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          border: "1px solid #E4E7EC",
          backgroundColor: win ? "#FFFFFF" : "#F5F7FA",
          fontFamily: "Jakarta",
          fontSize: 20,
          fontWeight: 800,
          color: "#12141A",
        }}
      >
        {row.letter}
      </Text>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginLeft: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text
            style={{
              fontFamily: "Jakarta",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#12141A",
            }}
          >
            {clip(row.name, 28)}
          </Text>
          <Text
            style={{
              marginLeft: 12,
              fontFamily: "JetBrains Mono",
              fontSize: 20,
              fontWeight: 700,
              color: win ? "#0D9488" : "#12141A",
            }}
          >
            {row.bidLabel}
          </Text>
        </div>
        {row.description ? (
          <Text
            style={{
              marginTop: 6,
              fontFamily: "Jakarta",
              fontSize: 15,
              fontWeight: 700,
              color: "#667085",
            }}
          >
            {clip(row.description, 52)}
          </Text>
        ) : null}
        <Text
          style={{
            marginTop: 8,
            fontFamily: "JetBrains Mono",
            fontSize: 12,
            fontWeight: 700,
            color: "#667085",
          }}
        >
          {clip(row.handle, 36)}
        </Text>
      </div>
    </div>
  );
}

function BoardCard({ data }: { data: Extract<BoardOgData, { kind: "board" }> }) {
  const badge = data.status === "live" ? "live" : data.status;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: 526,
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4E7EC",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 24px",
          borderBottom: "1px solid #E4E7EC",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#667085",
            }}
          >
            {`${data.slug}.outboard.lol`}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontFamily: "Jakarta",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#12141A",
            }}
          >
            {clip(data.name, 32)}
          </Text>
        </div>
        <Text
          style={{
            borderRadius: 999,
            backgroundColor: data.status === "live" ? "#0D9488" : "#12141A",
            color: "#FFFFFF",
            fontFamily: "JetBrains Mono",
            fontSize: 12,
            fontWeight: 700,
            padding: "6px 12px",
          }}
        >
          {badge}
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px 12px 12px",
          flex: 1,
        }}
      >
        {data.rows.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Jakarta",
                fontSize: 22,
                fontWeight: 800,
                color: "#12141A",
              }}
            >
              No listings yet
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: "Jakarta",
                fontSize: 18,
                fontWeight: 700,
                color: "#667085",
              }}
            >
              {`Bid from ${data.minBidLabel} to take #1`}
            </Text>
          </div>
        ) : (
          data.rows.map((row) => <Row row={row} />)
        )}
      </div>
    </div>
  );
}

export async function createBoardOgImage(data: BoardOgData) {
  const fonts = await loadOgFonts();

  if (data.kind === "missing") {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 64,
            backgroundColor: "#F5F7FA",
          }}
        >
          <Brand />
          <Text
            style={{
              marginTop: 28,
              fontFamily: "Jakarta",
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#12141A",
            }}
          >
            Board not found
          </Text>
          <Text
            style={{
              marginTop: 16,
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              fontWeight: 700,
              color: "#667085",
            }}
          >
            {`${data.slug}.outboard.lol`}
          </Text>
        </div>
      ),
      { ...OG_IMAGE_SIZE, fonts },
    );
  }

  const share = boardShareMeta({
    name: data.name,
    slug: data.slug,
    tagline: data.tagline,
    topName: data.rows[0]?.name ?? null,
    topBidCents: data.topBidCents,
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "52px 56px",
          backgroundColor: "#F5F7FA",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 400,
          }}
        >
          <Brand />
          <Text
            style={{
              marginTop: 24,
              fontFamily: "Jakarta",
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#12141A",
            }}
          >
            {clip(data.name, 42)}
          </Text>
          <Text
            style={{
              marginTop: 18,
              fontFamily: "Jakarta",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.35,
              color: "#667085",
            }}
          >
            {clip(share.description, 110)}
          </Text>
          <div
            style={{
              display: "flex",
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 16px",
                border: "1px solid #E4E7EC",
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontFamily: "Jakarta",
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#12141A",
                }}
              >
                {String(data.listingCount)}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: "JetBrains Mono",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#667085",
                }}
              >
                LISTINGS
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: 12,
                padding: "12px 16px",
                border: "1px solid #E4E7EC",
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontFamily: "Jakarta",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#12141A",
                }}
              >
                {share.host}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: "JetBrains Mono",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#667085",
                }}
              >
                PUBLIC BOARD
              </Text>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, marginLeft: 40 }}>
          <BoardCard data={data} />
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE, fonts },
  );
}
