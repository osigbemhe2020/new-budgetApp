import React, { useState } from 'react';
import { useExpenses, useCreateExpense, useDeleteExpense } from '../hooks/expense.hook.js';

const Expenses = ({ setTotalExpenses, setBalance }) => {
  const { data: expensesData, isLoading: expensesLoading } = useExpenses();
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const expenseItems = expensesData?.expenses ?? [];

  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Popular items — local-only quick-pick shortcuts. Not the same thing as
  // the backend's recurring expense templates (different shape, different
  // lifecycle — those auto-fire on a cron day), so this stays untouched.
  const [popularItems, setPopularItems] = useState([
    { name: 'Rent', price: 5000 },
    { name: 'Food', price: 2000 },
    { name: 'Data', price: 1000 }
  ]);
  const [newPopularItemName, setNewPopularItemName] = useState('');
  const [newPopularItemPrice, setNewPopularItemPrice] = useState('');
  const popularItemsLimit = 5;

  // Push the backend's authoritative total/balance up to MainPage whenever
  // they change. current_cycle.balance already includes balance_brought_forward
  // (computed server-side), so this is the one true balance number now —
  // MainPage no longer computes its own.
  React.useEffect(() => {
    if (expensesData?.current_cycle?.total_expense != null) {
      setTotalExpenses(Number(expensesData.current_cycle.total_expense));
    }
    if (expensesData?.current_cycle?.balance != null) {
      setBalance(Number(expensesData.current_cycle.balance));
    }
  }, [expensesData, setTotalExpenses, setBalance]);

  const syncMonthSummary = (month_summary) => {
    if (month_summary?.total_expense != null) {
      setTotalExpenses(Number(month_summary.total_expense));
    }
    if (month_summary?.balance != null) {
      setBalance(Number(month_summary.balance));
    }
  };

  const addExpenseItem = async () => {
    if (!expenseName.trim() || isNaN(expenseAmount) || parseFloat(expenseAmount) <= 0) {
      alert("Please enter valid expense details");
      return;
    }

    const amount = parseFloat(expenseAmount);
    setStatusMessage('');

    try {
      // Editing: there's no update endpoint, so we replace — delete the old
      // row, then create the new one.
      if (editingExpenseId != null) {
        await deleteExpenseMutation.mutateAsync(editingExpenseId);
        setEditingExpenseId(null);
      }

      const result = await createExpenseMutation.mutateAsync({
        expense_name: expenseName,
        amount,
        category: null,
      });

      syncMonthSummary(result.month_summary);
      setStatusMessage(result.message);
    } catch (err) {
      alert(err.message || 'Failed to save expense');
      return;
    }

    setExpenseName('');
    setExpenseAmount('');
  };

  const editExpenseItem = (item) => {
    setExpenseName(item.expense_name);
    setExpenseAmount(item.amount.toString());
    setEditingExpenseId(item.id);
  };

  const cancelEdit = () => {
    setEditingExpenseId(null);
    setExpenseName('');
    setExpenseAmount('');
  };

  const deleteExpenseItem = async (id) => {
    try {
      const result = await deleteExpenseMutation.mutateAsync(id);
      syncMonthSummary(result.month_summary);
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const addPopularItem = () => {
    if (!newPopularItemName.trim() || isNaN(newPopularItemPrice) || parseFloat(newPopularItemPrice) <= 0) {
      alert("Please enter valid item details");
      return;
    }

    if (popularItems.length >= popularItemsLimit) {
      alert("Limit reached! Cannot add more items.");
      return;
    }

    const newItem = { name: newPopularItemName, price: parseFloat(newPopularItemPrice) };
    setPopularItems(prev => [...prev, newItem]);
    setNewPopularItemName('');
    setNewPopularItemPrice('');
  };

  const selectPopularItem = (item) => {
    setExpenseName(item.name);
    setExpenseAmount(item.price.toString());
    setPopularItems(prev => prev.filter(i => i.name !== item.name));
  };

  const deletePopularItem = (index) => {
    setPopularItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Expenses</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Add Expense</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              placeholder="Expense name"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                onClick={addExpenseItem}
                disabled={createExpenseMutation.isPending || deleteExpenseMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {createExpenseMutation.isPending || deleteExpenseMutation.isPending
                  ? 'Saving...'
                  : editingExpenseId != null ? "Update Expense" : "Add Expense"}
              </button>
              {editingExpenseId != null && (
                <button
                  onClick={cancelEdit}
                  className="py-2 px-4 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
            {statusMessage && (
              <p className="text-sm text-gray-600">{statusMessage}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Popular Items</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newPopularItemName}
              onChange={(e) => setNewPopularItemName(e.target.value)}
              placeholder="Item name"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="number"
              value={newPopularItemPrice}
              onChange={(e) => setNewPopularItemPrice(e.target.value)}
              placeholder="Price"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={addPopularItem}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
            >
              Add Popular Item
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {popularItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-gray-600">₦{item.price.toLocaleString()}</span>
                <div className="flex space-x-1">
                  <button onClick={() => selectPopularItem(item)} className="text-green-600 hover:text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button onClick={() => deletePopularItem(index)} className="text-red-600 hover:text-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-3">Expense Items</h3>
        {expensesLoading ? (
          <p className="text-gray-500">Loading expenses...</p>
        ) : (
          <div className="space-y-2">
            {expenseItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.expense_name}</span>
                <span className="text-red-600 font-semibold">₦{Number(item.amount).toLocaleString()}</span>
                <div className="flex space-x-2">
                  <button onClick={() => editExpenseItem(item)} className="text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button onClick={() => deleteExpenseItem(item.id)} className="text-red-600 hover:text-red-800">
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

export default Expenses;