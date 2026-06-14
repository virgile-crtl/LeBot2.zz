import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev' });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
