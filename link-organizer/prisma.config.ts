import 'dotenv/config'; // ✅ Auto-included by prisma init
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // ✅ NO engine property - removed in Prisma v7
  datasource: {
    url: env('DATABASE_URL'),
  },
});
