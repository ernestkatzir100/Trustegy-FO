import { db } from "./index";
import { entities, taxCategories } from "./schema/entities";
import { expenses } from "./schema/expenses";
import { users } from "./schema/auth";
import { eq, and, isNull, sql } from "drizzle-orm";
import { toAgorot } from "../lib/money";

const PRE_SEEDED_ENTITIES = [
  {
    name: "טראסטג'י ייעוץ",
    description: "חברת הייעוץ העסקי",
  },
  {
    name: "חברת השקעות",
    description: "חברת ההשקעות",
  },
  {
    name: "אחזקות אישיות",
    description: "נכסים אישיים",
  },
];

const PRE_SEEDED_TAX_CATEGORIES = [
  { name: "הכנסות מייעוץ", description: "הכנסות מפעילות ייעוץ" },
  { name: "הכנסות מהשקעות", description: "רווחי הון, דיבידנדים, ריבית" },
  { name: "הוצאות שכר", description: "משכורות ותגמולים" },
  { name: "הוצאות משרד", description: "שכירות, חשמל, ארנונה" },
  { name: "הוצאות נסיעות", description: "נסיעות עסקיות" },
  { name: "הוצאות שיווק", description: "פרסום, שיווק דיגיטלי" },
  { name: "הוצאות מקצועיות", description: "עו\"ד, רו\"ח, יועצים" },
  { name: "הוצאות טכנולוגיה", description: "תוכנה, חומרה, שירותי ענן" },
  { name: "הוצאות ביטוח", description: "ביטוחים שונים" },
  { name: "הוצאות מימון", description: "ריביות, עמלות בנקאיות" },
  { name: "אחר", description: "הוצאות שאינן מסווגות" },
];

export async function seed() {
  // Find the first user (owner)
  const [owner] = await db.select().from(users).limit(1);
  if (!owner) {
    console.error("No user found. Please sign in first to create a user.");
    process.exit(1);
  }

  console.log(`Seeding data for user: ${owner.email ?? owner.id}`);

  // Seed entities
  for (const entity of PRE_SEEDED_ENTITIES) {
    const existing = await db
      .select()
      .from(entities)
      .where(
        and(
          eq(entities.name, entity.name),
          eq(entities.ownerId, owner.id),
          isNull(entities.deletedAt)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(entities).values({
        ...entity,
        ownerId: owner.id,
        isPreSeeded: true,
      });
      console.log(`  Created entity: ${entity.name}`);
    } else {
      console.log(`  Entity already exists: ${entity.name}`);
    }
  }

  // Seed tax categories
  for (const category of PRE_SEEDED_TAX_CATEGORIES) {
    const existing = await db
      .select()
      .from(taxCategories)
      .where(
        and(
          eq(taxCategories.name, category.name),
          eq(taxCategories.ownerId, owner.id),
          isNull(taxCategories.deletedAt)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(taxCategories).values({
        ...category,
        ownerId: owner.id,
        isPreSeeded: true,
      });
      console.log(`  Created tax category: ${category.name}`);
    } else {
      console.log(`  Tax category already exists: ${category.name}`);
    }
  }

  // Seed expenses (only if table is empty for this user)
  const existingExpenses = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(expenses)
    .where(eq(expenses.ownerId, owner.id));

  if (Number(existingExpenses[0]?.count ?? 0) === 0) {
    const SEED_EXPENSES = [
      { category: "SALARY" as const, description: "משכורת פברואר 2026", amount: 25000, date: "2026-02-28", vendorName: "שכר עובדים", isRecurring: true },
      { category: "SALARY" as const, description: "משכורת מרץ 2026", amount: 25000, date: "2026-03-31", vendorName: "שכר עובדים", isRecurring: true },
      { category: "VEHICLE" as const, description: "ליסינג רכב", amount: 3200, date: "2026-01-01", vendorName: "קל-אמ", isRecurring: true },
      { category: "VEHICLE" as const, description: "דלק ינואר", amount: 800, date: "2026-01-31", vendorName: "פז", isRecurring: false },
      { category: "ACCOUNTING" as const, description: "שירותי הנהלת חשבונות", amount: 2500, date: "2026-01-31", vendorName: 'רו"ח', isRecurring: true },
      { category: "ACCOUNTING" as const, description: "ביקורת שנתית 2025", amount: 8000, date: "2026-01-15", vendorName: 'רו"ח', isRecurring: false },
      { category: "LEGAL" as const, description: "ייעוץ משפטי", amount: 3000, date: "2026-02-01", vendorName: 'עו"ד', isRecurring: false },
      { category: "FINANCING" as const, description: "ריבית הלוואה מזרחי", amount: 1200, date: "2026-01-31", vendorName: "בנק מזרחי", isRecurring: true },
      { category: "FINANCING" as const, description: "ריבית הלוואה BTB", amount: 3800, date: "2026-01-31", vendorName: "BTB", isRecurring: true },
      { category: "MAINTENANCE" as const, description: "תחזוקת משרד", amount: 600, date: "2026-01-15", vendorName: "ניקיון", isRecurring: true },
      { category: "TAX" as const, description: "מקדמות מס הכנסה", amount: 4500, date: "2026-01-15", vendorName: "רשות המסים", isRecurring: true },
      { category: "SUBCONTRACTOR" as const, description: "ייעוץ חיצוני", amount: 5000, date: "2026-02-10", vendorName: "יועץ חיצוני", isRecurring: false },
      { category: "GIFTS" as const, description: "מתנות לקוחות", amount: 1200, date: "2025-12-31", vendorName: "שונים", isRecurring: false },
      { category: "VEHICLE" as const, description: "ביטוח רכב שנתי", amount: 4800, date: "2025-12-01", vendorName: "הפניקס", isRecurring: false },
      { category: "TAX" as const, description: 'מע"מ חודשי', amount: 3200, date: "2026-02-15", vendorName: "רשות המסים", isRecurring: true },
    ];

    for (const expense of SEED_EXPENSES) {
      await db.insert(expenses).values({
        ownerId: owner.id,
        category: expense.category,
        description: expense.description,
        amount: toAgorot(expense.amount),
        date: expense.date,
        vendorName: expense.vendorName,
        isRecurring: expense.isRecurring,
        importSource: "MANUAL",
      });
    }
    console.log(`  Created ${SEED_EXPENSES.length} seed expenses`);
  } else {
    console.log(`  Expenses already exist (${existingExpenses[0]?.count} rows)`);
  }

  console.log("Seed completed.");
}

// Run directly with: npx tsx src/db/seed.ts
seed().catch(console.error);
