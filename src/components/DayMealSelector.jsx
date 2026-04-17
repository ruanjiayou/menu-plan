import React, { useState, useEffect } from 'react'
import { format, subDays, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { X, Plus, Check, Eye, EyeOff } from 'lucide-react'
import { getDishRepeatCheckEnabled, setDishRepeatCheckEnabled, getDateDishes, saveMealData, getStorageKey } from '../utils/storage'
import '../styles/DayMealSelector.css'

const DayMealSelector = ({ date, meals, dishes, repeatStatus, onMealSelect, onRepeatStatusChange, onClose }) => {
  const [tempSelectedDishes, setTempSelectedDishes] = useState({
    lunch: meals.lunch || [],
    dinner: meals.dinner || []
  })

  const [dishRepeatSettings, setDishRepeatSettings] = useState(() => {
    const settings = {}
      ;['lunch', 'dinner'].forEach(mealType => {
        tempSelectedDishes[mealType].forEach(dish => {
          settings[`${mealType}_${dish.id}`] = getDishRepeatCheckEnabled(format(date, 'yyyy-MM-dd'), dish.id)
        })
      })
    return settings
  })

  const [currentRepeatStatus, setCurrentRepeatStatus] = useState(repeatStatus)
  const [dishSelectorRepeatStatus, setDishSelectorRepeatStatus] = useState({}) // 菜品选择器中的重复状态

  const dateStr = format(date, 'yyyy-MM-dd')
  const [showDishList, setShowDishList] = useState(false)
  const [selectedMealTypeForAdd, setSelectedMealTypeForAdd] = useState('lunch')

  const categories = [...new Set(dishes.map(d => d.kind_id))].filter(Boolean).map(catId => {
    const firstDish = dishes.find(d => d.kind_id === catId)
    return { id: catId, title: firstDish?.categoryTitle }
  })

  // 计算单个菜品在15天范围内的重复情况
  const calculateDishRepeatStatus = (dishId, mealData) => {
    const status = {
      lunch: {},
      dinner: {}
    }

    // 检查这个菜品在最近15天内是否重复
    let foundDates = []

    for (let i = -7; i <= 7; i++) {
      const checkDate = addDays(date, i)
      const checkDateStr = format(checkDate, 'yyyy-MM-dd')
      const checkMeals = mealData[checkDateStr] || {}
      const checkLunch = checkMeals.lunch || []
      const checkDinner = checkMeals.dinner || []

      // 找到所有包含这个菜品的日期和餐次
      if (checkLunch.some(d => d.id === dishId)) {
        foundDates.push({ date: checkDateStr, type: 'lunch' })
      }
      if (checkDinner.some(d => d.id === dishId)) {
        foundDates.push({ date: checkDateStr, type: 'dinner' })
      }
    }

    // 如果这个菜品出现超过1次，标记所有出现的位置为重复
    if (foundDates.length > 1) {
      foundDates.forEach(({ date: foundDateStr, type }) => {
        if (type === 'lunch') {
          status.lunch[foundDateStr] = true
        } else {
          status.dinner[foundDateStr] = true
        }
      })
    }

    return status
  }

  // 计算所有菜品的重复状态（用于菜品选择器）
  const calculateAllDishesRepeatStatus = (mealData) => {
    const statusMap = {}

    // 遍历所有菜品，计算每个菜品的重复状态
    dishes.forEach(dish => {
      const dishId = dish.id
      const enabled = getDishRepeatCheckEnabled(dateStr, dishId)

      if (enabled) {
        let foundCount = 0

        for (let i = -7; i <= 7; i++) {
          const checkDate = addDays(date, i)
          const checkDateStr = format(checkDate, 'yyyy-MM-dd')
          const checkMeals = mealData[checkDateStr] || {}
          const checkLunch = checkMeals.lunch || []
          const checkDinner = checkMeals.dinner || []

          if (checkLunch.some(d => d.id === dishId) || checkDinner.some(d => d.id === dishId)) {
            foundCount++
          }
        }

        // 出现超过1次则标记为重复
        statusMap[dishId] = foundCount > 1
      } else {
        statusMap[dishId] = false
      }
    })

    return statusMap
  }

  // 打开菜品选择器时，计算所有菜品的重复状态
  const openDishSelector = async (mealType) => {
    setSelectedMealTypeForAdd(mealType)
    const mealsDataForMonth = await getDateDishes(date)
    const allDishesStatus = calculateAllDishesRepeatStatus(mealsDataForMonth)
    setDishSelectorRepeatStatus(allDishesStatus)
    setShowDishList(true)
  }

  // 当菜品或重复设置改变时，更新15天范围内所有可能受影响的菜品的重复状态
  const updateRepeatStatusForAllDishes = (mealData) => {
    const mealsDataForMonth = getDateDishes(date)
    const allMealsData = { ...mealsDataForMonth, ...mealData }

    const newRepeatStatus = { ...currentRepeatStatus }

    // 遍历所有菜品
    dishes.forEach(dish => {
      const dishId = dish.id
      const dishRepeatStatus = calculateDishRepeatStatus(dishId, allMealsData)

      // 更新15天范围内所有日期的重复状态
      for (let i = -7; i <= 7; i++) {
        const checkDate = addDays(date, i)
        const checkDateStr = format(checkDate, 'yyyy-MM-dd')

        if (!newRepeatStatus[checkDateStr]) {
          newRepeatStatus[checkDateStr] = { lunch: {}, dinner: {} }
        }

        // 更新这个日期的午餐重复状态
        if (dishRepeatStatus.lunch[checkDateStr] !== undefined) {
          const enabled = getDishRepeatCheckEnabled(checkDateStr, dishId)
          newRepeatStatus[checkDateStr].lunch[dishId] = dishRepeatStatus.lunch[checkDateStr] && enabled
        }

        // 更新这个日期的晚餐重复状态
        if (dishRepeatStatus.dinner[checkDateStr] !== undefined) {
          const enabled = getDishRepeatCheckEnabled(checkDateStr, dishId)
          newRepeatStatus[checkDateStr].dinner[dishId] = dishRepeatStatus.dinner[checkDateStr] && enabled
        }
      }
    })

    setCurrentRepeatStatus(newRepeatStatus)
    onRepeatStatusChange(newRepeatStatus)
  }

  const handleToggleDish = (dishItem) => {
    const mealDishes = tempSelectedDishes[selectedMealTypeForAdd] || []
    const exists = mealDishes.some(d => d.id === dishItem.id)

    const newMeals = {
      ...tempSelectedDishes,
      [selectedMealTypeForAdd]: exists
        ? mealDishes.filter(d => d.id !== dishItem.id)
        : [...mealDishes, dishItem]
    }

    // 立即更新本地状态
    setTempSelectedDishes(newMeals)

    // 立即保存数据
    saveMealData(date, newMeals)

    // 更新重复判断设置
    if (!exists) {
      const key = `${selectedMealTypeForAdd}_${dishItem.id}`
      setDishRepeatSettings(prev => ({
        ...prev,
        [key]: getDishRepeatCheckEnabled(dateStr, dishItem.id)
      }))
      // 保存重复判断设置
      setDishRepeatCheckEnabled(dateStr, dishItem.id, true)
    }

    // 回调更新父组件
    onMealSelect(newMeals)

    // 使用新的菜单数据立即更新所有菜品在15天范围内的重复状态
    updateRepeatStatusForAllDishes(newMeals)

    // 同时更新菜品选择器的重复状态（使用已保存的新数据）
    if (showDishList) {
      const allDishesStatus = calculateAllDishesRepeatStatus(newMeals)
      setDishSelectorRepeatStatus(allDishesStatus)
    }
  }

  const handleRemoveDish = (mealType, dishId) => {
    const newMeals = {
      ...tempSelectedDishes,
      [mealType]: tempSelectedDishes[mealType].filter(d => d.id !== dishId)
    }

    // 立即更新本地状态
    setTempSelectedDishes(newMeals)

    // 立即保存数据
    saveMealData(date, newMeals)

    // 移除该菜品的重复判断设置
    const key = `${mealType}_${dishId}`
    const newSettings = { ...dishRepeatSettings }
    delete newSettings[key]
    setDishRepeatSettings(newSettings)

    // 回调更新父组件
    onMealSelect(newMeals)

    // 使用新的菜单数据立即更新所有菜品在15天范围内的重复状态
    updateRepeatStatusForAllDishes(newMeals)

    // 同时更新菜品选择器的重复状态（使用已保存的新数据）
    if (showDishList) {
      const allDishesStatus = calculateAllDishesRepeatStatus(newMeals)
      setDishSelectorRepeatStatus(allDishesStatus)
    }
  }

  const handleToggleDishRepeat = (mealType, dishId) => {
    const key = `${mealType}_${dishId}`
    const newEnabled = !dishRepeatSettings[key]

    setDishRepeatSettings(prev => ({
      ...prev,
      [key]: newEnabled
    }))

    // 保存重复判断设置
    setDishRepeatCheckEnabled(dateStr, dishId, newEnabled)

    // 更新所有菜品在15天范围内的重��状态
    const mealsDataForMonth = getDateDishes(date)
    updateRepeatStatusForAllDishes(mealsDataForMonth)

    // 同时更新菜品选择器的重复状态
    if (showDishList) {
      const allDishesStatus = calculateAllDishesRepeatStatus(mealsDataForMonth)
      setDishSelectorRepeatStatus(allDishesStatus)
    }
  }

  return (
    <div className="day-selector-overlay" onClick={onClose}>
      <div className="day-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{format(date, 'M月d日 EEEE', { locale: zhCN })}</h3>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 午餐区块 */}
          <div className="meal-section">
            <h4 className="meal-title">🍴 午餐</h4>
            <div className="selected-dishes-list">
              {tempSelectedDishes.lunch.length > 0 ? (
                tempSelectedDishes.lunch.map(dish => {
                  const key = `lunch_${dish.id}`
                  const repeatEnabled = dishRepeatSettings[key] !== false
                  const isRepeated = currentRepeatStatus[dish.id]

                  return (
                    <div key={key} className={`dish-tag-wrapper ${isRepeated && repeatEnabled ? 'repeated' : ''}`}>
                      <span className="dish-tag-content">
                        {dish.title}
                      </span>
                      <div className="dish-tag-actions">
                        <button
                          className={`repeat-check ${repeatEnabled ? 'enabled' : 'disabled'}`}
                          onClick={() => handleToggleDishRepeat('lunch', dish.id)}
                          title={repeatEnabled ? '不参与重复判断' : '参与重复判断'}
                        >
                          {repeatEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveDish('lunch', dish.id)}
                          title="删除菜品"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="empty-text">未选择菜品</p>
              )}
            </div>
            <button
              className="add-dish-btn"
              onClick={() => openDishSelector('lunch')}
            >
              <Plus size={16} /> 添加菜品
            </button>
          </div>

          {/* 晚餐区块 */}
          <div className="meal-section">
            <h4 className="meal-title">🍽️ 晚餐</h4>
            <div className="selected-dishes-list">
              {tempSelectedDishes.dinner.length > 0 ? (
                tempSelectedDishes.dinner.map(dish => {
                  const key = `dinner_${dish.id}`
                  const repeatEnabled = dishRepeatSettings[key] !== false
                  const isRepeated = currentRepeatStatus[dish.id]

                  return (
                    <div key={key} className={`dish-tag-wrapper ${isRepeated && repeatEnabled ? 'repeated' : ''}`}>
                      <span className="dish-tag-content">
                        {dish.title}
                      </span>
                      <div className="dish-tag-actions">
                        <button
                          className={`repeat-check ${repeatEnabled ? 'enabled' : 'disabled'}`}
                          onClick={() => handleToggleDishRepeat('dinner', dish.id)}
                          title={repeatEnabled ? '不参与重复判断' : '参与重复判断'}
                        >
                          {repeatEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveDish('dinner', dish.id)}
                          title="删除菜品"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="empty-text">未选择菜品</p>
              )}
            </div>
            <button
              className="add-dish-btn"
              onClick={() => openDishSelector('dinner')}
            >
              <Plus size={16} /> 添加菜品
            </button>
          </div>
        </div>

        {/* 移除模态框页脚，不要保存按钮 */}
      </div>

      {/* 菜品选择弹框 */}
      {showDishList && (
        <DishSelectorOverlay
          selectedMealType={selectedMealTypeForAdd}
          categories={categories}
          dishes={dishes}
          selectedDishes={tempSelectedDishes[selectedMealTypeForAdd]}
          dishSelectorRepeatStatus={dishSelectorRepeatStatus}
          onToggleDish={handleToggleDish}
          onClose={() => setShowDishList(false)}
        />
      )}
    </div>
  )
}

// 菜品选择组件
const DishSelectorOverlay = ({ selectedMealType, categories, dishes, selectedDishes, dishSelectorRepeatStatus, onToggleDish, onClose }) => {
  const dishsByCategory = categories.map(cat => ({
    category: cat,
    dishes: dishes.filter(d => d.kind_id === cat.id)
  }))

  return (
    <div className="dish-selector-modal-overlay" onClick={onClose}>
      <div className="dish-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dish-selector-header">
          <h3>选择菜品 ({selectedMealType === 'lunch' ? '午餐' : '晚餐'})</h3>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="dish-selector-content">
          {/* 分类栏显示所有菜品 */}
          {dishsByCategory.map(({ category, dishes: categoryItems }) => (
            <div key={category.id} className="dish-category-section">
              <h4 className="category-title">{category.title}</h4>
              <div className="dishes-grid">
                {categoryItems.map(dish => {
                  const isSelected = selectedDishes.some(d => d.id === dish.id)
                  const isRepeated = dishSelectorRepeatStatus[dish.id]

                  return (
                    <button
                      key={dish.id}
                      className={`dish-cell ${isSelected ? 'selected' : ''} ${isRepeated ? 'repeated' : ''}`}
                      onClick={() => onToggleDish(dish)}
                      title={isRepeated ? '该菜品最近7天内有重复' : ''}
                    >
                      <span className="dish-cell-name">{dish.title}</span>
                      {isSelected && (
                        <span className="dish-cell-check">
                          <Check size={16} />
                        </span>
                      )}
                      {isRepeated && (
                        <span className="dish-cell-repeated" title="重复菜品">⚠️</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="dish-selector-footer">
          <button onClick={onClose} className="close-selector-btn">完成</button>
        </div>
      </div>
    </div>
  )
}

export default DayMealSelector