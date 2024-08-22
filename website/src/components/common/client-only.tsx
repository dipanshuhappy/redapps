import React, { useState, useEffect } from "react";

const withClientOnly = (WrappedComponent: any) => {
  return function ClientOnlyWrapper(props: any) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      setLoaded(true);
    }, []);

    if (!loaded) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withClientOnly;
