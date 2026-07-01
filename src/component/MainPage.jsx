import React, { useState, useEffect } from 'react';
import Income from './Income.jsx';
import Savings from './Savings.jsx';
import Expenses from './Expenses.jsx';
import Budget from './Budget.jsx';
import Debt from './Debt.jsx';
import Header from './Header.jsx';
import { useLogout, useProfile } from '../hooks/auth.hook.js';
import { useSavingsSettings, useSetSavingsSettings } from '../hooks/savings.hook.js';


const MainPage = ({ onLogout }) => {
  const logoutMutation = useLogout();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();

  // Income — managed internally by Income.jsx; parent only tracks the total for budget math
  const [totalIncome, setTotalIncome] = useState(0);

  // Savings settings — now backend-owned. Savings.jsx reads `savingsSettings`
  // for its current percent/duration and edits locally before saving via
  // the mutation; MainPage just needs the resulting percent for budget math.
  const { data: savingsSettings, isLoading: savingsSettingsLoading } = useSavingsSettings();
  const setSavingsSettingsMutation = useSetSavingsSettings();
  const savingsPercent = savingsSettings?.settings?.savings_percentage ?? 0;
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [freedUpSavings, setFreedUpSavings] = useState(0);

  // Expenses state — the list itself now lives in Expenses.jsx's query
  // cache; MainPage only needs the running total for budget math, which
  // Expenses.jsx reports up via setTotalExpenses.
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Budget — still computed client-side (income minus savings); no backend
  // endpoint exposes a "budget" figure directly. Balance is no longer
  // computed here at all — it now comes straight from the backend via
  // Expenses.jsx's setBalance, since current_cycle.balance already folds
  // in balance_brought_forward server-side.
  const [budget, setBudget] = useState(0);
  const [balance, setBalance] = useState(0);

  // Debt state — currentDebt is now derived from the backend balance
  // (still just "balance went negative", same meaning as before, just
  // sourced from the real number instead of a client-only estimate).
  // lastMonthDebt snapshots it on reset, same as before.
  const [currentDebt, setCurrentDebt] = useState(0);
  const [lastMonthDebt, setLastMonthDebt] = useState(0);

  // Recalculate budget and savings from income
  useEffect(() => {
    const newSavings = (savingsPercent / 100) * totalIncome;
    setSavingsAmount(newSavings);
    const newBudget = totalIncome - newSavings;
    setBudget(newBudget);
  }, [totalIncome, savingsPercent]);

  // currentDebt tracks the backend balance going negative
  useEffect(() => {
    setCurrentDebt(balance < 0 ? -balance : 0);
  }, [balance]);

  // Reset function
  const reset = () => {
    setTotalIncome(0);
    setTotalExpenses(0);
    setSavingsAmount(0);
    setBudget(0);
    setLastMonthDebt(currentDebt);
    setCurrentDebt(0);

    console.log("Reset completed successfully");
  };

  // Monthly auto-reset
  useEffect(() => {
    const checkMonthlyReset = () => {
      const today = new Date();
      if (today.getDate() === 6) {
        reset();
      }
    };

    const interval = setInterval(checkMonthlyReset, 24 * 60 * 60 * 1000);
    checkMonthlyReset();

    return () => clearInterval(interval);
  }, [balance, currentDebt]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
  };

  if (profileLoading) return <div>Loading...</div>;
  if (profileError) return <div>Error: {profileError.message}</div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Header
          onReset={reset}
          onLogout={handleLogout}
          profile={profile}
        />


        <Income
          onTotalIncomeChange={setTotalIncome}
        />

        <Savings
          savingsSettings={savingsSettings}
          savingsSettingsLoading={savingsSettingsLoading}
          setSavingsSettingsMutation={setSavingsSettingsMutation}
          savingsAmount={savingsAmount}
          setFreedUpSavings={setFreedUpSavings}
        />

        <Budget
          budget={budget}
          totalExpenses={totalExpenses}
          balance={balance}
        />

        <Expenses
          setTotalExpenses={setTotalExpenses}
          setBalance={setBalance}
        />

        <Debt
          lastMonthDebt={lastMonthDebt}
        />
      </div>
    </div>)
}

export default MainPage;