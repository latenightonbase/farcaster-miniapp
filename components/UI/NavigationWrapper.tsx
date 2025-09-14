'use client'

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import { useEffect, useState, Suspense } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import '@/styles/nprogress.css'; // Our custom styles for NProgress

// Separate component that uses searchParams
function NavigationProgress() {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState('');
  
  // Set up NProgress for navigation
  useEffect(() => {
    // Configure NProgress
    NProgress.configure({ 
      showSpinner: false,
      minimum: 0.1,
      easing: 'ease',
      speed: 300
    });
    
    // Add event listener for beforeunload (page refresh/close)
    window.addEventListener('beforeunload', () => {
      NProgress.start();
    });
    
    // Clean up on component unmount
    return () => {
      window.removeEventListener('beforeunload', () => {
        NProgress.start();
      });
      NProgress.done();
    };
  }, []);

  // Track pathname changes to handle navigation progress
  useEffect(() => {
    // First render - don't show progress
    if (prevPathname === '') {
      setPrevPathname(pathname);
      return;
    }
    
    // Complete any ongoing progress when new page loads
    NProgress.done();
    
    // Update previous pathname
    setPrevPathname(pathname);
  }, [pathname]);
  
  return null;
}

export default function NavigationWrapper() {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Navigation />
    </>
  );
}
