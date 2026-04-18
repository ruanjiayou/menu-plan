import shttp from "../utils/shttp";

// kinds
export async function getKinds(query = {}) {
  const result = await shttp.get(`/api/kinds`, { params: query });
  if (result.success) {
    const data = result.data.list;
    return data;
  } else {
    throw ('error')
  }
}
export async function createKind(data) {
  return await shttp.post('/api/kinds', data)
}
export async function destryKind(id) {
  return await shttp.delete(`/api/kinds/${id}`);
}
// dishes
export async function getDishes(query = {}) {
  const result = await shttp.get(`/api/dishes`, { params: query });
  if (result.success) {
    const data = result.data.list;
    return data;
  } else {
    throw ('error')
  }
}
export async function createDish(data) {
  return await shttp.post('/api/dishes', data)
}
export async function destryDish(id) {
  return await shttp.delete(`/api/dishes/${id}`);
}
// records
export async function getDateRecords(date) {
  const result = await shttp.get(`/api/records/${date}/dishes`);
  if (result.success) {
    const data = result.data.list;
    return data;
  } else {
    throw ('error')
  }
}
export async function createRecord(data) {
  return await shttp.post('/api/records', data)
}
export async function destryRecord(id) {
  return await shttp.delete(`/api/records/${id}`);
}

