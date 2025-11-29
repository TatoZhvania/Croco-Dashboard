import { useState, useEffect } from 'react';

/**
 * Hook to check the reachability of a URL
 * @param {string} url - The URL to check
 * @param {boolean} enabled - Whether to enable the check
 * @returns {Object} - { status: 'checking' | 'reachable' | 'unreachable' }
 */
export const useLinkStatus = (url, enabled = true) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!enabled || !url) {
      setStatus('unknown');
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const checkLink = async () => {
      try {
        setStatus('checking');
        
        // Ensure URL has a protocol
        const urlToCheck = url.startsWith('http') ? url : `https://${url}`;
        
        // Use fetch with no-cors mode to avoid CORS issues
        // This will only tell us if the request was sent, not the actual response
        const response = await fetch(urlToCheck, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal,
        });

        if (isMounted) {
          // In no-cors mode, opaque responses are considered successful
          setStatus('reachable');
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          // If fetch fails, the link is likely unreachable
          setStatus('unreachable');
        }
      }
    };

    // Check immediately
    checkLink();

    // Recheck every 5 minutes
    const interval = setInterval(checkLink, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [url, enabled]);

  return { status };
};
