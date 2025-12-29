import React from 'react';

const FullWidthContainer = ({ children }) => {
  return (
    <div 
      className="w-screen relative"
      style={{ 
        left: 'calc(-50vw + 50%)',
        right: 'calc(-50vw + 50%)',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        width: '100vw'
      }}
    >
      {children}
    </div>
  );
};

export default FullWidthContainer;