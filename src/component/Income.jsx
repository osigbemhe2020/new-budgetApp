// components/Income.jsx
import React, { useState } from 'react';
import { useIncomes, useAddIncome, useUpdateIncome, useDeleteIncome } from '../hooks/income.hook.js';

const Income = ({ onTotalIncomeChange }) => {
  const [incomeItemName, setIncomeItemName] = useState('');
  const [incomeItemPrice, setIncomeItemPrice] = useState('');
  const [editingItem, setEditingItem] = useState(null); // { id, name, amount }
  const [errorMsg, setErrorMsg] = useState('');

  const { data: incomeItems = [], isLoading, error } = useIncomes();
  const addIncome = useAddIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();

  console.log('Income items:', incomeItems);

  const totalIncome = incomeItems.reduce((sum, item) => sum + Number(item.amount), 0);

  // Notify parent of total so Budget/Savings still work
  React.useEffect(() => {
    if (onTotalIncomeChange) onTotalIncomeChange(totalIncome);
  }, [totalIncome]);

  const calculatePercent = (amount) => {
    if (totalIncome === 0) return '0.0';
    return ((Number(amount) / totalIncome) * 100).toFixed(1);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!incomeItemName.trim() || isNaN(incomeItemPrice) || parseFloat(incomeItemPrice) <= 0) {
      setErrorMsg('Please enter a valid name and a positive amount.');
      return;
    }
    const amount = parseFloat(incomeItemPrice);

    try {
      if (editingItem) {
        await updateIncome.mutateAsync({ id: editingItem.id, name: incomeItemName, amount });
        setEditingItem(null);
      } else {
        await addIncome.mutateAsync({ name: incomeItemName, amount });
      }
      setIncomeItemName('');
      setIncomeItemPrice('');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIncomeItemName(item.name);
    setIncomeItemPrice(String(item.amount));
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIncomeItemName('');
    setIncomeItemPrice('');
    setErrorMsg('');
  };

  const handleDelete = async (id) => {
    setErrorMsg('');
    try {
      await deleteIncome.mutateAsync(id);
    } catch (err) {
      setErrorMsg(err.message || 'Could not delete income.');
    }
  };

  const isMutating = addIncome.isPending || updateIncome.isPending;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 flex items-center justify-center h-32">
        <div className="flex items-center space-x-3 text-indigo-600">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-medium">Loading incomes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <p className="text-red-600 font-medium">Error loading incomes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Income</h2>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Add / Edit Form */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">
            {editingItem ? 'Edit Income Source' : 'Add Income Source'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={incomeItemName}
              onChange={(e) => setIncomeItemName(e.target.value)}
              placeholder="Income source name"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="number"
              value={incomeItemPrice}
              onChange={(e) => setIncomeItemPrice(e.target.value)}
              placeholder="Amount"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSubmit}
                disabled={isMutating}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMutating
                  ? (editingItem ? 'Updating...' : 'Adding...')
                  : (editingItem ? 'Update Income' : 'Add Income')}
              </button>
              {editingItem && (
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Total Income Summary */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Total Income</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              ₦{totalIncome.toLocaleString()}
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                {incomeItems.length} income source{incomeItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-3">Income Sources</h3>
        {incomeItems.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No income sources added yet.</p>
        ) : (
          <div className="space-y-2">
            {incomeItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  editingItem?.id === item.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                }`}
              >
                <span className="font-medium text-black flex-1">{item.source_name}</span>
                <span className="text-green-600 font-semibold mx-3">₦{Number(item.amount).toLocaleString()}</span>
                <span className="text-sm text-indigo-600 w-12 text-right">{calculatePercent(item.amount)}%</span>
                <div className="flex space-x-2 ml-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteIncome.isPending}
                    className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Income;