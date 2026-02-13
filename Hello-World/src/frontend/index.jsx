import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Spinner } from '@forge/react';

const App = () => {
  // Track whether the 5-second spinner duration has elapsed
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show the spinner for 5 seconds, then reveal the content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Display spinner while loading, then show a message once done
  if (isLoading) {
    return <Spinner size="large" />;
  }

  return <Text>Welcome! Loading complete.</Text>;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
