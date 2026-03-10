import { db } from "./index";
import { entities, taxCategories } from "./schema/entities";
import { users } from "./schema/auth";
import { eq, and, isNull } from "drizzle-orm";

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

  console.log("Seed completed.");
}

// Run directly with: npx tsx src/db/seed.ts
seed().catch(console.error);
