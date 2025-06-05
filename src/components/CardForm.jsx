import React, { useState } from 'react';

//onSubmit, onCancel, initialData are props passed to this component
const CardForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        question: initialData?.question || '',
        answer: initialData?.answer || ''
    });

    const handleChange = (e) => {
        //name is attribute of the input field, value is the current value of that field
        //e.target is the element that triggered the event
        //setFormData updates the state with the new value for the specific field
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation
        if (!formData.question.trim() || !formData.answer.trim()) {
            alert('Please fill in both question and answer');
            return;
        }
        // Call the onSubmit prop with the form data
        // This will be handled by the parent component
        //onSubmit is a function passed as a prop to this component
        // It will be called when the form is submitted 
        onSubmit(formData);
        // Reset form if not editing
        if (!initialData) {
            setFormData({ question: '', answer: '' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">
                {initialData ? 'Edit Card' : 'Create New Card'}
            </h2>
            <div className="mb-4">
                <label htmlFor="question" className="block text-gray-700 font-medium mb-2">
                    Question *
                </label>
                <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Enter the question..."
                    autoFocus
                />
            </div>
            <div className="mb-6">
                <label htmlFor="answer" className="block text-gray-700 font-medium mb-2">
                    Answer *
                </label>
                <textarea
                    id="answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Enter the answer..."
                />
            </div>
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                    {initialData ? 'Update Card' : 'Create Card'}
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

export default CardForm;