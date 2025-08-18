import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { glow?: boolean };
export const PokerButton: React.FC<Props> = ({ glow = true, children, ...rest }) => {
  return (
    <button
      {...rest}
      style={{
        background: '#0f0f12',
        color: '#e5e7eb',
        borderRadius: 12,
        padding: '10px 16px',
        border: '1px solid #2a2a33',
        boxShadow: glow ? '0 0 12px rgba(0,255,200,0.25)' : undefined
      }}
    >
      {children}
    </button>
  );
};
import React from react;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { glow?: boolean };
export const PokerButton: React.FC<Props> = ({ glow = true, children, ...rest }) => {
  return (
    <button
      {...rest}
      style={{
        background: #0f0f12,
        color: #e5e7eb,
        borderRadius: 12,
        padding: 10px
