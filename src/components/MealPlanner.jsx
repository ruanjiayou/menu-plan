import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getStorageKey, getMealData, saveMealData, getDishesData, getDishRepeatCheckEnabled } from '../utils/storage'
import DayMealSelector from './DayMealSelector'
import '../styles/MealPlanner.css'

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meals, setMeals] = useState({})
  const [dishes, setDishes] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    loadMealsData()
    loadDishes()
  }, [currentDate])

  const loadMealsData = () => {
    const data = getMealData(currentDate)
    setMeals(data)
  }

  const loadDishes = () => {
    const dishesData = getDishesData()
    setDishes(dishesData)
  }

  const handleMealSelect = (date, mealData) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const newMeals = { ...meals }
    
    if (!newMeals[dateStr]) {
      newMeals[dateStr] = {}
    }
    
    newMeals[dateStr] = mealData
    setMeals(newMeals)
    saveMealData(currentDate, newMeals)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // 检查菜品是否在最近7天重复（按菜品来判断，不按午晚餐）
  const isDishRepeatedInWeek = (date, dishName) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // 如果该菜品没有启用重复判断，则不标记为重复
    if (!getDishRepeatCheckEnabled(dishName)) {
      return false
    }

    let foundCount = 0

    for (let i = 0; i <= 7; i++) {
      const checkDate = subDays(date, i)
      const checkDateStr = format(checkDate, 'yyyy-MM-dd')
      const dayMeals = meals[checkDateStr] || {}
      
      // 检查午餐和晚餐中是否包含这个菜品
      const lunch = dayMeals.lunch || []
      const dinner = dayMeals.dinner || []
      
      if (lunch.includes(dishName) || dinner.includes(dishName)) {
        foundCount++
      }
    }

    // 如果在过去7天（包括今天）中出现超过1次，则标记为重复
    return foundCount > 1
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  return (
    <div className="meal-planner">
      <div className="planner-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <ChevronLeft size={20} />
        </button>
        <h2>{format(currentDate, 'yyyy年 M月')}</h2>
        <button onClick={handleNextMonth} className="nav-button">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayMeals = meals[dateStr] || {}
            const lunch = dayMeals.lunch || []
            const dinner = dayMeals.dinner || []

            return (
              <div 
                key={day.toISOString()}
                className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                
                {/* 午餐区块 */}
                <div className="meal-block lunch-block">
                  <div className="meal-label">午</div>
                  <div className="meal-dishes">
                    {lunch.map(dish => (
                      <span 
                        key={dish}
                        className={`dish-tag ${isDishRepeatedInWeek(day, dish) ? 'repeated' : ''}`}
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 晚餐区块 */}
                <div className="meal-block dinner-block">
                  <div className="meal-label">晚</div>
                  <div className="meal-dishes">
                    {dinner.map(dish => (
                      <span 
                        key={dish}
                        className={`dish-tag ${isDishRepeatedInWeek(day, dish) ? 'repeated' : ''}`}
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <DayMealSelector
          date={selectedDay}
          meals={meals[format(selectedDay, 'yyyy-MM-dd')] || {}}
          dishes={dishes}
          isDishRepeatedInWeek={(dishName) => isDishRepeatedInWeek(selectedDay, dishName)}
          onMealSelect={(mealData) => handleMealSelect(selectedDay, mealData)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

export default MealPlanner