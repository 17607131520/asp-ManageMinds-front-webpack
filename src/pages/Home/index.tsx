import React from 'react';
import Login from '@/pages/Login';
import './index.less';

const Home = () => {
  return (
    <div className='home'>
      <h1>Home</h1>
      <br />
      <Login />
      <br />
      <div className='login'></div>
    </div>
  );
};
export default Home;
