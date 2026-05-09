import { Elysia } from "elysia";
import db from "../prisma";
import Response from '../utils/Response'
import type { DishCreateInput, DishUpdateInput } from "../prisma/generated/models";

export const dishesRoutes = new Elysia({ prefix: "/api/dishes" })
  .decorate('Response', new Response())

  // 获取所有菜品（支持按分类筛选）
  .get("/", async ({ query, Response }) => {
    const where: any = {};
    if (query.kind_id) {
      where.kind_id = query.kind_id
    }
    try {
      const list = await db.dish.findMany({
        where,
        orderBy: {},
      })
      if (query.with && query.with.includes('kind')) {
        const ids = list.map(v => v.kind_id);
        const kinds = await db.kind.findMany({ where: { id: { in: Array.from(new Set(ids)) } } })
        list.forEach(v => {
          // @ts-ignore
          v.kind = kinds.find(k => k.id === v.kind_id) || {}
        })
      }
      return Response.success({ list })
    } catch (error: any) {
      console.log(error);
      return Response.failure(error.message)
    }
  })

  // 获取单个菜品
  .get("/:id", async ({ params, Response }) => {
    const info = await db.dish.findFirst({ where: { id: params.id } });
    if (!info) {
      return Response.failure('菜品不存在')
    }
    return Response.success({ info })
  })

  // 创建菜品
  .post("/", async ({ body, Response }) => {
    try {
      const data = body as DishCreateInput;
      const sn = await db.dish.count({ where: { kind_id: data.kind_id } })
      const info = await db.dish.create({ data: { ...data, sn: sn + 1 } })
      return Response.success({ info });
    } catch (error: any) {
      return Response.failure(error.message)
    }
  })

  // 更新菜品
  .put("/:id", async ({ params, body, Response }) => {
    try {
      await db.dish.update({ where: { id: params.id }, data: body as DishUpdateInput })
      return Response.success()
    } catch (error: any) {
      return Response.failure(error.message)
    }
  })

  // 删除菜品
  .delete("/:id", async ({ params, Response }) => {
    try {
      const count = await db.record.count({ where: { dish_id: params.id } })
      if (count) {
        return Response.failure(`该菜品有 ${count} 条记录数据,不能删除`)
      }
      await db.dish.delete({ where: { id: params.id } })
      return Response.success()
    } catch (error: any) {
      return Response.failure(error.message);
    }
  });