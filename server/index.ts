import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { kindsRoutes } from "./routes/kinds";
import { dishesRoutes } from "./routes/dishes";
import { recordsRoutes } from "./routes/records";

const app = new Elysia()
app.use(cors({
  origin: true,           // 允许所有来源
  credentials: false,      // 允许携带凭证
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflight: true         // 关键：启用预检请求处理
}));
app
  .onBeforeHandle(({ set }) => {
    // 处理pwa进行缓存报错的问题
    set.headers['vary'] = 'Accept-Encoding'
  })
  // 健康检查
  .get("/", () => ({
    success: true,
    message: "吃什么计划",
    version: "1.0.0",
  }))
  // 注册路由
  .use(kindsRoutes)
  .use(dishesRoutes)
  .use(recordsRoutes)
  .listen(3366);

console.log("🦊 服务器运行在 http://localhost:3366");