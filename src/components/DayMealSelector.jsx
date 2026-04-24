import { X, Plus, Check, Eye, EyeOff } from 'lucide-react'
import '../styles/DayMealSelector.css'
import { useStore } from '../contexts/store'
import store from '../store'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { createRecord, destryRecord } from '../apis'
import { v7 } from 'uuid'
import { toJS } from 'mobx'

const DayMealSelector = observer(({ date, onChange, onClose }) => {
  const dishes = store.dishes;
  const local = useLocalObservable(() => ({
    showDishList: false,
    type: '',
    get todayDishes() {
      return store.getDateRecords(date)
    },
    get lunch() {
      return this.todayDishes.filter(d => d.type === 'lunch')
    },
    get dinner() {
      return this.todayDishes.filter(d => d.type === 'dinner')
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
  const handleRemoveDish = async (record) => {
    store.removeDateRecord(record)
    destryRecord(record.id)
  }

  const handleToggleDishRepeat = (id) => {
    local.toggleDishRepeat(id)
  }
  const handleToggleDish = async (dish) => {
    const record = local.todayDishes.find(d => d.dish_id === dish.id);
    if (record) {
      store.removeDateRecord(toJS(record))
      destryRecord(record.id)
    } else {
      const id = v7()
      const data = { id, dish_id: dish.id, date, type: local.type, can_repeated: 0, sn: 1, time: new Date() }
      store.addDateRecord({ ...data, dish })
      createRecord(data)
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
                          onClick={() => handleRemoveDish(toJS(dish))}
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
                          onClick={() => handleRemoveDish(toJS(dish))}
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
          date={date}
          onToggleDish={handleToggleDish}
          onClose={() => local.closeDishSelector(false)}
        />
      )}
    </div>
  )
})

// 菜品选择组件
const DishSelectorOverlay = observer(({ date, onToggleDish, onClose }) => {
  const store = useStore()
  const selectedDishes = store.getDateRecords(date)
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
                      onClick={() => onToggleDish(toJS(dish), !isSelected)}
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