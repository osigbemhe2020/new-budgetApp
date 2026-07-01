// components/Savings.jsx
import React, { useState, useEffect } from 'react';

const Savings = ({
  savingsSettings,
  savingsSettingsLoading,
  setSavingsSettingsMutation,
  savingsAmount,
  setFreedUpSavings,
}) => {
  // Local edit state — what the user is currently typing. Seeded from the
  // fetched settings once they arrive, then left alone (so a background
  // refetch/invalidate doesn't blow away an in-progress edit).
  const [percentInput, setPercentInput] = useState(0);
  const [durationInput, setDurationInput] = useState(3);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    if (!hasSeeded && savingsSettings?.settings) {
      setPercentInput(savingsSettings.settings.savings_percentage);
      setDurationInput(savingsSettings.settings.lock_duration_months);
      setHasSeeded(true);
    }
  }, [savingsSettings, hasSeeded]);

  const handleSave = () => {
    setSavingsSettingsMutation.mutate({
      savings_percentage: percentInput,
      lock_duration_months: durationInput,
    });
  };

  const isLocked = savingsSettings?.current_cycle_summary?.is_locked ?? false;
  const unlockDate = savingsSettings?.current_cycle_summary?.unlock_date;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Savings</h2>

      {savingsSettingsLoading ? (
        <p className="text-gray-500">Loading settings...</p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Savings Percentage (%)</label>
              <input
                type="number"
                value={percentInput}
                onChange={(e) => setPercentInput(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lock Duration (months)</label>
              <select
                value={durationInput}
                onChange={(e) => setDurationInput(parseInt(e.target.value, 10))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>1 Year</option>
                <option value={24}>2 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Savings Amount</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xl font-bold text-blue-600">₦{savingsAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={setSavingsSettingsMutation.isPending}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {setSavingsSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>

          {setSavingsSettingsMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {setSavingsSettingsMutation.error?.message || 'Failed to save settings'}
            </p>
          )}

          {isLocked && (
            <p className="mt-4 text-sm text-gray-600">
              This cycle's savings are locked{unlockDate ? ` until ${unlockDate}` : ''}. Changes you save now apply from next cycle.
            </p>
          )}

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Freed Up Savings</h4>
            <p className="text-2xl font-bold text-yellow-600">₦0</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Savings;