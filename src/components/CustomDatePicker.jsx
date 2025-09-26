import React, { useState, useRef, useEffect } from 'react';

function CustomDatePicker({ value, onChange, required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || '');
  const [displayValue, setDisplayValue] = useState(value || '');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setDisplayValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Generate calendar data
  const generateCalendar = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getCurrentDate = () => {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  };

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [day, month, year] = selectedDate.split('/');
      return { year: parseInt(year), month: parseInt(month) };
    }
    return getCurrentDate();
  });

  const handleDateSelect = (day) => {
    const newDate = `${day.toString().padStart(2, '0')}/${currentMonth.month.toString().padStart(2, '0')}/${currentMonth.year}`;
    setSelectedDate(newDate);
    setDisplayValue(newDate);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleManualInput = (e) => {
    const value = e.target.value;
    setDisplayValue(value);
    
    // Validate and format as user types
    const formatted = formatDateInput(value);
    if (formatted !== value) {
      setDisplayValue(formatted);
      setSelectedDate(formatted);
      onChange(formatted);
    }
  };

  const formatDateInput = (value) => {
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 4) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
    } else {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4, 8)}`;
    }
  };

  const handleBlur = () => {
    if (displayValue && displayValue.length === 10) {
      const [day, month, year] = displayValue.split('/');
      if (day && month && year) {
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        // Validate date
        const date = new Date(yearNum, monthNum - 1, dayNum);
        if (date.getDate() === dayNum && date.getMonth() === monthNum - 1 && date.getFullYear() === yearNum) {
          setSelectedDate(displayValue);
          onChange(displayValue);
        } else {
          setDisplayValue(selectedDate);
        }
      }
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      
      return { year: newYear, month: newMonth };
    });
  };

  const isToday = (day) => {
    const today = getCurrentDate();
    return day === today.day && 
           currentMonth.month === today.month && 
           currentMonth.year === today.year;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const [selectedDay, selectedMonth, selectedYear] = selectedDate.split('/');
    return day.toString() === selectedDay && 
           currentMonth.month.toString() === selectedMonth && 
           currentMonth.year.toString() === selectedYear;
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const calendarDays = generateCalendar(currentMonth.year, currentMonth.month);

  return (
    <div className="custom-date-picker" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleManualInput}
        placeholder="dd/mm/yyyy"
        required={required}
        style={{
          padding: '12px 16px',
          border: '2px solid #d1d5db',
          borderRadius: '10px',
          fontSize: '16px',
          outline: 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          background: '#fff',
          width: '100%'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#2563eb';
          e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
          setIsOpen(true);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = 'none';
          handleBlur();
        }}
      />
      
      {isOpen && (
        <div className="date-picker-dropdown" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              ‹
            </button>
            <span style={{ fontWeight: '600', fontSize: '16px' }}>
              {monthNames[currentMonth.month - 1]} {currentMonth.year}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            background: '#e5e7eb'
          }}>
            {dayNames.map(day => (
              <div key={day} style={{
                padding: '8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                background: '#f9fafb',
                color: '#374151'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            background: '#e5e7eb',
            padding: '1px'
          }}>
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                style={{
                  padding: '12px 8px',
                  border: 'none',
                  background: day ? '#fff' : 'transparent',
                  cursor: day ? 'pointer' : 'default',
                  fontSize: '14px',
                  borderRadius: '4px',
                  fontWeight: isToday(day) ? '600' : 'normal',
                  backgroundColor: day 
                    ? (isSelected(day) ? '#2563eb' : (isToday(day) ? '#f3f4f6' : '#fff'))
                    : 'transparent',
                  color: day 
                    ? (isSelected(day) ? '#fff' : '#111827')
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (day && !isSelected(day)) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (day && !isSelected(day)) {
                    e.target.style.backgroundColor = isToday(day) ? '#f3f4f6' : '#fff';
                  }
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDatePicker;
