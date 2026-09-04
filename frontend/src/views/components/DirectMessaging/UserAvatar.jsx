import React from 'react';

export default function UserAvatar({ user, size = 40, className = '' }) {
  const isFaculty = user?.role === 'FACULTY';
  const isAdmin   = user?.role === 'ADMIN';

  if (isAdmin) {
    return (
      <div
        className={`univ-avatar-icon admin ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
          border: '1.5px solid #ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
        }}
        title={`${user?.displayName || 'Admin'} (System Administrator)`}
      >
        <span style={{ fontSize: size * 0.5 }}>🛡️</span>
      </div>
    );
  }

  if (isFaculty) {
    return (
      <div
        className={`univ-avatar-icon faculty ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0b192c 100%)',
          border: '1.5px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)'
        }}
        title={`${user?.displayName || 'Faculty'} (Faculty Instructor)`}
      >
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3L2 8L12 13L22 8L12 3Z"
            fill="#F59E0B"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M6 10V14.5C6 16.2 8.7 17.5 12 17.5C15.3 17.5 18 16.2 18 14.5V10"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M5 21C5 18.5 8 17 12 17C16 17 19 18.5 19 21"
            stroke="#F8FAFC"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`univ-avatar-icon student ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
      title={`${user?.displayName || 'Student'} (Student)`}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke="#F8FAFC"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M4 20C4 16 7.5 14.5 12 14.5C16.5 14.5 20 16 20 20"
          stroke="#F8FAFC"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
