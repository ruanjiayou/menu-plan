import { format } from 'date-fns'

const STORAGE_PREFIX = 'meal_planner_'
const DISHES_KEY = 'dishes'
const MEAL_REPEAT_CONFIG_KEY = 'meal_repeat_config'

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

// 获取菜品重复判断配置（按菜品ID）
const getRepeatConfig = () => {
  const data = localStorage.getItem(MEAL_REPEAT_CONFIG_KEY)
  return data ? JSON.parse(data) : {}
}

const saveRepeatConfig = (config) => {
  localStorage.setItem(MEAL_REPEAT_CONFIG_KEY, JSON.stringify(config))
}

// 获取指定菜品ID在指定日期的重复判断开关 (默认为 true - 参与判断)
export const getDishRepeatCheckEnabled = (dateStr, dishId) => {
  const config = getRepeatConfig()
  const key = `${dateStr}_${dishId}`
  return config[key] !== false // 默认 true
}

// 设置菜品重复判断开关
export const setDishRepeatCheckEnabled = (dateStr, dishId, enabled) => {
  const config = getRepeatConfig()
  const key = `${dateStr}_${dishId}`
  config[key] = enabled
  saveRepeatConfig(config)
}