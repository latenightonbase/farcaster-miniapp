'use client'

import { usePathname, useSearchParams } from 'next/navigation';
import Navigation from './Navigation';
import { useEffect, useState } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import '@/styles/nprogress.css'; // Our custom styles for NProgress

export default function NavigationWrapper() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  }, [pathname, searchParams]);
  
  // We'll always render the Navigation component
  return <Navigation />;
}
