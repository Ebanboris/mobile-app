import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [hasNewPost, setHasNewPost] = useState(false);
  return (
    <NotificationContext.Provider value={{ hasNewPost, setHasNewPost }}>
      {children}
    </NotificationContext.Provider>
  );
}