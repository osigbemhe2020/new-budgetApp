import React, { useState } from 'react';
import { useActiveDebts } from '../hooks/debt.hook.js';

const Debt = ({ lastMonthDebt }) => {
  const { data: debtsData, isLoading: debtsLoading, error: debtsError } = useActiveDebts();
  const currentDebt = debtsData?.total_owed ?? 0;

  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [interestAmount, setInterestAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const calculateInterest = () => {
    if (!principal || !rate || !time) {
      alert("Please enter all values");
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time) / 12;

    if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r < 0 || t <= 0) {
      alert("Please enter valid positive numbers");
      return;
    }

    const interest = (p * r * t) / 100;
    const total = p + interest;

    setInterestAmount(interest);
    setTotalAmount(total);

    setPrincipal('');
    setRate('');
    setTime('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Debt Management</h2>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Current Debt</h3>
        <div className="bg-red-50 p-4 rounded-lg">
          {debtsLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : debtsError ? (
            <p className="text-sm text-red-600">Failed to load debt data</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-red-600">₦{currentDebt.toLocaleString()}</p>
              {debtsData?.count > 0 && (
                <p className="text-sm text-gray-600 mt-1">{debtsData.count} active debt{debtsData.count > 1 ? 's' : ''}</p>
              )}
            </>
          )}
          <p className="text-sm text-gray-600 mt-1">Last Month: ₦{lastMonthDebt.toLocaleString()}</p>
        </div>
      </div>

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
  );
};

export default Debt;