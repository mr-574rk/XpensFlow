// src/App.jsx - Fixed state synchronization
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, PieChart, List, Settings } from 'lucide-react';
import { AppProvider } from './context/AppProvider';
import { useApp } from './context/useApp';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Settings as SettingsPage } from './pages/Settings';
import { TransactionForm } from './components/TransactionForm';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { OnboardingWizard } from './components/OnboardingWizard';
import { useToast } from './hooks/useToast';
import { AppLockScreen } from './components/AppLockScreen';

const AppContent = () => {
  const {
    currentView,
    loading,
    transactions,
    budgets,
    darkMode,
    isOnline,
    encryptionEnabled,
    toast,
    showToast,
    setView,
    toggleTheme,
    addTransaction,
    deleteTransaction,
    setBudget,
    exportData,
    importData,
    setupEncryption,
    unlockEncryption,
    saveOnboardingData,
    calculateFinancialScore,
    databaseManager,
    dbInitialized,
    securityManager,
    lockApp
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { success, error: errorToast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Track if app should be locked - use ref for immediate updates
  const [shouldShowLockScreen, setShouldShowLockScreen] = useState(true);
  const securityStateRef = useRef(null);

  // Real-time security state check with polling
  useEffect(() => {
    if (!securityManager || !encryptionEnabled) {
      setShouldShowLockScreen(false);
      return;
    }

    const checkSecurityState = () => {
      const currentState = securityManager.getState();

      // Only update if state actually changed
      if (JSON.stringify(currentState) !== JSON.stringify(securityStateRef.current)) {
        securityStateRef.current = currentState;

        const shouldLock = !currentState.isInitialized || currentState.isLocked;
        console.log('Security state changed:', {
          previous: securityStateRef.current,
          current: currentState,
          shouldShowLockScreen: shouldLock
        });

        setShouldShowLockScreen(shouldLock);
      }
    };

    // Initial check
    checkSecurityState();

    // Poll for changes (since security manager doesn't emit events)
    const interval = setInterval(checkSecurityState, 500);

    return () => clearInterval(interval);
  }, [securityManager, encryptionEnabled]);

  // Enhanced unlock function that forces state update
  const handleUnlockEncryption = async (pin) => {
    console.log('Unlock attempt with PIN');
    const result = await unlockEncryption(pin);

    if (result && result.success) {
      console.log('Unlock successful, forcing state update');
      // Force immediate state check
      if (securityManager) {
        const newState = securityManager.getState();
        setShouldShowLockScreen(!newState.isInitialized || newState.isLocked);
      }
      return result;
    }

    return result;
  };

  // Check if onboarding was completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!dbInitialized || onboardingChecked) {
        return;
      }

      try {
        setIsCheckingOnboarding(true);
        const settings = await databaseManager.getAll('settings');
        const onboardingCompleted = settings.find(s => s.key === 'onboarding_completed');

        if (!onboardingCompleted) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }

        setOnboardingChecked(true);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setShowOnboarding(false);
        setOnboardingChecked(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [dbInitialized, databaseManager, onboardingChecked]);

  const handleOnboardingComplete = async (setupData) => {
    try {
      console.log('Completing onboarding with data:', setupData);
      const result = await saveOnboardingData(setupData);

      if (result && result.success) {
        console.log('Onboarding saved successfully');
        setShowOnboarding(false);
        success('Setup completed successfully!');
      } else {
        console.error('Onboarding save failed:', result);
        errorToast('Failed to save setup: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      errorToast('Failed to complete setup: ' + error.message);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      console.log('Skipping onboarding');
      if (databaseManager && databaseManager.isInitialized) {
        await databaseManager.put('settings', {
          key: 'onboarding_completed',
          value: true,
          timestamp: new Date().toISOString()
        });
        console.log('Onboarding skip saved');
      }
      setShowOnboarding(false);
      setOnboardingChecked(true);
    } catch (error) {
      console.error('Failed to save skip status:', error);
      setShowOnboarding(false);
      setOnboardingChecked(true);
    }
  };

  // Keyboard shortcuts - only when unlocked
  useKeyboardShortcuts({
    ADD_TRANSACTION: () => !shouldShowLockScreen && setShowForm(true),
    TOGGLE_THEME: toggleTheme,
    GOTO_DASHBOARD: () => !shouldShowLockScreen && setView('dashboard'),
    GOTO_TRANSACTIONS: () => !shouldShowLockScreen && setView('transactions'),
    GOTO_SETTINGS: () => !shouldShowLockScreen && setView('settings'),
    LOCK_APP: () => encryptionEnabled && lockApp()
  });

  // Show lock screen if app should be locked
  if (encryptionEnabled && shouldShowLockScreen) {
    console.log('🔒 Showing lock screen - security state:', securityStateRef.current);
    return (
      <AppLockScreen
        onUnlockSuccess={() => {
          console.log('Unlock success callback received');
          // Force immediate re-render with updated state
          if (securityManager) {
            const newState = securityManager.getState();
            setShouldShowLockScreen(!newState.isInitialized || newState.isLocked);
          }
        }}
      />
    );
  }

  // Show loading screen while initializing
  if (loading || !dbInitialized) {
    return <LoadingScreen message="Initializing ExpenseFlow..." />;
  }

  // Show loading screen while checking onboarding
  if (isCheckingOnboarding) {
    return <LoadingScreen message="Loading your settings..." />;
  }

  // Show onboarding if needed (outside of lock screen)
  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  console.log('🎉 Rendering main app - unlocked and ready!');

  // Main app content when unlocked
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed top-20 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 z-50 max-w-sm">
          <h3 className="font-bold mb-2">Debug Info</h3>
          <div className="text-sm space-y-1">
            <p>Transactions: {transactions.length}</p>
            <p>Budgets: {Object.keys(budgets).length}</p>
            <p>Online: {isOnline ? 'Yes' : 'No'}</p>
            <p>Encrypted: {encryptionEnabled ? 'Yes' : 'No'}</p>
            <p>DB Init: {dbInitialized ? 'Yes' : 'No'}</p>
            <p>Lock Screen: {shouldShowLockScreen ? 'Shown' : 'Hidden'}</p>
            <p>Security State: {securityManager ? JSON.stringify(securityManager.getState()) : 'N/A'}</p>
            <button
              onClick={() => setShowDebug(false)}
              className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-xs w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">💸</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ExpenseFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Offline-First Finance Tracker
            </div>
            {encryptionEnabled && (
              <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                🔒 Secured
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Offline Indicator */}
      <OfflineIndicator isOnline={isOnline} />

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', icon: PieChart, label: 'Dashboard' },
              { id: 'transactions', icon: List, label: 'Transactions' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(({ id, icon: IconComponent, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${currentView === id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <IconComponent size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {currentView === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            calculateFinancialScore={calculateFinancialScore}
          />
        )}
        {currentView === 'transactions' && (
          <Transactions
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        )}
        {currentView === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition hover:scale-110 z-40 active:scale-95"
        title="Add Transaction"
        aria-label="Add new transaction"
      >
        <PlusCircle size={32} />
      </button>

      {/* Quick Help Tooltip */}
      <div className="fixed bottom-6 left-6 bg-gray-800 text-white text-xs p-2 rounded-lg opacity-70 hover:opacity-100 transition">
        Press Ctrl+K to add transaction
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSubmit={addTransaction}
          showToast={showToast}
        />
      )}

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;