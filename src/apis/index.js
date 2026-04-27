import shttp from "../utils/shttp";
import storage from "../utils/storage";

export async function getAccessToken(refresh_token) {
  const result = await shttp.post(`https://jiayou.work/gw/user/oauth/refresh`, {}, {
    headers: {
      Authorization: refresh_token
    }
  });
  if (result.code === 0) {
    const data = result.data;
    return data;
  } else {
    throw ('error')
  }
}

export async function getProfile() {
  const result = await shttp.get(`https://jiayou.work/gw/user/profile`, {
    headers: { Authorization: storage.getValue('access_token') }
  })
  if (result.code === 0) {
    return result.data;
  } else {
    throw ('error')
  }
}

export async function logout() {
  const result = await shttp.post(`https://jiayou.work/gw/user/oauth/sign-out`, {}, {
    headers: { Authorization: storage.getValue('refresh_token') }
  })
  return result;
}

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
export async function getRecordsByDate(date) {
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

