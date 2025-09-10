import React, { useState } from 'react';

/**
 * Simple 1099-INT form component for collecting interest income
 */
const Form1099INT = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    payer: '',
    interest: '',
    federalTaxWithheld: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onComplete) {
      onComplete(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name</label>
        <input
          name="payer"
          value={formData.payer}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Income</label>
        <input
          name="interest"
          type="number"
          value={formData.interest}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Federal Tax Withheld</label>
        <input
          name="federalTaxWithheld"
          type="number"
          value={formData.federalTaxWithheld}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save 1099-INT
      </button>
    </form>
  );
};

export default Form1099INT;

