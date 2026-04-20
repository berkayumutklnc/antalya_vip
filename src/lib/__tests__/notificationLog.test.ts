import { describe, it, expect, vi } from "vitest";

/**
 * Tests for notification logging behavior (src/lib/server/notificationLog.ts).
 *
 * Validates channel types, dedup logic, and log write shape.
 * Uses mocked Supabase to avoid live DB dependency.
 */

vi.mock("@/lib/supabaseAdmin", () => ({
  getAdminClient: () => ({}),
}));

const { writeNotificationLog, isDuplicateNotification, getNotificationLogs } = await import(
  "@/lib/server/notificationLog"
);

/* ------------------------------------------------------------------ */
/* Mock DB builder                                                     */
/* ------------------------------------------------------------------ */

function mockInsertDb(returnId = "log-uuid-123") {
  const insertedRows: any[] = [];
  return {
    client: {
      from: () => ({
        insert: (row: any) => {
          insertedRows.push(row);
          return {
            select: () => ({
              single: () => ({
                data: { id: returnId },
                error: null,
              }),
            }),
          };
        },
      }),
    } as any,
    insertedRows,
  };
}

function mockDedupDb(existingCount: number) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            gte: () => ({
              limit: () => ({
                data: Array(existingCount).fill({ id: "x" }),
                error: null,
              }),
            }),
          }),
        }),
      }),
    }),
  } as any;
}

function mockLogsDb(rows: any[]) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              data: rows,
              error: null,
            }),
          }),
        }),
      }),
    }),
  } as any;
}

/* ================================================================== */
/* Tests                                                               */
/* ================================================================== */

describe("writeNotificationLog", () => {
  it("inserts a log entry and returns the ID", async () => {
    const { client, insertedRows } = mockInsertDb("abc-123");
    const id = await writeNotificationLog(client, {
      reservationId: "TRF-TEST01",
      reservationCode: "TRF-TEST01",
      channel: "email",
      notificationType: "reservation_created_customer",
      recipient: "test@example.com",
      status: "sent",
      errorMessage: null,
      providerMeta: null,
      triggeredBy: "public",
      triggeredById: null,
      dedupeKey: null,
      timestamp: Date.now(),
    });
    expect(id).toBe("abc-123");
    expect(insertedRows).toHaveLength(1);
    expect(insertedRows[0].channel).toBe("email");
    expect(insertedRows[0].status).toBe("sent");
  });

  it("accepts telegram as a channel", async () => {
    const { client, insertedRows } = mockInsertDb();
    await writeNotificationLog(client, {
      reservationId: "TRF-TEST02",
      reservationCode: "TRF-TEST02",
      channel: "telegram",
      notificationType: "reservation_created_admin",
      recipient: "123456789",
      status: "sent",
      errorMessage: null,
      providerMeta: null,
      triggeredBy: "system",
      triggeredById: null,
      dedupeKey: null,
      timestamp: Date.now(),
    });
    expect(insertedRows[0].channel).toBe("telegram");
  });
});

describe("isDuplicateNotification", () => {
  it("returns true when a matching log exists within window", async () => {
    const db = mockDedupDb(1);
    const result = await isDuplicateNotification(db, "dedup-key-1", 60_000);
    expect(result).toBe(true);
  });

  it("returns false when no matching log exists", async () => {
    const db = mockDedupDb(0);
    const result = await isDuplicateNotification(db, "dedup-key-2", 60_000);
    expect(result).toBe(false);
  });
});

describe("getNotificationLogs", () => {
  it("returns logs for a reservation", async () => {
    const rows = [
      { id: "1", channel: "email", status: "sent" },
      { id: "2", channel: "telegram", status: "sent" },
    ];
    const db = mockLogsDb(rows);
    const logs = await getNotificationLogs(db, "TRF-TEST01", 50);
    expect(logs).toHaveLength(2);
    expect(logs![0].channel).toBe("email");
    expect(logs![1].channel).toBe("telegram");
  });
});
