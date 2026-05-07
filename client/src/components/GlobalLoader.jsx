import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import athleteAnimation from '../assets/athlete-loader2.json';
import './GlobalLoader.css';

const GlobalLoader = () => {
  const lottieRef = useRef();

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(3.1); 
    }
  }, []);

  return (
    <div className="global-loader-overlay">
      <div className="loader-content">
        <Lottie
          lottieRef={lottieRef}
          animationData={athleteAnimation}
          loop={true}
          style={{ width: 300, height: 300 }}
        />
      </div>
    </div>
  );
};

export default GlobalLoader;
