import { Elysia } from "elysia";
import { kindsRoutes } from "./routes/kinds";
import { dishesRoutes } from "./routes/dishes";
import { recordsRoutes } from "./routes/records";

const app = new Elysia()
  // 全局 CORS 配置
  .onBeforeHandle(({ set, request }) => {
    const origin = request.headers.get("origin");
    // 生产环境请替换为具体域名
    set.headers["Access-Control-Allow-Origin"] = origin || "*";
    set.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    set.headers["Access-Control-Allow-Credentials"] = "true";

    // 处理预检请求
    if (request.method === "OPTIONS") {
      set.status = 204;
      return "OK";
    }
  })
  // 健康检查
  .get("/", () => ({
    success: true,
    message: "吃什么计划",
    version: "1.0.0",
    endpoints: {
      types: "/api/kinds",
      dishes: "/api/dishes",
      records: "/api/records"
    }
  }))
  // 注册路由
  .use(kindsRoutes)
  .use(dishesRoutes)
  .use(recordsRoutes)
  .listen(3000);

console.log("🦊 服务器运行在 http://localhost:3000");