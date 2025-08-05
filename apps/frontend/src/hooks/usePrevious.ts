'use client';

import * as React from 'react';

/**
 * Custom hook to get the previous value of a state or prop
 * @param value The value to track
 * @returns The previous value (undefined on first render)
 */
const usePrevious = <T>(value: T): T | undefined => {
    // Use ref to store the previous value
    const ref = React.useRef<T | undefined>(undefined);

    // Update ref in useEffect to ensure it runs after render
    React.useEffect(() => {
        // Only update after the initial render
        ref.current = value;
    });

    // Return the previous value (undefined on first render)
    return ref.current;
};

export default usePrevious;
