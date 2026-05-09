import { Elysia } from "elysia";
import db from "../prisma";
import Response from '../utils/Response'
import type { KindCreateInput, KindUpdateInput } from "../prisma/generated/models";

export const kindsRoutes = new Elysia({ prefix: "/api/kinds" })
  .decorate('Response', new Response())
  // 获取所有分类
  .get("/", async ({ Response }) => {
    const list = await db.kind.findMany({
      where: {},
      orderBy: { sn: 'asc' }
    });
    return Response.success({ list })
  })

  // 获取单个分类
  .get("/:id", async ({ params, Response }) => {
    const info = await db.kind.findFirst({ where: { id: params.id } })
    if (!info) {
      return Response.failure('NotFound')
    }
    return Response.success({ info });
  })

  // 创建分类
  .post("/", async ({ body, Response }) => {
    try {
      const data = body as KindCreateInput;
      const sn = await db.kind.count();

      const info = await db.kind.create({ data: { ...data, sn: sn + 1 } });
      return Response.success({ info })
    } catch (error: any) {
      return Response.failure(error.message)
    }
  })

  // 更新分类 
  .put("/:id",
    async ({ params, body, Response }) => {
      try {
        await db.kind.update({
          where: { id: params.id },
          data: body as KindUpdateInput
        })
        return Response.success()
      } catch (error: any) {
        return Response.failure(error.message)
      }
    })

  // 删除分类（级联删除会删除关联的菜品）
  .delete("/:id", async ({ params, Response }) => {
    try {
      const count = await db.dish.count({ where: { kind_id: params.id } });
      if (count !== 0) {
        return Response.failure(`该分类下还有 ${count} 个菜品，请先删除菜品`)
      }
      await db.kind.delete({ where: { id: params.id } })
      return Response.success();
    } catch (error: any) {
      return Response.failure(error.message)
    }
  });
