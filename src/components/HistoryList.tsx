import './HistoryList.css';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export interface HistoryItem {
    id: string;
    date: string;
    itemName: string;
    categoryName: string;
}

interface HistoryListProps {
    weeklyHistory: Record<DayOfWeek, string | null>;
    currentDay: DayOfWeek;
    fullHistory: HistoryItem[];
    onClearFullHistory: () => void;
}

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function HistoryList({ weeklyHistory, currentDay, fullHistory, onClearFullHistory }: HistoryListProps) {
    return (
        <div className="history-container">
            <div className="history-section">
                <div className="history-header">
                    <h3>Weekly Menu</h3>
                </div>
                <ul className="weekly-list">
                    {DAYS.map((day) => (
                        <li
                            key={day}
                            className={`weekly-item ${day === currentDay ? 'current-day' : ''} ${weeklyHistory[day] ? 'filled' : ''}`}
                        >
                            <span className="day-label">{day}</span>
                            <span className="history-value">
                                {weeklyHistory[day] || <span className="placeholder">-</span>}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="history-section full-history-section">
                <div className="history-header">
                    <h3>Full History</h3>
                    {fullHistory.length > 0 && (
                        <button className="clear-btn" onClick={onClearFullHistory}>Clear</button>
                    )}
                </div>
                <div className="full-history-scroll">
                    {fullHistory.length === 0 ? (
                        <p className="empty-history">No history yet.</p>
                    ) : (
                        <ul className="full-history-list">
                            {fullHistory.map((item) => (
                                <li key={item.id} className="full-history-item">
                                    <div className="history-date">{new Date(item.date).toLocaleDateString()}</div>
                                    <div className="history-details">
                                        <span className="history-food">{item.itemName}</span>
                                        <span className="history-category">{item.categoryName}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
