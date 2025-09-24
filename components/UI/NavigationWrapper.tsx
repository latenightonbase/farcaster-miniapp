'use client'

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
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
      speed: 300,
      trickleSpeed: 100 // Slower trickling for longer operations
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

    // If pathname has changed, we're navigating to a new page
    if (prevPathname !== pathname) {
      // Finish any current progress
      NProgress.done();
      // Update previous pathname
      setPrevPathname(pathname);
    }
  }, [pathname, prevPathname]);
  
  return null;
}

export default function NavigationWrapper() {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Navbar />
    </>
  );
}
