import React, { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { X, Plus, Eye, EyeOff, Check } from 'lucide-react'
import { getDishRepeatCheckEnabled, setDishRepeatCheckEnabled } from '../utils/storage'
import '../styles/DayMealSelector.css'

const DayMealSelector = ({ date, meals, dishes, isDishRepeatedInWeek, onMealSelect, onClose }) => {
  const [tempSelectedDishes, setTempSelectedDishes] = useState({
    lunch: meals.lunch || [],
    dinner: meals.dinner || []
  })
  
  const dateStr = format(date, 'yyyy-MM-dd')
  const [lunchRepeatEnabled, setLunchRepeatEnabled] = useState(() => getDishRepeatCheckEnabled('lunch'))
  const [dinnerRepeatEnabled, setDinnerRepeatEnabled] = useState(() => getDishRepeatCheckEnabled('dinner'))
  
  const [showDishList, setShowDishList] = useState(false)
  const [selectedMealTypeForAdd, setSelectedMealTypeForAdd] = useState('lunch')

  const categories = [...new Set(dishes.map(d => d.category))].filter(Boolean)

  const handleToggleDish = (dishName) => {
    setTempSelectedDishes(prev => {
      const mealDishes = prev[selectedMealTypeForAdd] || []
      const exists = mealDishes.includes(dishName)
      
      return {
        ...prev,
        [selectedMealTypeForAdd]: exists 
          ? mealDishes.filter(d => d !== dishName)
          : [...mealDishes, dishName]
      }
    })
  }

  const handleRemoveDish = (mealType, dishName) => {
    setTempSelectedDishes(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter(d => d !== dishName)
    }))
  }

  const handleToggleLunchRepeat = () => {
    const newState = !lunchRepeatEnabled
    setLunchRepeatEnabled(newState)
    setDishRepeatCheckEnabled('lunch', newState)
  }

  const handleToggleDinnerRepeat = () => {
    const newState = !dinnerRepeatEnabled
    setDinnerRepeatEnabled(newState)
    setDishRepeatCheckEnabled('dinner', newState)
  }

  const handleSaveAll = () => {
    onMealSelect({
      lunch: tempSelectedDishes.lunch,
      dinner: tempSelectedDishes.dinner
    })
    onClose()
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
            <div className="meal-title-row">
              <h4 className="meal-title">🍴 午餐</h4>
              <button 
                className={`repeat-toggle ${lunchRepeatEnabled ? 'enabled' : 'disabled'}`}
                onClick={handleToggleLunchRepeat}
                title={lunchRepeatEnabled ? '取消重复判断' : '启用重复判断'}
              >
                {lunchRepeatEnabled ? (
                  <>
                    <Eye size={14} /> 参与判断
                  </>
                ) : (
                  <>
                    <EyeOff size={14} /> 不参与
                  </>
                )}
              </button>
            </div>
            <div className="selected-dishes-list">
              {tempSelectedDishes.lunch.length > 0 ? (
                tempSelectedDishes.lunch.map(dish => (
                  <span 
                    key={`lunch-${dish}`} 
                    className={`dish-tag ${lunchRepeatEnabled && isDishRepeatedInWeek(dish) ? 'repeated' : ''}`}
                  >
                    {dish}
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveDish('lunch', dish)}
                    >
                      ×
                    </button>
                  </span>
                ))
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
            <div className="meal-title-row">
              <h4 className="meal-title">🍽️ 晚餐</h4>
              <button 
                className={`repeat-toggle ${dinnerRepeatEnabled ? 'enabled' : 'disabled'}`}
                onClick={handleToggleDinnerRepeat}
                title={dinnerRepeatEnabled ? '取消重复判断' : '启用重复判断'}
              >
                {dinnerRepeatEnabled ? (
                  <>
                    <Eye size={14} /> 参与判断
                  </>
                ) : (
                  <>
                    <EyeOff size={14} /> 不参与
                  </>
                )}
              </button>
            </div>
            <div className="selected-dishes-list">
              {tempSelectedDishes.dinner.length > 0 ? (
                tempSelectedDishes.dinner.map(dish => (
                  <span 
                    key={`dinner-${dish}`} 
                    className={`dish-tag ${dinnerRepeatEnabled && isDishRepeatedInWeek(dish) ? 'repeated' : ''}`}
                  >
                    {dish}
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveDish('dinner', dish)}
                    >
                      ×
                    </button>
                  </span>
                ))
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

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">取消</button>
          <button onClick={handleSaveAll} className="save-button">保存</button>
        </div>
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
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categoryDishes = selectedCategory 
    ? dishes.filter(d => d.category === selectedCategory)
    : []

  const dishsByCategory = categories.map(cat => ({
    category: cat,
    dishes: dishes.filter(d => d.category === cat)
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
            <div key={category} className="dish-category-section">
              <h4 className="category-title">{category}</h4>
              <div className="dishes-grid">
                {categoryItems.map(dish => {
                  const isSelected = selectedDishes.includes(dish.name)
                  
                  return (
                    <button
                      key={dish.name}
                      className={`dish-cell ${isSelected ? 'selected' : ''}`}
                      onClick={() => onToggleDish(dish.name)}
                    >
                      <span className="dish-cell-name">{dish.name}</span>
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