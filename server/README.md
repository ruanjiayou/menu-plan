# server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.11. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## prisma
- 先生成schema: `bunx --bun prisma init --datasource-provider sqlite --output ./db`
- 修改prisma.config.js (使用dotenv设置环境变量) schema.prisma (添加prismabox和model)
- 生成代码: `bunx --bun prisma generate`
- 连接并测试
  ```js
  import { PrismaClient } from "./db/client";
  import { PrismaLibSql } from "@prisma/adapter-libsql";

  const adapter = new PrismaLibSql({ url: "file:../dev.db" });
  const prisma = new PrismaClient({ adapter });

  // 测试数据库连接
  prisma.$connect()
    .then(() => console.log('✅ Prisma 已连接到数据库'))
    .catch((error) => console.error('❌ Prisma 连接失败:', error))

  export default prisma;
  ```