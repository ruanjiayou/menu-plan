import { X, Plus, Check, Eye, EyeOff } from 'lucide-react'
import { createRecord, destryRecord } from '../apis'
import { v7 } from 'uuid'
import global, { useLocalProxy } from '../global'
import { useSnapshot } from 'valtio'
import { Button, Mask, Modal, ModalHeader, ModalContent, ModalFooter } from '../styles/common';
import {
  MealSection,
  MealTitle,
  SelectedDishesList,
  DishTagWrapper,
  DishTagContent,
  DishTagActions,
  RepeatCheck,
  EmptyText,
  DishesGrid,
  CategoryTitle,
  DishCell,
  DishCellChecked,
  DishCellRepeated
} from '../styles/DayMealSelector'

const DayMealSelector = ({ date, onChange, onClose }) => {
  const store = useSnapshot(global)

  const todayDishes = store.getDateRecords(date) || []
  const lunchDishes = todayDishes.filter(d => d.type === 'lunch')
  const dinnerDishes = todayDishes.filter(d => d.type === 'dinner')

  const [localState, localProxy] = useLocalProxy({
    showDishList: false,
    type: '',
    date,
    // toggleDishRepeat(id) {
    //   const item = this.todayDishes.find(d => d.id === id)
    //   if (item) {
    //     item.can_repeated = !item.can_repeated
    //   }
    // },
    openDishes(type) {
      this.type = type
      this.showDishList = true;
    },
    closeDishes() {
      this.type = ''
      this.showDishList = false;
    },
  });

  const handleRemoveDish = async (record) => {
    global.removeDateRecord(record)
    destryRecord(record.id)
  }

  const handleToggleDishRepeat = (id) => {
    // localProxy.toggleDishRepeat(id)
  }
  const handleToggleDish = async (dish) => {
    const record = todayDishes.find(d => d.dish_id === dish.id);
    if (record) {
      global.removeDateRecord(record)
      destryRecord(record.id)
    } else {
      const id = v7()
      const data = { id, dish_id: dish.id, date, type: localState.type, can_repeated: 0, sn: 1, time: new Date() }
      global.addDateRecord({ ...data, dish })
      createRecord(data)
    }
  }
  return (
    <Mask onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{date}</h3>
          <div onClick={onClose}>
            <X size={24} />
          </div>
        </ModalHeader>

        <ModalContent>
          {/* 午餐区块 */}
          <MealSection style={{ marginBottom: 20 }}>
            <MealTitle>🍴 午餐</MealTitle>
            <SelectedDishesList>
              {lunchDishes.length > 0 ? (
                lunchDishes.map(dish => {
                  const key = `lunch_${dish.id}`
                  return (
                    <DishTagWrapper key={key} className={`${dish.repeated ? 'repeated' : ''}`}>
                      <DishTagContent>
                        {dish.dish.title}
                      </DishTagContent>
                      <DishTagActions>
                        <RepeatCheck
                          className={`${dish.can_repeated ? 'enabled' : 'disabled'}`}
                          onClick={() => {
                            handleToggleDishRepeat(dish.id)
                          }}
                          title={dish.can_repeated ? '不参与重复判断' : '参与重复判断'}
                        >
                          {dish.can_repeated ? <Eye size={12} /> : <EyeOff size={12} />}
                        </RepeatCheck>
                        <Button
                          className='delete'
                          onClick={() => handleRemoveDish(dish)}
                          title="删除菜品"
                        >
                          ×
                        </Button>
                      </DishTagActions>
                    </DishTagWrapper>
                  )
                })
              ) : (
                <EmptyText>未选择菜品</EmptyText>
              )}
            </SelectedDishesList>
            <Button className='add'
              onClick={() => {
                localProxy.openDishes('lunch');
              }}
            >
              <Plus size={16} /> 添加菜品
            </Button>
          </MealSection>

          {/* 晚餐区块 */}
          <MealSection>
            <MealTitle>🍽️ 晚餐</MealTitle>
            <SelectedDishesList>
              {dinnerDishes.length > 0 ? (
                dinnerDishes.map(dish => {
                  const key = `dinner_${dish.id}`
                  return (
                    <DishTagWrapper key={key} className={`${dish.repeated ? 'repeated' : ''}`}>
                      <DishTagContent>
                        {dish.dish.title}
                      </DishTagContent>
                      <DishTagActions>
                        <button
                          className={`repeat-check ${dish.can_repeated ? 'enabled' : 'disabled'}`}
                          onClick={() => handleToggleDishRepeat(dish.id)}
                          title={dish.can_repeated ? '不参与重复判断' : '参与重复判断'}
                        >
                          {dish.can_repeated ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <Button className='delete'
                          onClick={() => handleRemoveDish(dish)}
                          title="删除菜品"
                        >
                          ×
                        </Button>
                      </DishTagActions>
                    </DishTagWrapper>
                  )
                })
              ) : (
                <EmptyText>未选择菜品</EmptyText>
              )}
            </SelectedDishesList>
            <Button
              className='add'
              onClick={() => {
                localProxy.closeDishes('dinner');
              }}
            >
              <Plus size={16} /> 添加菜品
            </Button>
          </MealSection>
        </ModalContent>
      </Modal>
      {/* 菜品选择弹框 */}
      {localState.showDishList && (
        <DishSelectorOverlay
          categories={store.kinds}
          date={date}
          onToggleDish={handleToggleDish}
          onClose={() => { localProxy.closeDishes() }}
        />
      )}
    </Mask>
  )
}

// 菜品选择组件
const DishSelectorOverlay = ({ date, onToggleDish, onClose }) => {
  const store = useSnapshot(global)
  const selectedDishes = store.getDateRecords(date)
  const dishsByCategory = store.kinds.map(kind => {
    return {
      kind,
      dishes: store.dishes.filter(d => d.kind_id === kind.id)
    }
  })
  return (
    <Mask onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>选择菜品 </h3>
          <div onClick={onClose}>
            <X size={24} />
          </div>
        </ModalHeader>

        <ModalContent>
          {/* 分类栏显示所有菜品 */}
          {dishsByCategory.map(({ kind, dishes }) => (
            <div key={kind.id} style={{ marginBottom: 10 }}>
              <CategoryTitle>{kind.title}</CategoryTitle>
              <DishesGrid>
                {dishes.map(dish => {
                  const isSelected = selectedDishes.findIndex(d => d.dish_id === dish.id) !== -1
                  const isRepeated = dish.repeated
                  return (
                    <DishCell
                      key={dish.id}
                      className={`${isSelected ? 'selected' : ''} ${isRepeated ? 'repeated' : ''}`}
                      onClick={() => onToggleDish(dish, !isSelected)}
                      title={isRepeated ? '该菜品最近7天内有重复' : ''}
                    >
                      <span className="dish-cell-name">{dish.title}</span>
                      {isSelected && (
                        <DishCellChecked>
                          <Check size={16} />
                        </DishCellChecked>
                      )}
                      {isRepeated && (
                        <DishCellRepeated title="重复菜品">⚠️</DishCellRepeated>
                      )}
                    </DishCell>
                  )
                })}
              </DishesGrid>
            </div>
          ))}
        </ModalContent>
        <ModalFooter>
          <Button onClick={onClose} className="add">完成</Button>
        </ModalFooter>
      </Modal>
    </Mask>
  )
}

export default DayMealSelector