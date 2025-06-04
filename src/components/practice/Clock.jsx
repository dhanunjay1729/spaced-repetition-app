import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // This runs after the component mounts
        console.log('Clock component mounted!');

        // Set up interval to update the time every second
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        // Cleanup function: runs when the component unmounts
        return () => {
            console.log('Clock component unmounting!');
            clearInterval(timer);
        };
    }, []); // Empty array ensures this effect runs only once on mount

    return (
        <div className="p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Current Time</h3>
            <p className="text-2xl font-mono">{time.toLocaleTimeString()}</p>
        </div>
    );
};

export default Clock;