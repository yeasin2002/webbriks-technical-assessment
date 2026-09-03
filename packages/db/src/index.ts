import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@webbriks-technical-assessment/env/server";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma, PrismaClient };
export type * from "../prisma/generated/client";
export default prisma;

