import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const CardForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState(
        initialData || { question: '', answer: '' }
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const nextReview = initialData?.nextReview || new Date().toISOString(); // Use existing or current date
            if (initialData) {
                onSubmit({ ...formData, id: initialData.id, nextReview });
                toast.success('Card updated!');
            } else {
                onSubmit({ ...formData, nextReview });
                toast.success('Card created!');
            }
        } catch (err) {
            toast.error('Failed to save card!');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-1 font-medium">Question</label>
                <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Answer</label>
                <input
                    type="text"
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {initialData ? 'Update Card' : 'Add Card'}
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

export default CardForm;