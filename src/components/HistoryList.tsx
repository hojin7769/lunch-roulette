import './HistoryList.css';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

interface HistoryListProps {
    weeklyHistory: Record<DayOfWeek, string | null>;
    currentDay: DayOfWeek;
}

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function HistoryList({ weeklyHistory, currentDay }: HistoryListProps) {
    return (
        <div className="history-container">
            <div className="history-header">
                <h3>Weekly Menu</h3>
            </div>
            <ul className="history-list">
                {DAYS.map((day) => (
                    <li
                        key={day}
                        className={`history-item ${day === currentDay ? 'current-day' : ''} ${weeklyHistory[day] ? 'filled' : ''}`}
                    >
                        <span className="day-label">{day}</span>
                        <span className="history-value">
                            {weeklyHistory[day] || <span className="placeholder">-</span>}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
