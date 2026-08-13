import { describe, it, expect } from "vitest";
import { calculateFine, computeDemandAlerts } from "../lib/automation/fines";
import { can } from "../lib/rbac";

describe("calculateFine", () => {
  const rule = { perDayAmount: 5, gracePeriodDays: 2, maxFineCap: 500 };

  it("returns 0 within grace period", () => {
    const due = new Date("2026-01-01");
    const returned = new Date("2026-01-02");
    expect(calculateFine(due, returned, rule)).toBe(0);
  });

  it("calculates fine after grace period", () => {
    const due = new Date("2026-01-01");
    const returned = new Date("2026-01-06");
    expect(calculateFine(due, returned, rule)).toBe(15);
  });

  it("caps at maxFineCap", () => {
    const due = new Date("2026-01-01");
    const returned = new Date("2026-06-01"); // 151 days - 2 grace = 149 billable days * $5 = $745, comfortably over the $500 cap
    expect(calculateFine(due, returned, rule)).toBe(500);
  });
});

describe("computeDemandAlerts", () => {
  it("flags high demand low stock books", () => {
    const alerts = computeDemandAlerts([
      { bookId: "1", title: "Algo", reservations: 5, requests: 2, availableCopies: 0 },
      { bookId: "2", title: "OS", reservations: 1, requests: 0, availableCopies: 5 },
    ]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].title).toBe("Algo");
  });
});

describe("RBAC can()", () => {
  it("allows students to reserve books", () => {
    expect(can({ id: "1", role: "STUDENT" }, "reserve", "Book")).toBe(true);
  });

  it("denies students from issuing books", () => {
    expect(can({ id: "1", role: "STUDENT" }, "issue", "Book")).toBe(false);
  });

  it("allows librarians to issue books", () => {
    expect(can({ id: "1", role: "LIBRARIAN" }, "issue", "Book")).toBe(true);
  });

  it("superadmin can do everything", () => {
    expect(can({ id: "1", role: "SUPERADMIN" }, "delete", "User")).toBe(true);
  });
});
