import React from 'react';
import './Login.css';
import 'normalize.css';

function SignupHttp() {
  const goBack = () => {
    // 이전 화면으로 돌아가는 로직 구현
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        {/*<button className="back-button" onClick={goBack}></button>*/}
        <div className="goback">
          <span className="arrow">⬅️</span>
        </div>
        <h2>Signup</h2>
        <div className="input-wrapper">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" />
        </div>
        <div className="input-wrapper">
          <label htmlFor="nickname">Nickname</label>
          <input type="text" id="nickname" placeholder="Enter your nickname" />
        </div>
        <div className="input-wrapper">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password" />
        </div>
        <button type="submit">Signup</button>
        <div className="signup">
          <p>Already have an account? <a href="#">Login</a></p> {/* 주소 */}
        </div>
      </div>
    </div>
  );
}


export default SignupHttp;