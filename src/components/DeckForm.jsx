import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const DeckForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState(
        initialData || { name: '', description: '' }
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Deck name is required!');
            return;
        }
        try {
            if (initialData) {
                onSubmit({ ...formData, id: initialData.id });
                toast.success('Deck updated!');
            } else {
                onSubmit(formData);
                toast.success('Deck created!');
            }
        } catch (err) {
            toast.error('Failed to save deck!');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-1 font-medium">Deck Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
            </div>
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {initialData ? 'Update Deck' : 'Create Deck'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default DeckForm;