import { UserRound } from 'lucide-react'
import Dropdown from 'rc-dropdown';
import global from '../global'
import { logout } from '../apis';
import { useSnapshot } from 'valtio';

import 'rc-dropdown/assets/index.css';
import { styled } from '@linaria/react';
import Github from '../asserts/github.svg?react';
import Google from '../asserts/google.svg?react';
import Alipay from '../asserts/alipay.svg?react';
import Weibo from '../asserts/weibo.svg?react';

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
const Avatar = styled.img`
  height: 30px;
  border-radius: 50%;
`
const Login = styled.div`
  padding: 3px 10px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  color: white;
  background-color: #999;
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
  return <div>
    {store.user.isLogin
      ? <Dropdown
        trigger={['click']}
        overlay={<Menu>
          <MenuItem>{profile.nickname}</MenuItem>
          <MenuItem onClick={() => {
            logout()
            global.logout()
          }} $align='center'>退出</MenuItem>
        </Menu>}
        animation="slide-up"
      >
        {<Avatar src={profile.avatar} /> || <UserRound size={30} />}
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
        <Login>登录</Login>
      </Dropdown>
    }
  </div>
}

export default User;