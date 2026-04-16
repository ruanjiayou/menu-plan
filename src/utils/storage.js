import { format } from 'date-fns'

const STORAGE_PREFIX = 'meal_planner_'
const DISHES_KEY = 'dishes'

// 获取指定月份的存储键
export const getStorageKey = (date) => {
  return `${STORAGE_PREFIX}${format(date, 'yyyy-MM')}`
}

// 获取菜单数据
export const getMealData = (date) => {
  const key = getStorageKey(date)
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : {}
}

// 保存菜单数据
export const saveMealData = (date, data) => {
  const key = getStorageKey(date)
  localStorage.setItem(key, JSON.stringify(data))
}

// 获取菜品数据
export const getDishesData = () => {
  const data = localStorage.getItem(DISHES_KEY)
  return data ? JSON.parse(data) : []
}

// 保存菜品数据
export const saveDishesData = (data) => {
  localStorage.setItem(DISHES_KEY, JSON.stringify(data))
}