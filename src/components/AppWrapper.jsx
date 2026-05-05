import React from 'react';
import { Outlet } from 'react-router-dom';
import OAuthDetector from './OAuthDetector';

function AppWrapper() {
  return (
    <>
      <OAuthDetector />
      <Outlet />
    </>
  );
}

export default AppWrapper;
