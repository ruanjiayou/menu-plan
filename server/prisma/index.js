import { PrismaClient } from "./generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { config } from "dotenv"

config({ path: ".env" })

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 测试数据库连接
prisma.$connect()
  .then(() => console.log('✅ Prisma 已连接到数据库'))
  .catch((error) => console.error('❌ Prisma 连接失败:', error))

export default prisma;