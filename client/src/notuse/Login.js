import React from 'react';
import './Login.css';

function LoginHttp(){
  
  return(
    <div className="container">
      <div className="form-wrapper">
        <h2>Login</h2>
        <div className="input-wrapper">
          <label htmlFor="username">ID</label>
          <input type="text" id="username" placeholder="Enter your Email or Nickname "/>
        </div>
        <div className="input-wrapper">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter your password"/>
        </div>
        <button type="submit">Login</button>
        <div className="signup">
          <p>Don't have an account? <a href="#">Sign up</a></p> {/* 주소 */}
        </div>
      </div>
    </div>
  )
        
}

export default LoginHttp;




  
