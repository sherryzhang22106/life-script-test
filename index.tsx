
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './Admin';

// 简单路由：根据 URL 路径决定渲染哪个组件
const getComponent = () => {
  const path = window.location.pathname;

  if (path === '/admin' || path === '/admin/') {
    return <Admin />;
  }

  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {getComponent()}
  </React.StrictMode>
);
