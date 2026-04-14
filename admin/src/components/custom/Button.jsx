import React from 'react'

const Button = ({ text, onClick, type ="button",className = "" ,icon}) => {
    const baseClass = " w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 font-dm-sans";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${!className == "" ? className : baseClass}`}
    >
      {text}
      {icon && icon}
    </button>
  );
};

export default Button;