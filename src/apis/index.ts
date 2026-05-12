import { type IRecord, type IDish, type IKind, } from "../global";
import shttp from "../utils/shttp";

// kinds
export async function getKinds(query = {}) {
  const result = await shttp.get<IKind>(`/api/kinds`, { params: query });
  if (result.success) {
    const data = result.data.list!;
    return data;
  } else {
    throw ('error')
  }
}
export async function createKind(data: Partial<IKind>) {
  return await shttp.post('/api/kinds', data)
}
export async function destryKind(id: string) {
  return await shttp.delete(`/api/kinds/${id}`);
}
// dishes
export async function getDishes(query = {}) {
  const result = await shttp.get<IDish>(`/api/dishes`, { params: query });
  if (result.success) {
    const data = result.data.list!;
    return data;
  } else {
    throw ('error')
  }
}
export async function createDish(data: Partial<IDish>) {
  return await shttp.post('/api/dishes', data)
}
export async function destryDish(id: string) {
  return await shttp.delete(`/api/dishes/${id}`);
}
export async function updateDish(id: string, diff: Partial<IDish>) {
  return await shttp.put(`/api/dishes/${id}`, diff)
}
// records
export async function getRecordsByDate(date: string) {
  const result = await shttp.get<IRecord>(`/api/records/${date}/dishes`);
  if (result.success) {
    const data = result.data.list!;
    return data;
  } else {
    throw ('error')
  }
}
export async function createRecord(data: Partial<IRecord>) {
  return await shttp.post('/api/records', data)
}
export async function destryRecord(id: string) {
  return await shttp.delete(`/api/records/${id}`);
}

