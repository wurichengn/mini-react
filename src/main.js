// import { observer } from 'mobx-react';
import { configure } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react';
import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';

configure({ enforceActions: 'never' });

/** 性能损耗测试子组件 */
const FiberTestItem = ({ number }) => {
  // 增加一个性能损耗计算
  for (var i = 0; i < 8000000; i++) {}

  return <div>{number}</div>;
};

/** 性能损耗测试组件 */
const FiberTest = () => {
  const [data, setData] = useState();
  const numbers = new Array(1000).fill(0).map(v => <FiberTestItem number={Math.random()} />);

  return <div>
    <button onClick={() => {
      // 重渲染
      setData(null, 0);
    }}>重渲染</button>
    {numbers}
  </div>;
};

/** mobx测试 */
const AppMobx = observer(() => {
  const store = useLocalObservable(() => ({ num: 0 }));

  return <div>
    <div>mobx:{store.num}</div>
    <div>
      <button onClick={() => { store.num--; }}>-</button>
      <button onClick={() => { store.num++; }}>+</button>
    </div>
  </div>;
});

/** 测试用组件 */
const App = () => {
  const [num, setNum] = useState(0);
  const ref = useRef();

  // 副作用测试
  useEffect(() => {
    ref.current.style['width'] = '100px';
  });

  return <div>
    <div>setState:{num}</div>
    <div>
      <button onClick={() => { setNum(num - 1); }}>-</button>
      <button ref={ref} onClick={() => { setNum(num + 1); }}>+</button>
    </div>
  </div>;
};

ReactDOM.render(<div>
  <App></App>
  <AppMobx></AppMobx>
  <FiberTest></FiberTest>
</div>, document.querySelector('#app'));
