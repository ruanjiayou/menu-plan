import React, { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { getDishesData, saveDishesData } from '../utils/storage'
import '../styles/DishManager.css'

const DishManager = () => {
  const [dishes, setDishes] = useState([])
  const [newDishName, setNewDishName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadDishes()
  }, [])

  const loadDishes = () => {
    const data = getDishesData()
    setDishes(data)
    const cats = [...new Set(data.map(d => d.category))].filter(Boolean)
    setCategories(cats)
  }

  const addDish = () => {
    if (!newDishName.trim() || !newCategory.trim()) {
      alert('请输入菜品名称和分类')
      return
    }

    const newDish = {
      id: Date.now(),
      name: newDishName.trim(),
      category: newCategory.trim()
    }

    const updatedDishes = [...dishes, newDish]
    setDishes(updatedDishes)
    saveDishesData(updatedDishes)
    
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
    }

    setNewDishName('')
    setNewCategory('')
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
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="form-select"
          >
            <option value="">选择或输入分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="新分类"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={handleKeyPress}
            className="form-input"
            style={{ marginTop: '8px' }}
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
                  <h4>{dish.name}</h4>
                  <p className="category-label">{dish.category}</p>
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