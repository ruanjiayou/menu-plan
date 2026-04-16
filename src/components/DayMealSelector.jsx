import React, { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { X, Plus, Eye, EyeOff } from 'lucide-react'
import { getRepeatCheckEnabled, setRepeatCheckEnabled } from '../utils/storage'
import '../styles/DayMealSelector.css'

const DayMealSelector = ({ date, meals, dishes, isDishRepeatedInWeek, onMealSelect, onClose }) => {
  const [tempSelectedDishes, setTempSelectedDishes] = useState({
    lunch: meals.lunch || [],
    dinner: meals.dinner || []
  })
  
  const dateStr = format(date, 'yyyy-MM-dd')
  const [lunchRepeatEnabled, setLunchRepeatEnabled] = useState(() => getRepeatCheckEnabled(dateStr, 'lunch'))
  const [dinnerRepeatEnabled, setDinnerRepeatEnabled] = useState(() => getRepeatCheckEnabled(dateStr, 'dinner'))
  
  const [showDishList, setShowDishList] = useState(false)
  const [selectedMealTypeForAdd, setSelectedMealTypeForAdd] = useState('lunch')
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categories = [...new Set(dishes.map(d => d.category))].filter(Boolean)
  const currentCategoryDishes = selectedCategory 
    ? dishes.filter(d => d.category === selectedCategory) 
    : []

  const handleAddDish = (dishName) => {
    setTempSelectedDishes(prev => {
      const mealDishes = prev[selectedMealTypeForAdd] || []
      if (!mealDishes.includes(dishName)) {
        return {
          ...prev,
          [selectedMealTypeForAdd]: [...mealDishes, dishName]
        }
      }
      return prev
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
    setRepeatCheckEnabled(dateStr, 'lunch', newState)
  }

  const handleToggleDinnerRepeat = () => {
    const newState = !dinnerRepeatEnabled
    setDinnerRepeatEnabled(newState)
    setRepeatCheckEnabled(dateStr, 'dinner', newState)
  }

  const handleSaveAll = () => {
    onMealSelect({
      lunch: tempSelectedDishes.lunch,
      dinner: tempSelectedDishes.dinner
    })
    onClose()
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
              onClick={() => {
                setSelectedMealTypeForAdd('lunch')
                setShowDishList(!showDishList)
              }}
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
              onClick={() => {
                setSelectedMealTypeForAdd('dinner')
                setShowDishList(!showDishList)
              }}
            >
              <Plus size={16} /> 添加菜品
            </button>
          </div>

          {/* 菜品列表 */}
          {showDishList && (
            <div className="dish-selector-section">
              <h4>选择菜品 ({selectedMealTypeForAdd === 'lunch' ? '午餐' : '晚餐'})</h4>
              
              <div className="categories-section">
                <h5>分类</h5>
                <div className="categories-list">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`category-button ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="dishes-section">
                <h5>{selectedCategory ? `${selectedCategory}菜品` : '选择分类'}</h5>
                <div className="dishes-list">
                  {currentCategoryDishes.map(dish => {
                    const isAlreadySelected = tempSelectedDishes[selectedMealTypeForAdd].includes(dish.name)
                    const mealRepeatEnabled = selectedMealTypeForAdd === 'lunch' ? lunchRepeatEnabled : dinnerRepeatEnabled
                    const isRepeated = mealRepeatEnabled && isDishRepeatedInWeek(dish.name)
                    
                    return (
                      <div 
                        key={dish.name}
                        className={`dish-item ${isRepeated ? 'repeated' : ''}`}
                      >
                        <div className="dish-info">
                          <span className="dish-name">{dish.name}</span>
                          {isRepeated && <span className="repeated-badge">重复⚠️</span>}
                        </div>
                        <button
                          className={`add-btn ${isAlreadySelected ? 'added' : ''}`}
                          onClick={() => handleAddDish(dish.name)}
                          disabled={isAlreadySelected}
                        >
                          {isAlreadySelected ? '✓' : '+'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button 
                className="close-selector-btn"
                onClick={() => setShowDishList(false)}
              >
                关闭选择
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">取消</button>
          <button onClick={handleSaveAll} className="save-button">保存</button>
        </div>
      </div>
    </div>
  )
}

export default DayMealSelector