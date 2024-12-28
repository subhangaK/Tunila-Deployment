import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import '../css/EmailVerify.css';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const EmailVerify = () => {

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  const {backendUrl, isLoggedin, userData, getUserData} = useContext(AppContext)

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) =>{
    if(e.target.value.length > 0 && index >  inputRefs.current.length - 1){
        inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) =>{
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
        inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e)=>{
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index)=>{
        if(inputRefs.current[index]){
            inputRefs.current[index].value = char;
        }
    })
  }

  const onSubmitHandler = async (e) =>{
    try {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value)
        const otp = otpArray.join('')

        const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp})

        if(data.success){
            toast.success(data.message)
            getUserData()
            navigate('/')
        } else {
            toast.error(data.message)
        }

    } catch (error) {
      toast.error(data.message)
    }
  }

  useEffect(()=>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/')
  },[isLoggedin, userData])

  return (
    <div className="email-verify-container">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="Tunila Logo"
        className="verify-logo"
      />
      <form onSubmit={onSubmitHandler} className="verify-form">
        <h1>Email Verification</h1>
        <p className="verify-instruction">Enter the 6-digit OTP sent to your email.</p>
        <div className="otp-input-container" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                className="otp-input"
                required
                ref={e => inputRefs.current[index] = e}
                onInput={(e) => handleInput(e, index) }
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button type="submit" className="verify-button">Verify Email</button>
        <p className="resend-instruction">
          Didn't receive the OTP? <span className="resend-link">Resend</span>
        </p>
      </form>
    </div>
  );
};

export default EmailVerify;
