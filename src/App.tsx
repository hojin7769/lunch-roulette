import { useState, useEffect } from 'react';
import Roulette from './components/Roulette';
import HistoryList from './components/HistoryList';
import type { DayOfWeek } from './components/HistoryList';
import CategoryManager from './components/CategoryManager';
import type { Category } from './components/CategoryManager';
import './App.css';

const MAX_RESPINS = 3;

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

  const [reSpinsRemaining, setReSpinsRemaining] = useState<number>(() => {
    const saved = localStorage.getItem('lunch-respins');
    return saved ? parseInt(saved, 10) : MAX_RESPINS;
  });

  const [lastSpinDate, setLastSpinDate] = useState<string>(() => {
    return localStorage.getItem('lunch-last-date') || new Date().toDateString();
  });

  // State: Flow Control
  const [step, setStep] = useState<'CATEGORY' | 'ITEM'>('CATEGORY');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

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
    resetFlow();
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

  // Derived Data for Roulette
  const rouletteItems = step === 'CATEGORY'
    ? categories.map(c => c.name)
    : (selectedCategory?.items || []);

  if (isManaging) {
    return (
      <div className="app-container">
        <CategoryManager
          categories={categories}
          onUpdateCategories={handleUpdateCategories}
          onClose={() => setIsManaging(false)}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Lunch Roulette 🎰</h1>
        <p>
          {step === 'CATEGORY' ? "First, pick a category!" : `Now, spinning for ${selectedCategory?.name}!`}
        </p>
        <div className="status-bar">
          {currentDay && <span className="today-badge">Today is {currentDay}</span>}
          <span className="respin-badge">Re-spins left: {reSpinsRemaining}</span>
          <button className="manage-btn" onClick={() => setIsManaging(true)}>Manage Menu</button>
        </div>
      </header>

      <main className="main-content">
        <div className="roulette-section">
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
        <div className="list-section">
          <HistoryList
            weeklyHistory={weeklyHistory}
            currentDay={currentDay || 'Mon'}
          />
        </div>
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
