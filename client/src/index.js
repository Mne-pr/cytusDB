// import reportWebVitals from './reportWebVitals';

import React, { createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Login from './Login';
import Signup from './Signup';
import MainU from './MainU';
import MainA from './MainA';
import Song from './SongDetail';
import User from './UserDetail';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/MainU" element={<MainU />} />
        <Route path="/MainA" element={<MainA />} />
        <Route path="/SongDetail/:songID" element={<Song />} />
        <Route path="/UserDetail/:userID" element={<User />} />        
      </Routes>
    </Router>
);


// /*<Route path="*" component={NotFound} />*/
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
