// components/SignIn.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import bgImage from '../assets/images/bgsignup.jpg';
import logo from '../assets/images/360eye_logo 4.png';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/authService';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData.email, formData.password, navigate)); // ✅ No need to pass dispatch manually
  };
  

  return (
    <div className="absolute inset-0 w-screen h-screen flex justify-center items-center overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-60"></div>

      {/* Logo */}
      <div className="absolute inset-0 p-7">
        <img src={logo} />
      </div>

      {/* Transparent Sign-In Box */}
      <div className="relative z-10 w-80 md:w-96 p-8 bg-white bg-opacity-10 rounded-lg shadow-lg backdrop-blur-md border border-white border-opacity-30">
        <h2 className="text-2xl font-bold mb-6 text-white mx-auto flex justify-center ">
          Sign In
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              required
              type="email"
              id="email"
              name="email"
              onChange={handleOnChange}
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              required
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              onChange={handleOnChange}
              className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              placeholder="Enter your password"
            />
            <span className="absolute text-white mt-[-30px] right-0 mr-[46px]">
              {showPassword ? (
                <AiOutlineEyeInvisible
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <AiOutlineEye onClick={() => setShowPassword(!showPassword)} />
              )}
            </span>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-black bg-opacity-40 text-white font-extrabold rounded-md hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;