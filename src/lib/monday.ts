/**
 * Monday.com GraphQL API client.
 *
 * Reads LP/investor data from a Monday board.
 * Requires env vars:
 *   MONDAY_API_TOKEN          — personal API token (Settings → Developer → API)
 *   MONDAY_INVESTORS_BOARD_ID — numeric board ID from the board URL
 */

const MONDAY_API_URL = "https://api.monday.com/v2";

// ─── Raw API types ─────────────────────────────────────────────────────────────

interface MondayColumnDef {
  id: string;
  title: string;
  type: string;
}

interface MondayColumnValue {
  id: string;
  text: string;
  value: string | null;
}

interface MondayItem {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
}

interface MondayBoard {
  id: string;
  name: string;
  columns: MondayColumnDef[];
  items_page: {
    cursor: string | null;
    items: MondayItem[];
  };
}

interface MondayResponse<T> {
  data: T;
  errors?: { message: string }[];
}

// ─── Typed output ──────────────────────────────────────────────────────────────

export interface MondayInvestor {
  id: string;
  /** LP name — comes from the item name */
  name: string;
  /** Committed capital in cents (null = not mapped) */
  commitmentCents: number | null;
  /** Capital called / drawn in cents */
  calledCents: number | null;
  /** Current NAV / balance in cents */
  navCents: number | null;
  /** Distributions / capital returned in cents */
  returnedCents: number | null;
  /** Investor status string (Active, Pending, Exited…) */
  investorStatus: string | null;
  /** Contact email */
  email: string | null;
  /** Legal entity type (Individual, LLC, Trust…) */
  entityType: string | null;
  /** Closing / entry date string */
  joinDate: string | null;
  /** Notes / comments */
  notes: string | null;
  /** Raw column values for any unmapped columns */
  extra: Record<string, string>;
}

export interface MondayBoardMeta {
  id: string;
  name: string;
  itemCount: number;
}

// ─── Column auto-detection ────────────────────────────────────────────────────

type MappedField = keyof Pick<
  MondayInvestor,
  | "commitmentCents"
  | "calledCents"
  | "navCents"
  | "returnedCents"
  | "investorStatus"
  | "email"
  | "entityType"
  | "joinDate"
  | "notes"
>;

const COLUMN_PATTERNS: { field: MappedField; patterns: RegExp[] }[] = [
  {
    field: "commitmentCents",
    patterns: [/commit/i, /pledge/i],
  },
  {
    field: "calledCents",
    patterns: [/called/i, /drawn/i, /contributed/i, /invested/i],
  },
  {
    field: "navCents",
    patterns: [/\bnav\b/i, /balance/i, /current.value/i, /fair.value/i],
  },
  {
    field: "returnedCents",
    patterns: [/distribut/i, /returned/i, /proceeds/i, /received/i],
  },
  {
    field: "investorStatus",
    patterns: [/status/i, /stage/i],
  },
  {
    field: "email",
    patterns: [/email/i, /e-mail/i, /contact/i],
  },
  {
    field: "entityType",
    patterns: [/entity/i, /structure/i, /type/i, /vehicle/i],
  },
  {
    field: "joinDate",
    patterns: [/close.date/i, /entry.date/i, /joined/i, /admission/i, /\bdate\b/i],
  },
  {
    field: "notes",
    patterns: [/note/i, /comment/i, /remark/i],
  },
];

function detectField(title: string): MappedField | null {
  for (const { field, patterns } of COLUMN_PATTERNS) {
    if (patterns.some((p) => p.test(title))) return field;
  }
  return null;
}

// ─── Value parsers ─────────────────────────────────────────────────────────────

function parseDollarsToCents(text: string): number | null {
  if (!text || text === "-" || text.trim() === "") return null;
  // Remove currency symbols, commas, spaces; allow negative
  const clean = text.replace(/[$,\s]/g, "").trim();
  const n = parseFloat(clean);
  if (isNaN(n)) return null;
  return Math.round(n * 100);
}

// ─── GraphQL query ─────────────────────────────────────────────────────────────

const BOARD_QUERY = `
  query GetBoardItems($boardId: ID!) {
    boards(ids: [$boardId]) {
      id
      name
      columns {
        id
        title
        type
      }
      items_page(limit: 500) {
        cursor
        items {
          id
          name
          column_values {
            id
            text
            value
          }
        }
      }
    }
  }
`;

const BOARDS_LIST_QUERY = `
  query ListBoards {
    boards(limit: 50, order_by: created_at) {
      id
      name
      items_count
    }
  }
`;

// ─── Client ───────────────────────────────────────────────────────────────────

async function mondayQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const apiToken = process.env.MONDAY_API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "MONDAY_API_TOKEN is not set. Add it to Railway environment variables."
    );
  }

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiToken,
      "API-Version": "2024-01",
    },
    body: JSON.stringify({ query, variables }),
    // Don't cache — always fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Monday API HTTP ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as MondayResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Monday API error: ${json.errors[0].message}`);
  }

  return json.data;
}

// ─── Public helpers ───────────────────────────────────────────────────────────

/** Fetch all boards the token can access — useful for setup/discovery. */
export async function listMondayBoards(): Promise<MondayBoardMeta[]> {
  const data = await mondayQuery<{ boards: { id: string; name: string; items_count: number }[] }>(
    BOARDS_LIST_QUERY
  );
  return data.boards.map((b) => ({
    id: b.id,
    name: b.name,
    itemCount: b.items_count ?? 0,
  }));
}

/** Fetch and map investors from the configured board. */
export async function fetchMondayInvestors(): Promise<{
  investors: MondayInvestor[];
  boardName: string;
}> {
  const boardId = process.env.MONDAY_INVESTORS_BOARD_ID;
  if (!boardId) {
    throw new Error(
      "MONDAY_INVESTORS_BOARD_ID is not set. Add the numeric board ID to Railway environment variables."
    );
  }

  const data = await mondayQuery<{ boards: MondayBoard[] }>(BOARD_QUERY, {
    boardId,
  });

  const board = data.boards[0];
  if (!board) {
    throw new Error(`Monday board ${boardId} not found or not accessible.`);
  }

  // Build column-id → field mapping
  const colMap = new Map<string, MappedField>();
  for (const col of board.columns) {
    const field = detectField(col.title);
    if (field && !colMap.has(col.id)) {
      // First match wins — avoid overwriting with weaker match
      colMap.set(col.id, field);
    }
  }

  // Currency columns detected from column type or title
  const moneyFields = new Set<MappedField>([
    "commitmentCents",
    "calledCents",
    "navCents",
    "returnedCents",
  ]);

  // Map items → investors
  const investors: MondayInvestor[] = board.items_page.items.map((item) => {
    const inv: MondayInvestor = {
      id: item.id,
      name: item.name,
      commitmentCents: null,
      calledCents: null,
      navCents: null,
      returnedCents: null,
      investorStatus: null,
      email: null,
      entityType: null,
      joinDate: null,
      notes: null,
      extra: {},
    };

    for (const cv of item.column_values) {
      const field = colMap.get(cv.id);
      if (!cv.text || cv.text === "-") continue;

      if (field) {
        if (moneyFields.has(field)) {
          (inv as unknown as Record<string, unknown>)[field] = parseDollarsToCents(cv.text);
        } else {
          (inv as unknown as Record<string, unknown>)[field] = cv.text;
        }
      } else {
        // Store unmapped columns in extra
        const colDef = board.columns.find((c) => c.id === cv.id);
        if (colDef && cv.text) {
          inv.extra[colDef.title] = cv.text;
        }
      }
    }

    return inv;
  });

  return { investors, boardName: board.name };
}
