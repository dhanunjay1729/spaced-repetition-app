import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

const DeckForm = ({ onSubmit, onCancel, initialData }) => {
    const [isSaving, setIsSaving] = useState(false);
    const savingRef = useRef(false);
    const [formData, setFormData] = useState(
        initialData || { name: '', description: '' }
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (savingRef.current) return;
        if (!formData.name.trim()) {
            toast.error('Deck name is required!');
            return;
        }
        savingRef.current = true;
        setIsSaving(true);
        try {
            await onSubmit(formData);
            toast.success(initialData ? 'Deck updated!' : 'Deck created!');
        } catch {
            toast.error('Failed to save deck!');
        } finally {
            savingRef.current = false;
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-elevated rounded-2xl p-6" aria-busy={isSaving}>
          <fieldset disabled={isSaving} className="space-y-4">
            <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm">Deck Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Biology Chapter 5"
                    required
                />
            </div>
            <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field min-h-[80px]"
                    placeholder="Optional description..."
                />
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    className="btn-primary text-sm"
                >
                    {isSaving ? 'Saving...' : initialData ? 'Update Deck' : 'Create Deck'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary text-sm"
                >
                    Cancel
                </button>
            </div>
          </fieldset>
        </form>
    );
};

export default DeckForm;
