import React, { useState, useEffect } from 'react'
import { format, subDays, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { X, Plus, Check, Eye, EyeOff } from 'lucide-react'
import { getDishRepeatCheckEnabled, setDishRepeatCheckEnabled, getMealData, saveMealData, getStorageKey } from '../utils/storage'
import '../styles/DayMealSelector.css'

const DayMealSelector = ({ date, meals, dishes, repeatStatus, onMealSelect, onClose }) => {
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
  
  const dateStr = format(date, 'yyyy-MM-dd')
  const [showDishList, setShowDishList] = useState(false)
  const [selectedMealTypeForAdd, setSelectedMealTypeForAdd] = useState('lunch')

  const categories = [...new Set(dishes.map(d => d.categoryId))].filter(Boolean).map(catId => {
    const firstDish = dishes.find(d => d.categoryId === catId)
    return { id: catId, title: firstDish?.categoryTitle }
  })

  const handleToggleDish = (dishItem) => {
    setTempSelectedDishes(prev => {
      const mealDishes = prev[selectedMealTypeForAdd] || []
      const exists = mealDishes.some(d => d.id === dishItem.id)
      
      const newMeals = {
        ...prev,
        [selectedMealTypeForAdd]: exists 
          ? mealDishes.filter(d => d.id !== dishItem.id)
          : [...mealDishes, dishItem]
      }

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
      
      return newMeals
    })
  }

  const handleRemoveDish = (mealType, dishId) => {
    setTempSelectedDishes(prev => {
      const newMeals = {
        ...prev,
        [mealType]: prev[mealType].filter(d => d.id !== dishId)
      }
      
      // 立即保存数据
      saveMealData(date, newMeals)
      
      // 移除该菜品的重复判断设置
      const key = `${mealType}_${dishId}`
      const newSettings = { ...dishRepeatSettings }
      delete newSettings[key]
      setDishRepeatSettings(newSettings)

      // 回调更新父组件
      onMealSelect(newMeals)
      
      return newMeals
    })
  }

  const handleToggleDishRepeat = (mealType, dishId) => {
    const key = `${mealType}_${dishId}`
    setDishRepeatSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    // 保存���复判断设置
    setDishRepeatCheckEnabled(dateStr, dishId, !dishRepeatSettings[key])
  }

  const openDishSelector = (mealType) => {
    setSelectedMealTypeForAdd(mealType)
    setShowDishList(true)
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
                  const isRepeated = repeatStatus.lunch[dish.id]
                  
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
                  const isRepeated = repeatStatus.dinner[dish.id]
                  
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
          onToggleDish={handleToggleDish}
          onClose={() => setShowDishList(false)}
        />
      )}
    </div>
  )
}

// 菜品选择组件
const DishSelectorOverlay = ({ selectedMealType, categories, dishes, selectedDishes, onToggleDish, onClose }) => {
  const dishsByCategory = categories.map(cat => ({
    category: cat,
    dishes: dishes.filter(d => d.categoryId === cat.id)
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
                  
                  return (
                    <button
                      key={dish.id}
                      className={`dish-cell ${isSelected ? 'selected' : ''}`}
                      onClick={() => onToggleDish(dish)}
                    >
                      <span className="dish-cell-name">{dish.title}</span>
                      {isSelected && (
                        <span className="dish-cell-check">
                          <Check size={16} />
                        </span>
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