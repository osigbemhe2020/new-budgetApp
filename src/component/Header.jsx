// components/Header.jsx
import React from 'react';

const Header = ({ onReset, onLogout, profile }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold text-indigo-950">Budget App</h1>
            <p className="text-xs text-gray-500">Track income, expenses & savings</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 py-2 px-4 rounded-lg border border-gray-200 hover:border-red-200 shadow-sm transition-all duration-200 text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Log Out</span>
        </button>
      </div>

      <div className='text-center mb-8'>
        <h2 className='text-xl font-bold text-indigo-700 mb-4'>Welcome Mr {profile?.user?.FullName}</h2>
      </div>

      <div className="text-center mb-8">
        {/* <button
          onClick={onReset}
          className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
        >
          Reset Monthly Budget
        </button> */}
      </div>

      <footer className="text-center text-gray-500 text-sm py-4">
        <p>© {new Date().getFullYear()} Personal Finance Manager | Reset occurs automatically on the 6th of each month</p>
      </footer>
    </>
  );
};

export default Header;