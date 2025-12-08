import { useState, useEffect } from 'react';
import Roulette from './components/Roulette';
import HistoryList from './components/HistoryList';
import type { DayOfWeek, HistoryItem } from './components/HistoryList';
import CategoryManager from './components/CategoryManager';
import type { Category } from './components/CategoryManager';
import './App.css';

const MAX_RESPINS = 3;

type View = 'ROULETTE' | 'HISTORY' | 'MANAGE';

function App() {
  // State: Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('lunch-categories');
    if (saved) return JSON.parse(saved);

    // Migration: Check for old flat items
    const oldItems = localStorage.getItem('lunch-items');
    const initialItems = oldItems ? JSON.parse(oldItems) : ['Burger', 'Pizza', 'Sushi', 'Salad', 'Tacos', 'Pasta'];

    return [{
      id: crypto.randomUUID(),
      name: 'General',
      items: initialItems
    }];
  });

  // State: History & Limits
  const [weeklyHistory, setWeeklyHistory] = useState<Record<DayOfWeek, string | null>>(() => {
    const saved = localStorage.getItem('lunch-weekly-history');
    return saved ? JSON.parse(saved) : { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null };
  });

  const [fullHistory, setFullHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('lunch-full-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [reSpinsRemaining, setReSpinsRemaining] = useState<number>(() => {
    const saved = localStorage.getItem('lunch-respins');
    return saved ? parseInt(saved, 10) : MAX_RESPINS;
  });

  const [lastSpinDate, setLastSpinDate] = useState<string>(() => {
    return localStorage.getItem('lunch-last-date') || new Date().toDateString();
  });

  // State: Flow Control
  const [view, setView] = useState<View>('ROULETTE');
  const [step, setStep] = useState<'CATEGORY' | 'ITEM'>('CATEGORY');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Get current day
  const getCurrentDay = (): DayOfWeek | null => {
    const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dayIndex = new Date().getDay();
    if (dayIndex >= 1 && dayIndex <= 5) return days[dayIndex - 1];
    return null;
  };
  const currentDay = getCurrentDay();

  // Effects: Persistence & Reset
  useEffect(() => {
    const today = new Date().toDateString();
    if (today !== lastSpinDate) {
      setReSpinsRemaining(MAX_RESPINS);
      setLastSpinDate(today);
      localStorage.setItem('lunch-respins', MAX_RESPINS.toString());
      localStorage.setItem('lunch-last-date', today);
    }
  }, [lastSpinDate]);

  useEffect(() => {
    localStorage.setItem('lunch-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('lunch-weekly-history', JSON.stringify(weeklyHistory));
  }, [weeklyHistory]);

  useEffect(() => {
    localStorage.setItem('lunch-full-history', JSON.stringify(fullHistory));
  }, [fullHistory]);

  useEffect(() => {
    localStorage.setItem('lunch-respins', reSpinsRemaining.toString());
  }, [reSpinsRemaining]);

  // Handlers
  const handleSpinEnd = (result: string) => {
    if (step === 'CATEGORY') {
      const category = categories.find(c => c.name === result);
      if (category) {
        setTimeout(() => {
          setSelectedCategory(category);
          setStep('ITEM');
        }, 1000); // Small delay for effect
      }
    } else {
      setWinner(result);
      setShowConfirmModal(true);
    }
  };

  const handleAccept = () => {
    if (currentDay && winner) {
      setWeeklyHistory(prev => ({ ...prev, [currentDay]: winner }));
    }

    // Add to full history regardless of day (even weekends)
    if (winner && selectedCategory) {
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        itemName: winner,
        categoryName: selectedCategory.name
      };
      setFullHistory(prev => [newHistoryItem, ...prev]);
    }

    resetFlow();
    setView('HISTORY'); // Auto-switch to history on accept
  };

  const handleSpinAgain = () => {
    if (reSpinsRemaining > 0) {
      setReSpinsRemaining(prev => prev - 1);
      resetFlow();
    }
  };

  const resetFlow = () => {
    setShowConfirmModal(false);
    setWinner(null);
    setSelectedCategory(null);
    setStep('CATEGORY');
  };

  const handleUpdateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  const handleClearFullHistory = () => {
    if (confirm('Are you sure you want to clear your entire history?')) {
      setFullHistory([]);
    }
  };

  // Derived Data for Roulette
  const rouletteItems = step === 'CATEGORY'
    ? categories.map(c => c.name)
    : (selectedCategory?.items || []);

  const isTodayLocked = currentDay && weeklyHistory[currentDay];

  const renderContent = () => {
    switch (view) {
      case 'MANAGE':
        return (
          <CategoryManager
            categories={categories}
            onUpdateCategories={handleUpdateCategories}
            onClose={() => setView('ROULETTE')}
          />
        );
      case 'HISTORY':
        return (
          <div className="history-view">
            <HistoryList
              weeklyHistory={weeklyHistory}
              currentDay={currentDay || 'Mon'}
              fullHistory={fullHistory}
              onClearFullHistory={handleClearFullHistory}
            />
          </div>
        );
      case 'ROULETTE':
      default:
        if (isTodayLocked) {
          return (
            <div className="locked-state">
              <h2>Today's Lunch is Set!</h2>
              <div className="locked-winner">{weeklyHistory[currentDay]}</div>
              <p>Come back tomorrow for a new spin!</p>
              <button onClick={() => setView('HISTORY')}>View History</button>
            </div>
          );
        }

        return (
          <div className="roulette-section">
            <p className="instruction-text">
              {step === 'CATEGORY' ? "First, pick a category!" : `Now, spinning for ${selectedCategory?.name}!`}
            </p>
            {rouletteItems.length > 0 ? (
              <Roulette
                key={step === 'CATEGORY' ? 'cat' : selectedCategory?.id} // Force remount on step change
                items={rouletteItems}
                onSpinEnd={handleSpinEnd}
              />
            ) : (
              <div className="empty-state">
                <p>No items in this category!</p>
                <button onClick={resetFlow}>Go Back</button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Lunch Roulette 🎰</h1>
        <div className="status-bar">
          {currentDay && <span className="today-badge">Today is {currentDay}</span>}
          <span className="respin-badge">Re-spins left: {reSpinsRemaining}</span>
        </div>
      </header>

      <nav className="main-nav">
        <button
          className={`nav-btn ${view === 'ROULETTE' ? 'active' : ''}`}
          onClick={() => setView('ROULETTE')}
        >
          Roulette
        </button>
        <button
          className={`nav-btn ${view === 'HISTORY' ? 'active' : ''}`}
          onClick={() => setView('HISTORY')}
        >
          History
        </button>
        <button
          className={`nav-btn ${view === 'MANAGE' ? 'active' : ''}`}
          onClick={() => setView('MANAGE')}
        >
          Manage
        </button>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>

      {showConfirmModal && winner && (
        <div className="modal-overlay">
          <div className="winner-modal">
            <h2>You got...</h2>
            <div className="winner-name">{winner}</div>
            <p className="category-label">({selectedCategory?.name})</p>

            <div className="modal-actions">
              <button
                className="accept-btn"
                onClick={handleAccept}
                disabled={!currentDay}
              >
                {currentDay ? 'Accept & Save' : 'Accept (Weekend)'}
              </button>

              <button
                className="respin-btn"
                onClick={handleSpinAgain}
                disabled={reSpinsRemaining <= 0}
              >
                Spin Again ({reSpinsRemaining} left)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
