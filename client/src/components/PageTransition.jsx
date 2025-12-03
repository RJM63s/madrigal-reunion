import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exit');
      setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 200);
    }
  }, [location, displayLocation]);

  return (
    <div className={`page-transition page-${transitionStage}`}>
      {children}
    </div>
  );
}

export default PageTransition;
