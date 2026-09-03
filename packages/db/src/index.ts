import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@webbriks-technical-assessment/env/server";

import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export type * from "@prisma/client";
export { PrismaClient, prisma };
export default prisma;

