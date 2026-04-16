import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getStorageKey, getMealData, saveMealData, getDishesData } from '../utils/storage'
import DayMealSelector from './DayMealSelector'
import '../styles/MealPlanner.css'

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meals, setMeals] = useState({})
  const [dishes, setDishes] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  // 初始化加载数据
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

  const handleMealSelect = (date, mealType, selectedDishes) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const newMeals = { ...meals }
    
    if (!newMeals[dateStr]) {
      newMeals[dateStr] = {}
    }
    
    newMeals[dateStr][mealType] = selectedDishes
    setMeals(newMeals)
    saveMealData(currentDate, newMeals)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // 检查菜品是否在最近7天重复
  const isDishRepeatedInWeek = (date, dishName) => {
    const sevenDaysAgo = subDays(date, 7)
    let count = 0

    for (let i = 0; i < 7; i++) {
      const checkDate = subDays(date, i)
      if (checkDate >= sevenDaysAgo && checkDate < date) {
        const dateStr = format(checkDate, 'yyyy-MM-dd')
        const dayMeals = meals[dateStr] || {}
        
        const lunch = dayMeals.lunch || []
        const dinner = dayMeals.dinner || []
        
        if (lunch.includes(dishName) || dinner.includes(dishName)) {
          count++
        }
      }
    }

    return count > 0 && count <= 6 // 不算今天，如果在前6天有重复就标记黄色
  }

  // 获取日历天数
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
          {daysInMonth.map(day => (
            <div 
              key={day.toISOString()}
              className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="day-number">{format(day, 'd')}</div>
              <div className="day-meals">
                {meals[format(day, 'yyyy-MM-dd')]?.lunch && (
                  <div className="meal-badge lunch">午</div>
                )}
                {meals[format(day, 'yyyy-MM-dd')]?.dinner && (
                  <div className="meal-badge dinner">晚</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDay && (
        <DayMealSelector
          date={selectedDay}
          meals={meals[format(selectedDay, 'yyyy-MM-dd')] || {}}
          dishes={dishes}
          isDishRepeatedInWeek={(dishName) => isDishRepeatedInWeek(selectedDay, dishName)}
          onMealSelect={(mealType, selectedDishes) => handleMealSelect(selectedDay, mealType, selectedDishes)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

export default MealPlanner