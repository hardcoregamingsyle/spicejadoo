import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'btn';
  let variantClass = 'primary';
  if (variant === 'ghost') variantClass = 'ghost';
  if (variant === 'secondary') variantClass = 'ghost'; // fallback to ghost if you had a secondary style
  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
