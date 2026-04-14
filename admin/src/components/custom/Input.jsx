import React from 'react'

const Input = ({ name,onChange, type,className, placeholder,value,icon}) => {
    const baseClass ="mt-1 w-full rounded-xl border shadow border-gray-300 px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <input
      type={type}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      icon={icon}
      className={`${!className == "" ? className : baseClass}`}
    />
  );
};

export default Input