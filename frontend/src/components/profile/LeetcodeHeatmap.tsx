import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface HeatmapProps {
  data: Record<string, number>;
  longestStreak: number;
}

export default function LeetcodeHeatmap({ data = {}, longestStreak }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });

  const currentActualYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>('Current');

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  };

  const formatDate = (date: Date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Generate the days based on the selected year
  const days = useMemo(() => {
    const generatedDays = [];
    if (selectedYear === 'Current') {
      const today = new Date();
      // Use UTC to align with backend streaks and avoid timezone shift bugs
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      
      for (let i = 364; i >= 0; i--) {
        const d = new Date(todayUTC);
        d.setUTCDate(todayUTC.getUTCDate() - i);
        generatedDays.push(d);
      }
    } else {
      const year = parseInt(selectedYear, 10);
      const startDate = new Date(Date.UTC(year, 0, 1)); // Jan 1 in UTC
      const endDate = new Date(Date.UTC(year, 11, 31)); // Dec 31 in UTC
      
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        generatedDays.push(new Date(currentDate));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    }
    return generatedDays;
  }, [selectedYear]);

  const totalVideos = useMemo(() => {
    return days.reduce((acc, date) => {
      const dateStr = formatDate(date);
      return acc + (data[dateStr] || 0);
    }, 0);
  }, [data, days]);

  const totalActiveDays = useMemo(() => {
    return days.filter(date => {
      const dateStr = formatDate(date);
      return (data[dateStr] || 0) > 0;
    }).length;
  }, [data, days]);

  // Group by Month, breaking weeks across month boundaries
  const monthsData = useMemo(() => {
    const dataGroups: { name: string, weeks: (Date | null)[][] }[] = [];
    let currentMonthIndex = -1;
    let currentMonthName = '';
    let currentWeek: (Date | null)[] = Array(7).fill(null);

    days.forEach(date => {
      // Use UTC methods for consistent grouping
      const monthName = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
      const dayOfWeek = date.getUTCDay(); // 0 (Sun) to 6 (Sat)
      
      if (monthName !== currentMonthName) {
        if (currentMonthIndex !== -1 && currentWeek.some(d => d !== null)) {
          dataGroups[currentMonthIndex].weeks.push([...currentWeek]);
        }
        
        currentMonthName = monthName;
        dataGroups.push({ name: monthName, weeks: [] });
        currentMonthIndex++;
        
        currentWeek = Array(7).fill(null);
      }
      
      currentWeek[dayOfWeek] = date;
      
      if (dayOfWeek === 6) {
        dataGroups[currentMonthIndex].weeks.push([...currentWeek]);
        currentWeek = Array(7).fill(null);
      }
    });
    
    if (currentWeek.some(d => d !== null)) {
      dataGroups[currentMonthIndex].weeks.push([...currentWeek]);
    }

    return dataGroups;
  }, [days]);

  return (
    <>
      <div style={{
        marginTop: '24px',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* LeetCode Header Stats */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 500, marginRight: '6px' }}>{totalVideos}</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              videos watched {selectedYear === 'Current' ? 'in the past one year' : `in ${selectedYear}`}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '20px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Total active days: </span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{totalActiveDays}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Max streak: </span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{longestStreak}</span>
            </div>
            
            {/* Year Selection Dropdown */}
            <select 
              aria-label="Activity year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-muted)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'auto'
              }}
            >
              <option value="Current">Current</option>
              <option value={currentActualYear - 1}>{currentActualYear - 1}</option>
              <option value={currentActualYear - 2}>{currentActualYear - 2}</option>
              <option value={currentActualYear - 3}>{currentActualYear - 3}</option>
            </select>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {monthsData.map((month, mIndex) => (
              <div key={mIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {month.weeks.map((week, wIndex) => (
                    <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {week.map((date, dIndex) => {
                        if (!date) {
                          return <div key={dIndex} style={{ width: '10px', height: '10px' }} />;
                        }
                        const dateStr = formatDate(date);
                        const count = data[dateStr] || 0;
                        const intensity = getIntensity(count);
                        
                        return (
                          <button 
                            key={dateStr}
                            aria-label={`${count} video${count !== 1 ? 's' : ''} watched on ${dateStr}`}
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '2px',
                              backgroundColor: `var(--heatmap-${intensity})`,
                              cursor: 'pointer',
                              transition: 'opacity 0.2s',
                              border: 'none',
                              padding: 0,
                              display: 'block'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.7';
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({
                                visible: true,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 6,
                                content: `${count} video${count !== 1 ? 's' : ''} watched on ${dateStr}`
                              });
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                              setTooltip(prev => ({ ...prev, visible: false }));
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.opacity = '0.7';
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({
                                visible: true,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 6,
                                content: `${count} video${count !== 1 ? 's' : ''} watched on ${dateStr}`
                              });
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.opacity = '1';
                              setTooltip(prev => ({ ...prev, visible: false }));
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{month.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Custom Tooltip via Portal */}
      {tooltip.visible && createPortal(
        <div 
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--bg-base)',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            pointerEvents: 'none',
            zIndex: 99999,
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {tooltip.content}
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '4px 4px 0 4px',
            borderStyle: 'solid',
            borderColor: 'var(--text-primary) transparent transparent transparent',
          }} />
        </div>,
        document.body
      )}
    </>
  );
}
