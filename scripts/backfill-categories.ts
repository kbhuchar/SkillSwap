import { loadEnvConfig } from "@next/env";
import { inferCategory } from "../lib/skillCategories";

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../lib/prisma");

  const skills = await prisma.skill.findMany({ where: { category: null } });
  console.log(`Found ${skills.length} skills without a category`);

  let updated = 0;
  for (const skill of skills) {
    const category = inferCategory(skill.name);
    if (category) {
      await prisma.skill.update({ where: { id: skill.id }, data: { category } });
      console.log(`  ${skill.name} → ${category}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated ${updated}/${skills.length} skills.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
