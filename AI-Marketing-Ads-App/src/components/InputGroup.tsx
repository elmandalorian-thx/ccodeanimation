import React from 'react';

interface InputGroupProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, htmlFor, children }) => {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-cyan-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
};

export default InputGroup;