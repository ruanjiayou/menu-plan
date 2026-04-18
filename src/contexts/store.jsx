import React from 'react'

// 创建 Context
const RootStoreContext = React.createContext(null);

// Provider 组件
export const StoreProvider = ({ children, store }) => {
  return (
    <RootStoreContext.Provider value={store}>
      {children}
    </RootStoreContext.Provider>
  );
};

// Hook 使用 store
export const useStore = () => {
  const store = React.useContext(RootStoreContext);
  if (!store) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return store;
};