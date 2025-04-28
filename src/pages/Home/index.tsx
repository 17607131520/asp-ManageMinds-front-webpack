import React from 'react';
import Login from '@/pages/Login';
import './index.less';

const Home = () => {
  // console.log(process.env);
  console.log(process.env.API_BASE_URL);
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
