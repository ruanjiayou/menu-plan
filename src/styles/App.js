import { styled } from '@linaria/react';

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background-color: #f5f5f5;
`
export const AppHeader = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`
export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 10px;

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`
export const AppMain = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  padding: 0 10px;
`
export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  & h1 {
    font-size: 24px;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 18px;
    }
  }
`
export const TabNavigation = styled.div`
  display: flex;
  gap: 8px;
`
export const TabButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  color: wheat;
  border-bottom: 3px solid transparent;
  /* transition: all 0.3s ease; */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  border: none;
  &.active {
    color: white;
    box-shadow: inset white 0 0 10px;
    border-radius: 25px;
  }

  @media (max-width: 768px) {
    padding: 8px;
    font-size: 14px;
  }
`
