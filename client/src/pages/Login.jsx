import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import '../css/Login.css';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
   
  const navigate  = useNavigate()

  const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)

  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') 

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
  
      axios.defaults.withCredentials = true;
  
      let data;
      if (state === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/auth/register', { name, email, password });
        data = response.data;
      } else {
        const response = await axios.post(backendUrl + '/api/auth/login', { email, password });
        data = response.data;
      }
  
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // Handle network or unexpected errors
      if (error.response) {
        toast.error(error.response.data.message || 'An error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };
  

  return (

    <div className="login-container">
      <div className="login-box">
        <img onClick={()=>navigate('/')} src={assets.logo} alt="Tunila Logo" className="login-logo" />
        <div className="welcome-section">
          <h2 className="login-heading">
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="login-subtext">
            {state === 'Sign Up'
              ? 'Join the community of music lovers!'
              : 'Login to your account and explore.'}
          </p>
        </div>
        
        <form onSubmit={onSubmitHandler} className="login-form">
          {state === 'Sign Up' && (
            <div className="input-group"> 
              <input 
              onChange={e => setName(e.target.value)} value={name} 
              type="text" placeholder="Full Name" required />
            </div>
          )}
        
          <div className="input-group">
            <input
             onChange={e => setEmail(e.target.value)} value={email} 
             type="email" placeholder="Email Address" required />
          </div>

          <div className="input-group">
            <input 
             onChange={e => setPassword(e.target.value)} value={password} 
             type="password" placeholder="Password" required />
          </div>

          {state === 'Login' && (
            <div className="forgot-password">
              <p onClick={()=>navigate('/reset-password')}>Forgot Password?</p>
            </div>
          )}

          <button type="submit" className="login-btn">
            {state === 'Sign Up' ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="switch-state">
          {state === 'Sign Up' ? (
            <p>
              Already have an account?{' '}
              <span onClick={() => setState('Login')}>Login</span>
            </p>
          ) : (
            <p>
              New here? <span onClick={() => setState('Sign Up')}>Sign Up</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
