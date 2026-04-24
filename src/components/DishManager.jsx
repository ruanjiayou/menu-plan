import { Trash2, Plus } from 'lucide-react'
import '../styles/DishManager.css'
import { createDish, createKind, destryDish, destryKind } from '../apis'
import { useStore } from '../contexts/store'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { toJS } from 'mobx'

const DishManager = observer(() => {
  const store = useStore()
  const local = useLocalObservable(() => ({
    newDishTitle: '',
    newDishKindId: '',
    newKindId: '',
    newKindTitle: '',
    setKV(k, v) {
      this[k] = v
    }
  }))

  const addDish = async () => {
    if (!local.newDishKindId.trim() || !local.newDishTitle.trim()) {
      alert('请输入菜品名称和分类')
      return
    }

    const data = {
      title: local.newDishTitle.trim(),
      kind_id: local.newDishKindId,
    }
    const result = await createDish(data)
    if (result.success) {
      const kind = store.kinds.find(k => k.id === data.kind_id)
      result.data.info.kind = kind ? toJS(kind) : { title: 'None' }
      store.addDish(result.data.info)
      local.setKV('newDishTitle', '')
      const inputs = document.querySelectorAll('#add-dish input')
      inputs.forEach(o => {
        o.value = '';
      });
    } else {
      return alert('添加失败 ' + result.message)
    }
  }

  const deleteDish = async (id) => {
    const result = await destryDish(id)
    if (result.success) {
      store.delDish(id)
    } else {
      return alert('删除失败 ' + result.message)
    }
  }

  const addKind = async () => {
    if (!local.newKindId.trim() || !local.newKindTitle.trim()) {
      alert('请输入分类')
      return
    }

    const data = {
      id: local.newKindId.trim(),
      title: local.newKindTitle.trim(),
    }
    const result = await createKind(data)
    if (result.success) {
      store.addKind(result.data.info)
      local.setKV('newKindId', '')
      local.setKV('newKindTitle', '')
      const inputs = document.querySelectorAll('#add-kind input')
      inputs.forEach(o => {
        o.value = '';
      });
    } else {
      return alert('添加失败 ' + result.message)
    }
  }

  const deleteKind = async (id) => {
    const result = await destryKind(id)
    if (result.success) {
      store.delKind(id)
    } else {
      return alert('删除失败 ' + result.message)
    }
  }

  return (
    <div className="dish-manager">
      <div className="dish-form">
        <h3>添加菜品</h3>
        <div id="add-dish" className="form-group">
          <input
            type="text"
            placeholder="菜品名称"
            defaultValue={local.newDishTitle}
            onChange={(e) => {
              local.setKV('newDishTitle', e.target.value)
            }}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <div className='full-width'>
            {store.kinds.map(kind => (
              <div key={kind.id} style={{ whiteSpace: 'nowrap' }} onTouchStart={() => {
                local.setKV('newDishKindId', kind.id)
              }} onClick={() => {
                local.setKV('newDishKindId', kind.id)
              }}>
                <input type="radio" name="newKindId" value={kind.id} checked={local.newDishKindId === kind.id} />
                {kind.title}
              </div>
            ))}
          </div>
        </div>
        <button onClick={addDish} className="add-button">
          <Plus size={18} /> 添加菜品
        </button>


        <div className="dishes-list">
          <h3>分类列表 ({store.kinds.length})</h3>
          {store.kinds.length === 0 ? (
            <p className="empty-text">还没有分类，请先添加</p>
          ) : (
            <div className="dishes-grid">
              {store.kinds.map(kind => (
                <div key={kind.id} className="dish-card">
                  <div className="dish-info">
                    <h4>{kind.title}</h4>
                  </div>
                  <button
                    onClick={() => deleteKind(kind.id)}
                    className="delete-button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div id="add-kind" className="form-group" style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <input
            type="text"
            placeholder="新分类id"
            value={local.newKindId}
            style={{ flex: 1 }}
            onChange={(e) => {
              local.setKV('newKindId', e.target.value)
            }}
            className="form-input"
          />
          <input
            type="text"
            placeholder="新分类名称"
            value={local.newKindTitle}
            style={{ flex: 1 }}
            onChange={(e) => {
              local.setKV('newKindTitle', e.target.value)
            }}
            className="form-input"
          />
        </div>
        <button onClick={addKind} className="add-button">
          <Plus size={18} /> 添加分类
        </button>
      </div>

      <div className="dishes-list">
        <h3>菜品列表 ({store.dishes.length})</h3>
        {store.dishes.length === 0 ? (
          <p className="empty-text">还没有菜品，请先添加</p>
        ) : (
          <div className="dishes-grid">
            {store.dishes.map(dish => (
              <div key={dish.id} className="dish-card">
                <div className="dish-info">
                  <h4>{dish.title}</h4>
                  <p className="category-label">{dish.kind?.title}</p>
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
})

export default DishManager