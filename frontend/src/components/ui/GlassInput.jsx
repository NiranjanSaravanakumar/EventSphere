import React from 'react';

const GlassInput = ({ icon: Icon, label, error, style, ...props }) => {
  const inputStyle = {
    width: '100%',
    height: '3rem',
    paddingLeft: Icon ? '2.75rem' : '1rem',
    paddingRight: '1rem',
    background: 'rgba(var(--glass-rgb),0.05)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(var(--glass-rgb),0.08)'}`,
    borderRadius: '0.75rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    ...style,
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#D4D4D8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.375rem',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1rem',
            height: '1rem',
            color: 'var(--color-text-subtle)',
            pointerEvents: 'none',
          }} />
        )}
        <input
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(var(--glass-rgb),0.20)';
            e.target.style.boxShadow = '0 0 0 1px rgba(var(--glass-rgb),0.10)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'rgba(var(--glass-rgb),0.08)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>{error}</p>
      )}
    </div>
  );
};

export default GlassInput;
