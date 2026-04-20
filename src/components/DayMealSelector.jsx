import React, { useState, useEffect } from 'react'
import { X, Plus, Check, Eye, EyeOff } from 'lucide-react'
import '../styles/DayMealSelector.css'
import { useStore } from '../contexts/store'
import { store } from '../store'
import { observer, useLocalObservable } from 'mobx-react'
import { createRecord, destryRecord } from '../apis'

const DayMealSelector = observer(({ date, onChange, onClose }) => {
  const dishes = store.dishes;
  const local = useLocalObservable(() => ({
    showDishList: false,
    type: '',
    todayDishes: [],
    get lunch() {
      return this.todayDishes.filter(d => d.type === 'lunch')
    },
    get dinner() {
      return this.todayDishes.filter(d => d.type === 'dinner')
    },
    setTodayDishes(data) {
      this.todayDishes = data;
    },
    addRecord(record) {
      this.todayDishes.push(record)
      store.addDateRecord(record)
      onChange()
    },
    removeRecord(id) {
      const idx = this.todayDishes.findIndex(d => d.id === id)
      if (idx !== -1) {
        store.removeDateRecord(this.todayDishes[idx])
        this.todayDishes.splice(idx, 1)
        onChange()
      }
    },
    toggleDishRepeat(id) {
      const item = this.todayDishes.find(d => d.id === id)
      if (item) {
        item.can_repeated = !item.can_repeated
      }
    },
    openDishSelector(type) {
      local.type = type;
      local.showDishList = true;
    },
    closeDishSelector() {
      local.showDishList = false;
      local.type = '';
    }
  }))
  useEffect(() => {
    const dishes = store.getDateList(date)
    local.setTodayDishes(dishes)
  }, [])

  const handleRemoveDish = async (id) => {
    await destryRecord(id)
    local.removeRecord(id)
  }

  const handleToggleDishRepeat = (id) => {
    local.toggleDishRepeat(id)
  }
  const handleToggleDish = async (dish_id, post_or_delete) => {
    const record = local.todayDishes.find(d => d.dish_id === dish_id);
    console.log(post_or_delete, dish_id, record)
    if (record) {
      await destryRecord(record.id)
      local.removeRecord(record.id)
    } else {
      const result = await createRecord({ dish_id, date, type: local.type })
      local.addRecord(result.data.info)
    }
  }
  return (
    <div className="day-selector-overlay" onClick={onClose}>
      <div className="day-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{date}</h3>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 午餐区块 */}
          <div className="meal-section">
            <h4 className="meal-title">🍴 午餐</h4>
            <div className="selected-dishes-list">
              {local.lunch.length > 0 ? (
                local.lunch.map(dish => {
                  const key = `lunch_${dish.id}`
                  return (
                    <div key={key} className={`dish-tag-wrapper ${dish.repeated ? 'repeated' : ''}`}>
                      <span className="dish-tag-content">
                        {dish.dish.title}
                      </span>
                      <div className="dish-tag-actions">
                        <button
                          className={`repeat-check ${dish.can_repeated ? 'enabled' : 'disabled'}`}
                          onClick={() => {
                            handleToggleDishRepeat(dish.id)
                          }}
                          title={dish.can_repeated ? '不参与重复判断' : '参与重复判断'}
                        >
                          {dish.can_repeated ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveDish(dish.id)}
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
              onClick={() => local.openDishSelector('lunch')}
            >
              <Plus size={16} /> 添加菜品
            </button>
          </div>

          {/* 晚餐区块 */}
          <div className="meal-section">
            <h4 className="meal-title">🍽️ 晚餐</h4>
            <div className="selected-dishes-list">
              {local.dinner.length > 0 ? (
                local.dinner.map(dish => {
                  const key = `dinner_${dish.id}`
                  return (
                    <div key={key} className={`dish-tag-wrapper ${dish.repeated ? 'repeated' : ''}`}>
                      <span className="dish-tag-content">
                        {dish.dish.title}
                      </span>
                      <div className="dish-tag-actions">
                        <button
                          className={`repeat-check ${dish.can_repeated ? 'enabled' : 'disabled'}`}
                          onClick={() => handleToggleDishRepeat(dish.id)}
                          title={dish.can_repeated ? '不参与重复判断' : '参与重复判断'}
                        >
                          {dish.can_repeated ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveDish(dish.id)}
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
              onClick={() => local.openDishSelector('dinner')}
            >
              <Plus size={16} /> 添加菜品
            </button>
          </div>
        </div>

        {/* 移除模态框页脚，不要保存按钮 */}
      </div>

      {/* 菜品选择弹框 */}
      {local.showDishList && (
        <DishSelectorOverlay
          categories={store.kinds}
          dishes={dishes}
          selectedDishes={local.todayDishes}
          onToggleDish={handleToggleDish}
          onClose={() => local.closeDishSelector(false)}
        />
      )}
    </div>
  )
})

// 菜品选择组件
const DishSelectorOverlay = observer(({ selectedDishes, onToggleDish, onClose }) => {
  const store = useStore()
  const dishsByCategory = store.kinds.map(kind => {
    return {
      kind,
      dishes: store.dishes.filter(d => d.kind_id === kind.id)
    }
  })
  return (
    <div className="dish-selector-modal-overlay" onClick={onClose}>
      <div className="dish-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dish-selector-header">
          <h3>选择菜品 </h3>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="dish-selector-content">
          {/* 分类栏显示所有菜品 */}
          {dishsByCategory.map(({ kind, dishes }) => (
            <div key={kind.id} className="dish-category-section">
              <h4 className="category-title">{kind.title}</h4>
              <div className="dishes-grid">
                {dishes.map(dish => {
                  const isSelected = selectedDishes.findIndex(d => d.dish_id === dish.id) !== -1
                  const isRepeated = dish.repeated
                  return (
                    <button
                      key={dish.id}
                      className={`dish-cell ${isSelected ? 'selected' : ''} ${isRepeated ? 'repeated' : ''}`}
                      onClick={() => onToggleDish(dish.id, !isSelected)}
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
})

export default DayMealSelector