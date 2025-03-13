'use client';

import { useState, useEffect } from "react";

const Loading = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to false when the page is fully loaded
    const handleLoad = () => setLoading(false);

    // Add event listener for page load
    window.addEventListener("load", handleLoad);

    // Cleanup the event listener when component is unmounted
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-28 h-28">
        {loading ? (
          <video
            src="/loading.mp4"
            autoPlay
            loop
            muted
            className="object-cover"
          />
        ) : null}
      </div>
    </div>
  );
};

export default Loading;
