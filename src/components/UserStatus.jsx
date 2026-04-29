import { UserRound } from 'lucide-react'
import Dropdown from 'rc-dropdown';
import global from '../global'

import 'rc-dropdown/assets/index.css';
import { styled } from '@linaria/react';
import Github from '../asserts/github.svg?react';
import Google from '../asserts/google.svg?react';
import Alipay from '../asserts/alipay.svg?react';
import Weibo from '../asserts/weibo.svg?react';
import { logout } from '../apis';
import { useSnapshot } from 'valtio';

const Menu = styled.div`
  padding: 5px 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: grey 0px 0px 3px;
`
const MenuItem = styled.div`
  line-height: 1.5;
  font-size: 12px;
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  justify-content: ${(props) => props.$align || 'flex-start'};
  &:hover {
    cursor: pointer;
  }
  &.disable {
    background-color: lightgrey;
    opacity: 0.7;
    cursor: not-allowed;
  }
`

function onSelect({ key }) {
  console.log(`${key} selected`);
}

function onVisibleChange(visible) {
  console.log(visible);
}

function authorize(app) {
  window.location.href = `https://jiayou.work/gw/user/sns/${app}/authorize?redirect_url=${window.location.href}`
}

const User = () => {
  const store = useSnapshot(global)
  const profile = store.user.profile;
  return <div className='user full-width'>
    {store.user.isLogin
      ? <Dropdown
        trigger={['click']}
        overlay={<Menu>
          <MenuItem>{profile.nickname}</MenuItem>
          <MenuItem onClick={() => {
            logout()
            store.user.logout()
          }} $align='center'>退出</MenuItem>
        </Menu>}
        animation="slide-up"
      >
        {<img src={profile.avatar} style={{ height: 30, borderRadius: '50%' }} /> || <UserRound size={30} />}
      </Dropdown>
      : <Dropdown
        trigger={['click']}
        overlay={<Menu>
          <MenuItem onClick={() => authorize('google')}><Google style={{ height: 15 }} />google</MenuItem>
          <MenuItem onClick={() => authorize('alipay')}><Alipay style={{ height: 16 }} />支付宝</MenuItem>
          <MenuItem className="disable" onClick={() => {
            // authorize('github')
          }}><Github style={{ height: 16 }} />github</MenuItem>
          <MenuItem className="disable" onClick={() => {
            // authorize('weibo')
          }}><Weibo style={{ height: 16 }} />新浪微博</MenuItem>
        </Menu>}
        animation="slide-up"
        onVisibleChange={onVisibleChange}
      >
        <div style={{ padding: '3px 10px', cursor: 'pointer', fontSize: 14, borderRadius: 5, color: 'white', backgroundColor: '#999' }}>登录</div>
      </Dropdown>
    }
  </div>
}

export default User;