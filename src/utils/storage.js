import { format } from 'date-fns'

const STORAGE_PREFIX = 'meal_planner_'
const DISHES_KEY = 'dishes'
const DISH_REPEAT_CONFIG_KEY = 'meal_dish_repeat_config'

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

// 获取菜品重复判断配置（按菜品名称来）
export const getDishRepeatConfig = () => {
  const data = localStorage.getItem(DISH_REPEAT_CONFIG_KEY)
  return data ? JSON.parse(data) : {}
}

export const saveDishRepeatConfig = (config) => {
  localStorage.setItem(DISH_REPEAT_CONFIG_KEY, JSON.stringify(config))
}

// 获取指定菜品的重复判断开关 (默认为 true - 参与判断)
export const getDishRepeatCheckEnabled = (dishName) => {
  const config = getDishRepeatConfig()
  return config[dishName] !== false // 默认 true
}

// 设置菜品重复判断开关
export const setDishRepeatCheckEnabled = (dishName, enabled) => {
  const config = getDishRepeatConfig()
  config[dishName] = enabled
  saveDishRepeatConfig(config)
}