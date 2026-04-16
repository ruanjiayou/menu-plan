import React, { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { X } from 'lucide-react'
import '../styles/DayMealSelector.css'

const DayMealSelector = ({ date, meals, dishes, isDishRepeatedInWeek, onMealSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedMealType, setSelectedMealType] = useState('lunch')
  const [tempSelectedDishes, setTempSelectedDishes] = useState({
    lunch: meals.lunch || [],
    dinner: meals.dinner || []
  })

  const categories = [...new Set(dishes.map(d => d.category))].filter(Boolean)
  const currentCategoryDishes = selectedCategory 
    ? dishes.filter(d => d.category === selectedCategory) 
    : []

  const handleDishToggle = (dishName) => {
    setTempSelectedDishes(prev => {
      const mealDishes = prev[selectedMealType] || []
      const newDishes = mealDishes.includes(dishName)
        ? mealDishes.filter(d => d !== dishName)
        : [...mealDishes, dishName]
      
      return {
        ...prev,
        [selectedMealType]: newDishes
      }
    })
  }

  const handleSave = () => {
    onMealSelect(selectedMealType, tempSelectedDishes[selectedMealType])
    if (selectedMealType === 'lunch') {
      setSelectedMealType('dinner')
    } else {
      onClose()
    }
  }

  const handleSaveAll = () => {
    onMealSelect('lunch', tempSelectedDishes.lunch)
    onMealSelect('dinner', tempSelectedDishes.dinner)
    onClose()
  }

  const isLunchEmpty = !tempSelectedDishes.lunch || tempSelectedDishes.lunch.length === 0
  const isDinnerEmpty = !tempSelectedDishes.dinner || tempSelectedDishes.dinner.length === 0

  return (
    <div className="day-selector-overlay" onClick={onClose}>
      <div className="day-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{format(date, 'M月d日 EEEE', { locale: zhCN })}</h3>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="meal-type-tabs">
          <button
            className={`meal-tab ${selectedMealType === 'lunch' ? 'active' : ''}`}
            onClick={() => setSelectedMealType('lunch')}
          >
            🍴 午餐
            {!isLunchEmpty && <span className="count">{tempSelectedDishes.lunch.length}</span>}
          </button>
          <button
            className={`meal-tab ${selectedMealType === 'dinner' ? 'active' : ''}`}
            onClick={() => setSelectedMealType('dinner')}
          >
            🍽️ 晚餐
            {!isDinnerEmpty && <span className="count">{tempSelectedDishes.dinner.length}</span>}
          </button>
        </div>

        <div className="selector-content">
          <div className="categories-section">
            <h4>菜品分类</h4>
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
            <h4>{selectedCategory ? `${selectedCategory}菜品` : '选择分类'}</h4>
            <div className="dishes-list">
              {currentCategoryDishes.map(dish => {
                const isSelected = tempSelectedDishes[selectedMealType].includes(dish.name)
                const isRepeated = isDishRepeatedInWeek(dish.name)
                
                return (
                  <label 
                    key={dish.name} 
                    className={`dish-item ${isSelected ? 'selected' : ''} ${isRepeated ? 'repeated' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleDishToggle(dish.name)}
                    />
                    <span className="dish-name">{dish.name}</span>
                    {isRepeated && <span className="repeated-badge">重复⚠️</span>}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="selected-dishes">
            <h4>已选菜品</h4>
            <div className="selected-list">
              {tempSelectedDishes[selectedMealType].length > 0 ? (
                tempSelectedDishes[selectedMealType].map(dish => (
                  <span key={dish} className="selected-tag">
                    {dish}
                    <button onClick={() => handleDishToggle(dish)}>×</button>
                  </span>
                ))
              ) : (
                <p className="empty-text">未选择菜品</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">取消</button>
          <button onClick={handleSaveAll} className="save-all-button">保存全部</button>
        </div>
      </div>
    </div>
  )
}

export default DayMealSelector