import React, { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { getDishesData, saveDishesData } from '../utils/storage'
import '../styles/DishManager.css'

const DishManager = () => {
  const [dishes, setDishes] = useState([])
  const [newDishName, setNewDishName] = useState('')
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadDishes()
  }, [])

  const loadDishes = () => {
    const data = getDishesData()
    setDishes(data)
    const cats = [...new Set(data.map(d => d.categoryId))].filter(Boolean).map(catId => {
      const firstDish = data.find(d => d.categoryId === catId)
      return { id: catId, title: firstDish?.categoryTitle }
    })
    setCategories(cats)
  }

  const generateId = () => {
    return Math.random().toString(36).substring(2, 11)
  }

  const addDish = () => {
    if (!newDishName.trim() || !newCategoryTitle.trim()) {
      alert('请输入菜品名称和分类')
      return
    }

    // 检查分类是否存在
    let categoryId = newCategoryId
    if (!categoryId) {
      const existingCat = categories.find(c => c.title === newCategoryTitle.trim())
      categoryId = existingCat ? existingCat.id : generateId()
    }

    const newDish = {
      id: generateId(),
      title: newDishName.trim(),
      categoryId: categoryId,
      categoryTitle: newCategoryTitle.trim(),
      can_repeated: true // 默认参与重复判断
    }

    const updatedDishes = [...dishes, newDish]
    setDishes(updatedDishes)
    saveDishesData(updatedDishes)
    
    if (!categories.find(c => c.id === categoryId)) {
      setCategories([...categories, { id: categoryId, title: newCategoryTitle.trim() }])
    }

    setNewDishName('')
    setNewCategoryTitle('')
    setNewCategoryId('')
  }

  const deleteDish = (id) => {
    const updatedDishes = dishes.filter(d => d.id !== id)
    setDishes(updatedDishes)
    saveDishesData(updatedDishes)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addDish()
    }
  }

  return (
    <div className="dish-manager">
      <div className="dish-form">
        <h3>添加菜品</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="菜品名称"
            value={newDishName}
            onChange={(e) => setNewDishName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <select
            value={newCategoryId}
            onChange={(e) => {
              const selectedId = e.target.value
              setNewCategoryId(selectedId)
              if (selectedId) {
                const cat = categories.find(c => c.id === selectedId)
                setNewCategoryTitle(cat?.title || '')
              }
            }}
            className="form-select"
          >
            <option value="">选择分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="新分类名称"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="form-input"
          />
        </div>
        <button onClick={addDish} className="add-button">
          <Plus size={18} /> 添加菜品
        </button>
      </div>

      <div className="dishes-list">
        <h3>菜品列表 ({dishes.length})</h3>
        {dishes.length === 0 ? (
          <p className="empty-text">还没有菜品，请先添加</p>
        ) : (
          <div className="dishes-grid">
            {dishes.map(dish => (
              <div key={dish.id} className="dish-card">
                <div className="dish-info">
                  <h4>{dish.title}</h4>
                  <p className="category-label">{dish.categoryTitle}</p>
                </div>
                <button 
                  onClick={() => deleteDish(dish.id)} 
                  className="delete-button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DishManager