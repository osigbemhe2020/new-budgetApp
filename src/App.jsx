import React, { useState, useEffect } from 'react';

const App = () => {
  // State for income items
  const [incomeItems, setIncomeItems] = useState([]);
  const [incomeItemName, setIncomeItemName] = useState('');
  const [incomeItemPrice, setIncomeItemPrice] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [editingIncomeIndex, setEditingIncomeIndex] = useState(-1);

  // State for savings
  const [savingsPercent, setSavingsPercent] = useState(0);
  const [savingsTime, setSavingsTime] = useState('three months');
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [freedUpSavings, setFreedUpSavings] = useState(0);
  const [lockedFunds, setLockedFunds] = useState([]);

  // State for expenses
  const [expenseItems, setExpenseItems] = useState([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(-1);

  // State for popular items
  const [popularItems, setPopularItems] = useState([
    { name: 'Rent', price: 5000 },
    { name: 'Food', price: 2000 },
    { name: 'Data', price: 1000 }
  ]);
  const [newPopularItemName, setNewPopularItemName] = useState('');
  const [newPopularItemPrice, setNewPopularItemPrice] = useState('');
  const [popularItemsLimit] = useState(5);

  // State for budget and balance
  const [budget, setBudget] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceBroughtForward, setBalanceBroughtForward] = useState(0);

  // State for debt
  const [currentDebt, setCurrentDebt] = useState(0);
  const [lastMonthDebt, setLastMonthDebt] = useState(0);

  // State for interest calculation
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [interestAmount, setInterestAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentInterestRate, setCurrentInterestRate] = useState(5);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      const savedSavingsPercent = localStorage.getItem("savePercent");
      const savedSavingsTime = localStorage.getItem("choiceVal");
      const savedIncome = localStorage.getItem("storedincome");
      const savedItemsList = localStorage.getItem("itemsList");
      const savedExpenseList = localStorage.getItem("ExpenseList");
      const savedBBF = localStorage.getItem("bbf");

      if (savedSavingsPercent) setSavingsPercent(parseFloat(savedSavingsPercent));
      if (savedSavingsTime) setSavingsTime(savedSavingsTime);
      if (savedBBF) setBalanceBroughtForward(parseFloat(savedBBF) || 0);

      if (savedItemsList) {
        try {
          const items = JSON.parse(savedItemsList);
          setIncomeItems(items);
          const total = items.reduce((sum, item) => sum + item.Eprice, 0);
          setTotalIncome(total);
        } catch (e) {
          console.error("Error parsing saved items:", e);
        }
      }

      if (savedExpenseList) {
        try {
          const expenses = JSON.parse(savedExpenseList);
          setExpenseItems(expenses);
          const total = expenses.reduce((sum, item) => sum + item.Cprice, 0);
          setTotalExpenses(total);
        } catch (e) {
          console.error("Error parsing saved expenses:", e);
        }
      }

      if (savedIncome) {
        setTotalIncome(parseFloat(savedIncome) || 0);
      }
    };

    loadSavedData();
  }, []);

  // Calculate budget and balance when income or savings change
  useEffect(() => {
    const newSavings = (savingsPercent / 100) * totalIncome;
    setSavingsAmount(newSavings);
    const newBudget = totalIncome - newSavings;
    setBudget(newBudget);
    
    // Update balance based on budget and expenses
    const newBalance = newBudget - totalExpenses;
    setBalance(newBalance);
    
    // Update debt if balance is negative
    if (newBalance < 0) {
      setCurrentDebt(-newBalance);
    } else {
      setCurrentDebt(0);
    }
  }, [totalIncome, savingsPercent, totalExpenses]);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("itemsList", JSON.stringify(incomeItems));
    localStorage.setItem("storedincome", totalIncome.toString());
  }, [incomeItems, totalIncome]);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ExpenseList", JSON.stringify(expenseItems));
  }, [expenseItems]);

  // Reset function - fixed version
  const reset = () => {
    // Reset income
    setIncomeItems([]);
    setTotalIncome(0);
    localStorage.removeItem("itemsList");
    localStorage.removeItem("storedincome");
    
    // Reset expenses
    setExpenseItems([]);
    setTotalExpenses(0);
    localStorage.removeItem("ExpenseList");
    
    // Reset savings
    setSavingsAmount(0);
    
    // Reset budget and balance
    setBudget(0);
    setBalanceBroughtForward(prev => prev + balance);
    setBalance(0);
    
    // Reset debt
    setLastMonthDebt(currentDebt);
    setCurrentDebt(0);
    
    // Clear form inputs
    setIncomeItemName('');
    setIncomeItemPrice('');
    setExpenseName('');
    setExpenseAmount('');
    setEditingIncomeIndex(-1);
    setEditingExpenseIndex(-1);
    
    // Log reset completion
    console.log("Reset completed successfully");
  };

  // Check for monthly reset (on the 6th of each month)
  useEffect(() => {
    const checkMonthlyReset = () => {
      const today = new Date();
      if (today.getDate() === 6) {
        reset();
      }
    };

    // Check once per day
    const interval = setInterval(checkMonthlyReset, 24 * 60 * 60 * 1000);
    
    // Also check on component mount
    checkMonthlyReset();
    
    return () => clearInterval(interval);
  }, []);

  // Handle adding/editing income items
  const addIncomeItem = () => {
    if (!incomeItemName.trim() || isNaN(incomeItemPrice) || parseFloat(incomeItemPrice) <= 0) {
      alert("Please enter valid income details");
      return;
    }

    const price = parseFloat(incomeItemPrice);
    
    if (editingIncomeIndex >= 0) {
      // Edit existing item
      const updatedItems = [...incomeItems];
      updatedItems[editingIncomeIndex] = { Ename: incomeItemName, Eprice: price };
      setIncomeItems(updatedItems);
      setEditingIncomeIndex(-1);
    } else {
      // Add new item
      const newItem = { Ename: incomeItemName, Eprice: price };
      setIncomeItems(prev => [...prev, newItem]);
    }

    // Recalculate total income
    const newTotal = [...incomeItems, { Ename: incomeItemName, Eprice: price }]
      .reduce((sum, item) => sum + item.Eprice, 0);
    setTotalIncome(newTotal);
    
    // Clear form
    setIncomeItemName('');
    setIncomeItemPrice('');
  };

  // Handle editing income item
  const editIncomeItem = (index) => {
    const item = incomeItems[index];
    setIncomeItemName(item.Ename);
    setIncomeItemPrice(item.Eprice.toString());
    setEditingIncomeIndex(index);
  };

  // Handle deleting income item
  const deleteIncomeItem = (index) => {
    const updatedItems = incomeItems.filter((_, i) => i !== index);
    setIncomeItems(updatedItems);
    
    // Recalculate total income
    const newTotal = updatedItems.reduce((sum, item) => sum + item.Eprice, 0);
    setTotalIncome(newTotal);
  };

  // Handle adding popular item
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
    
    // Clear form
    setNewPopularItemName('');
    setNewPopularItemPrice('');
  };

  // Handle selecting popular item
  const selectPopularItem = (item) => {
    setExpenseName(item.name);
    setExpenseAmount(item.price.toString());
    
    // Remove from popular items
    setPopularItems(prev => prev.filter(i => i.name !== item.name));
  };

  // Handle deleting popular item
  const deletePopularItem = (index) => {
    setPopularItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handle adding/editing expense items
  const addExpenseItem = () => {
    if (!expenseName.trim() || isNaN(expenseAmount) || parseFloat(expenseAmount) <= 0) {
      alert("Please enter valid expense details");
      return;
    }

    const amount = parseFloat(expenseAmount);
    
    if (editingExpenseIndex >= 0) {
      // Edit existing item
      const updatedItems = [...expenseItems];
      updatedItems[editingExpenseIndex] = { Cname: expenseName, Cprice: amount };
      setExpenseItems(updatedItems);
      setEditingExpenseIndex(-1);
    } else {
      // Add new item
      const newItem = { Cname: expenseName, Cprice: amount };
      setExpenseItems(prev => [...prev, newItem]);
    }

    // Recalculate total expenses
    const newTotal = [...expenseItems, { Cname: expenseName, Cprice: amount }]
      .reduce((sum, item) => sum + item.Cprice, 0);
    setTotalExpenses(newTotal);
    
    // Clear form
    setExpenseName('');
    setExpenseAmount('');
  };

  // Handle editing expense item
  const editExpenseItem = (index) => {
    const item = expenseItems[index];
    setExpenseName(item.Cname);
    setExpenseAmount(item.Cprice.toString());
    setEditingExpenseIndex(index);
  };

  // Handle deleting expense item
  const deleteExpenseItem = (index) => {
    const deletedItem = expenseItems[index];
    const updatedItems = expenseItems.filter((_, i) => i !== index);
    setExpenseItems(updatedItems);
    
    // Recalculate total expenses
    const newTotal = updatedItems.reduce((sum, item) => sum + item.Cprice, 0);
    setTotalExpenses(newTotal);
  };

  // Handle saving percentage
  const saveSavingsPercent = () => {
    localStorage.setItem("savePercent", savingsPercent.toString());
    localStorage.setItem("choiceVal", savingsTime);
  };

  // Handle interest calculation
  const calculateInterest = () => {
    if (!principal || !rate || !time) {
      alert("Please enter all values");
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time) / 12; // Convert months to years

    if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r < 0 || t <= 0) {
      alert("Please enter valid positive numbers");
      return;
    }

    const interest = (p * r * t) / 100;
    const total = p + interest;

    setInterestAmount(interest);
    setTotalAmount(total);
    
    // Clear inputs
    setPrincipal('');
    setRate('');
    setTime('');
  };

  // Handle setting interest rate
  const setInterestRate = () => {
    const newRate = parseFloat(document.getElementById("int-rate")?.value || "0");
    if (newRate > 0 && newRate < 100) {
      setCurrentInterestRate(newRate);
      document.getElementById("int-rate").value = "";
    }
  };

  // Calculate percentage for income items
  const calculatePercent = (price) => {
    if (totalIncome === 0) return "0.0";
    return ((price / totalIncome) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Budget App </h1>
          <p className="text-gray-600">Track your income, expenses, and savings</p>
        </header>

        {/* Income Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Income</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Add Income Source</h3>
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
                <button
                  onClick={addIncomeItem}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                >
                  {editingIncomeIndex >= 0 ? "Update Income" : "Add Income"}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Total Income</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">₦{totalIncome.toLocaleString()}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">Previous Month: ₦{totalIncome.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Current Month: ₦{totalIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Income Items List */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Income Sources</h3>
            <div className="space-y-2">
              {incomeItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.Ename}</span>
                  <span className="text-green-600 font-semibold">₦{item.Eprice.toLocaleString()}</span>
                  <span className="text-sm text-indigo-600">{calculatePercent(item.Eprice)}%</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editIncomeItem(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteIncomeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Savings</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Savings Percentage (%)</label>
              <input
                type="number"
                value={savingsPercent}
                onChange={(e) => setSavingsPercent(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lock Duration</label>
              <select
                value={savingsTime}
                onChange={(e) => setSavingsTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="three months">3 Months</option>
                <option value="six months">6 Months</option>
                <option value="one year">1 Year</option>
                <option value="two years">2 Years</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Savings Amount</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xl font-bold text-blue-600">₦{savingsAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={saveSavingsPercent}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            <button
              onClick={() => {
                const now = new Date();
                let monthsToAdd = 3;
                switch(savingsTime) {
                  case 'six months': monthsToAdd = 6; break;
                  case 'one year': monthsToAdd = 12; break;
                  case 'two years': monthsToAdd = 24; break;
                  default: monthsToAdd = 3;
                }
                
                const unlockDate = new Date(now);
                unlockDate.setMonth(unlockDate.getMonth() + monthsToAdd);
                
                setLockedFunds(prev => [...prev, {
                  amount: savingsAmount,
                  unlockDate: unlockDate
                }]);
                
                alert(`Saved ₦${savingsAmount.toLocaleString()}. Unlocks on ${unlockDate.toDateString()}`);
              }}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            >
              Lock Savings
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Freed Up Savings</h4>
            <p className="text-2xl font-bold text-yellow-600">₦{freedUpSavings.toLocaleString()}</p>
          </div>
        </div>

        {/* Budget Section */}
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

        {/* Expenses Section */}
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
                <button
                  onClick={addExpenseItem}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                >
                  {editingExpenseIndex >= 0 ? "Update Expense" : "Add Expense"}
                </button>
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
                      <button
                        onClick={() => selectPopularItem(item)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deletePopularItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
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

          {/* Expenses List */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Expense Items</h3>
            <div className="space-y-2">
              {expenseItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.Cname}</span>
                  <span className="text-red-600 font-semibold">₦{item.Cprice.toLocaleString()}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editExpenseItem(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteExpenseItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Debt Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Debt Management</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Current Debt</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-red-600">₦{currentDebt.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Last Month: ₦{lastMonthDebt.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Interest Rate</h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    id="int-rate"
                    placeholder="New rate (%)"
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={setInterestRate}
                    className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Set
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Current Rate: <span className="font-bold">{currentInterestRate}%</span></p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interest Calculator */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Simple Interest Calculator</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="Principal"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Rate (%)"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time (months)"
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={calculateInterest}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Calculate
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow">
                <p className="text-sm text-gray-600">Interest</p>
                <p className="text-xl font-bold text-blue-600">₦{interestAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-green-600">₦{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Brought Forward */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Balance Brought Forward</h2>
          <div className="bg-indigo-50 p-6 rounded-lg text-center">
            <p className="text-lg text-gray-700 mb-2">Previous Balance</p>
            <p className="text-3xl font-bold text-indigo-600">₦{balanceBroughtForward.toLocaleString()}</p>
          </div>
        </div>

        {/* Reset Button */}
        <div className="text-center mb-8">
          <button
            onClick={reset}
            className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
          >
            Reset Monthly Budget
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-4">
          <p>© {new Date().getFullYear()} Personal Finance Manager | Reset occurs automatically on the 6th of each month</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
