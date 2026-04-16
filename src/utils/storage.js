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

// 获取重复判断配置 - 存储每个日期的午晚餐是否参与重复判断
const REPEAT_CONFIG_KEY = 'meal_repeat_config'

export const getRepeatConfig = () => {
  const data = localStorage.getItem(REPEAT_CONFIG_KEY)
  return data ? JSON.parse(data) : {}
}

export const saveRepeatConfig = (config) => {
  localStorage.setItem(REPEAT_CONFIG_KEY, JSON.stringify(config))
}

// 获取指定日期、指定餐的重复判断开关 (默认为 true - 参与判断)
export const getRepeatCheckEnabled = (dateStr, mealType) => {
  const config = getRepeatConfig()
  const key = `${dateStr}_${mealType}`
  return config[key] !== false // 默认 true
}

// 设置重复判断开关
export const setRepeatCheckEnabled = (dateStr, mealType, enabled) => {
  const config = getRepeatConfig()
  const key = `${dateStr}_${mealType}`
  config[key] = enabled
  saveRepeatConfig(config)
}