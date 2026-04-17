import assert from 'node:assert'
import { describe, it } from 'node:test'

import { getDateRepeatedList } from '../src/utils/index.js'



describe('菜品重复测试', () => {
  it('单天不重复', () => {
    const data = {
      '2026-04-17': [
        { id: 'uuid_1', date: '2026-04-17', dish_id: 'd1', sn: 1, type: 'lunch', can_repeated: 0 },
        { id: 'uuid_2', date: '2026-04-17', dish_id: 'd2', sn: 2, type: 'dinner', can_repeated: 0 },
      ],
    }
    const repeats = getDateRepeatedList('2026-04-17', data);
    assert.deepStrictEqual(repeats, [])
  })
  it('单天重复1次', () => {
    const data = {
      '2026-04-17': [
        { id: 'uuid_1', date: '2026-04-17', dish_id: 'd1', sn: 1, type: 'lunch', can_repeated: 0 },
        { id: 'uuid_2', date: '2026-04-17', dish_id: 'd1', sn: 2, type: 'dinner', can_repeated: 0 },
      ],
    }
    const repeats = getDateRepeatedList('2026-04-17', data);
    assert.deepStrictEqual(repeats, ['d1'])
  })
  it('单天重复2次', () => {
    const data = {
      '2026-04-17': [
        { id: 'uuid_1', date: '2026-04-17', dish_id: 'd1', sn: 1, type: 'lunch', can_repeated: 0 },
        { id: 'uuid_2', date: '2026-04-17', dish_id: 'd2', sn: 2, type: 'dinner', can_repeated: 0 },
        { id: 'uuid_3', date: '2026-04-17', dish_id: 'd2', sn: 2, type: 'dinner', can_repeated: 0 },
        { id: 'uuid_4', date: '2026-04-17', dish_id: 'd1', sn: 2, type: 'dinner', can_repeated: 0 },
      ],
    }
    const repeats = getDateRepeatedList('2026-04-17', data);
    assert.deepStrictEqual(repeats.sort(), ['d1', 'd2'].sort())
  })
  it('七天内不重复', () => {
    const data = {
      '2026-04-10': [
        { id: 'uuid_1', date: '2026-04-10', dish_id: 'd1', sn: 1, type: 'lunch', can_repeated: 0 },
      ],
      '2026-04-17': [
        { id: 'uuid_2', date: '2026-04-17', dish_id: 'd2', sn: 1, type: 'lunch', can_repeated: 0 },
        { id: 'uuid_3', date: '2026-04-17', dish_id: 'd3', sn: 2, type: 'dinner', can_repeated: 0 },
      ],
      '2026-04-23': [
        { id: 'uuid_4', date: '2026-04-23', dish_id: 'd4', sn: 1, type: 'lunch', can_repeated: 0 },
      ],
    }
    const repeats = getDateRepeatedList('2026-04-17', data);
    assert.deepStrictEqual(repeats, [])
  })
  it('前七天重复1次', () => {
    const data = {
      '2026-04-10': [
        { id: 'uuid_1', date: '2026-04-10', dish_id: 'd1', sn: 1, type: 'lunch', can_repeated: 0 },
      ],
      '2026-04-17': [
        { id: 'uuid_2', date: '2026-04-17', dish_id: 'd2', sn: 1, type: 'lunch', can_repeated: 0 },
        { id: 'uuid_3', date: '2026-04-17', dish_id: 'd1', sn: 2, type: 'dinner', can_repeated: 0 },
      ],
    }
    const repeats = getDateRepeatedList('2026-04-17', data);
    assert.deepStrictEqual(repeats, ['d1'])
  })
  it('后七天重复1次', () => {
    const data = {
      '2026-04-17': [
        { id: 'uuid_2', date: '2026-04-17', dish_id: 'd2', sn: 1, type: 'lunch', can_repeated: 0 },
        { id: 'uuid_3', date: '2026-04-17', dish_id: 'd1', sn: 2, type: 'dinner', can_repeated: 0 },
      ],
      '2026-04-23': [
        { id: 'uuid_4', date: '2026-04-23', dish_id: 'd1', sn: 1, type: 'lunch', can_repeated: 0 },
      ],
    }
    const repeats = getDateRepeatedList('2026-04-17', data);
    assert.deepStrictEqual(repeats, ['d1'])
  })
})