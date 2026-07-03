// components/Budget.jsx
import React from 'react';

const Budget = ({ budget, totalExpenses, balance }) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="bg-green-100 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Budget</h3>
        <p className="text-3xl font-bold text-green-600">₦{budget.toLocaleString()}</p>
      </div>
      
      <div className="bg-red-100 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Expenses</h3>
        <p className="text-3xl font-bold text-red-600">₦{totalExpenses.toLocaleString()}</p>
      </div>
      
      <div className={`rounded-lg p-6 text-center ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
        <h3 className="text-lg font-semibold mb-2">{balance >= 0 ? 'Balance' : 'Debt'}</h3>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
          ₦{Math.abs(balance).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default Budget;