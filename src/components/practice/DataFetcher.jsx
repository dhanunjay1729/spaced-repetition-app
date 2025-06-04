import React, { useState, useEffect } from 'react';

const DataFetcher = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setData({ message: 'Data loaded successfully!' });
            setLoading(false);
        }, 2000);
    }, []);

    if (loading) {
        return (
            <div className="p-4 bg-white rounded shadow">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded shadow">
            <p className="text-green-600">{data.message}</p>
        </div>
    );
};

export default DataFetcher;