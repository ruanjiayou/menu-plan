import { Elysia } from "elysia";
import { keyBy } from 'lodash'
import { addDays, addHours, endOfDay, startOfDay, subDays, subMonths, addMonths } from 'date-fns'
import db from "../prisma";
import Response from '../utils/Response'
import type { RecordCreateInput, RecordUpdateInput } from "../prisma/db/models";

export const recordsRoutes = new Elysia({ prefix: "/api/records" })
  .decorate('Response', new Response())

  // 获取所有记录（支持日期、类型筛选和分页）
  .get("/", async ({ query, Response }) => {
    const where: any = {};
    if (query.date) {
      where.date = query.date;
    }
    const list = await db.record.findMany({
      where,
      orderBy: {}
    })
    return Response.success({ list })
  })

  // 获取指定日期的菜品列表
  .get("/:date/dishes", async ({ params, Response }) => {
    const o = new Date(params.date)
    const st = startOfDay(subMonths(o, 1));
    const et = endOfDay(addMonths(o, 1));
    const list = await db.record.findMany({ where: { time: { gte: st, lte: et } } });
    const ids = new Set<string>();
    list.forEach(v => ids.add(v.dish_id));
    const dishes = await db.dish.findMany({ where: { id: { in: Array.from(ids) } } })
    const mapping = keyBy(dishes, 'id')
    return Response.success({
      list: list.map(v => {
        // @ts-ignore
        v.dish = mapping[v.dish_id] || null;
        return v;
      })
    })
  })

  // 创建记录（带业务逻辑验证）
  .post("/", async ({ body, Response }) => {
    try {
      const data = body as RecordCreateInput
      data.time = addHours(new Date(data.date), data.type === 'lunch' ? 12 : 16)
      const sn = await db.record.count({ where: { date: data.date } })
      data.sn = sn + 1;
      // 1. 验证菜品是否存在
      const dish = await db.dish.findFirst({ where: { id: data.dish_id } })
      if (!dish) {
        return Response.failure('菜品不存在')
      }
      const record = await db.record.create({ data })
      //@ts-ignore
      record.dish = dish;
      return Response.success({ info: record })
    } catch (error: any) {
      return Response.failure(error.message)
    }
  })

  // 更新记录
  .put("/:id", async ({ params, body, Response }) => {
    try {
      await db.record.update({
        where: { id: params.id },
        data: body as RecordUpdateInput
      })
      return Response.success()
    } catch (error: any) {
      return Response.failure(error.message)
    }
  })

  // 删除记录
  .delete("/:id", async ({ params, Response }) => {
    try {
      await db.record.delete({ where: { id: params.id } })
      return Response.success()
    } catch (error: any) {
      return Response.failure(error.message);
    }
  })
