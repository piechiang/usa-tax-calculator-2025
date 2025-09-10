import React, { useState } from 'react';

/**
 * Simple 1098 form component for collecting mortgage and student loan interest
 */
const Form1098 = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    mortgageInterest: '',
    points: '',
    studentLoanInterest: ''
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Interest</label>
        <input
          name="mortgageInterest"
          type="number"
          value={formData.mortgageInterest}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Points Paid</label>
        <input
          name="points"
          type="number"
          value={formData.points}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Student Loan Interest</label>
        <input
          name="studentLoanInterest"
          type="number"
          value={formData.studentLoanInterest}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save 1098
      </button>
    </form>
  );
};

export default Form1098;

