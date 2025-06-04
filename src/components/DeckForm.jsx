import React, { useState } from 'react';

const DeckForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name.trim()) {
            alert('Please enter a deck name');
            return;
        }
        onSubmit(formData);
        // Reset form
        setFormData({ name: '', description: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Create New Deck</h2>
            
            <div className="mb-4">
                <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-2"
                >
                    Deck Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="e.g., JavaScript Arrays"
                    autoFocus
                />
            </div>
            
            <div className="mb-6">
                <label
                    htmlFor="description"
                    className="block text-gray-700 font-medium mb-2"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Brief description of what this deck covers..."
                />
            </div>
            
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                    Create Deck
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default DeckForm;