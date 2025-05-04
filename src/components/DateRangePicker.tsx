'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (dates: { startDate: Date; endDate: Date }) => void;
}

const DateRangePicker = ({ startDate, endDate, onChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate || new Date());
  const [localEndDate, setLocalEndDate] = useState(endDate || new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(localStartDate));
  
  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format date for input elements
  const formatInputDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Apply date range
  const applyDateRange = () => {
    onChange({ startDate: localStartDate, endDate: localEndDate });
    setIsOpen(false);
  };
  
  // Handle month navigation
  const navigateMonth = (direction: string) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };
  
  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const date = new Date(e.target.value);
    if (type === 'start') {
      setLocalStartDate(date);
    } else {
      setLocalEndDate(date);
    }
  };
  
  // Preset date ranges
  const presets = [
    { label: 'Last 7 days', getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      return { start, end };
    }},
    { label: 'Last 30 days', getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      return { start, end };
    }},
    { label: 'This month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date();
      return { start, end };
    }},
    { label: 'Last month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end };
    }},
    { label: 'This year', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date();
      return { start, end };
    }}
  ];
  
  // Apply preset
  const applyPreset = (preset: { label?: string; getRange: any; }) => {
    const { start, end } = preset.getRange();
    setLocalStartDate(start);
    setLocalEndDate(end);
    setCurrentMonth(start);
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Generate calendar grid with padding
    const days = [];
    
    // Add empty spaces for preceding days
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  // Check if a date is in the selected range
  const isInRange = (date: Date) => {
    if (!date) return false;
    
    const time = date.getTime();
    return time >= localStartDate.getTime() && time <= localEndDate.getTime();
  };
  
  // Check if date is the start or end of range
  const isRangeEnd = (date: Date) => {
    if (!date) return false;
    return date.getTime() === localStartDate.getTime() || date.getTime() === localEndDate.getTime();
  };
  
  // Handle day selection
  const handleDayClick = (date: Date) => {
    if (!date) return;
    
    const time = date.getTime();
    
    // If start date not set or clicking earlier than current start date, set as start
    if (!localStartDate || time < localStartDate.getTime()) {
      setLocalStartDate(date);
      if (localEndDate && time > localEndDate.getTime()) {
        setLocalEndDate(date);
      }
    } 
    // If end date not set or clicking later than current end date, set as end
    else if (!localEndDate || time > localEndDate.getTime()) {
      setLocalEndDate(date);
    } 
    // If clicking between current start and end, reset range to just this date
    else {
      setLocalStartDate(date);
      setLocalEndDate(date);
    }
  };
  
  return (
    <div className="relative">
      {/* Date display button */}
      <button
        className="flex items-center w-full justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm">{formatDisplayDate(localStartDate)} - {formatDisplayDate(localEndDate)}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {/* Date picker dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-screen max-w-md bg-white rounded-lg shadow-lg z-10 border border-gray-200">
          <div className="flex flex-col md:flex-row">
            {/* Presets panel */}
            <div className="w-full md:w-1/3 border-r border-gray-200 p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h3>
              <div className="space-y-1">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-indigo-50 hover:text-indigo-700"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {/* Direct date inputs */}
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full mt-1 border border-gray-300 rounded-md text-sm p-1.5"
                    value={formatInputDate(localStartDate)}
                    onChange={(e) => handleInputChange(e, 'start')}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700">End Date</label>
                  <input 
                    type="date" 
                    className="w-full mt-1 border border-gray-300 rounded-md text-sm p-1.5"
                    value={formatInputDate(localEndDate)}
                    onChange={(e) => handleInputChange(e, 'end')}
                  />
                </div>
              </div>
            </div>
            
            {/* Calendar panel */}
            <div className="w-full md:w-2/3 p-3">
              {/* Month navigation */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  className="p-1 rounded-full hover:bg-gray-100" 
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                
                <h3 className="text-sm font-medium text-gray-700">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                
                <button 
                  className="p-1 rounded-full hover:bg-gray-100" 
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, i) => (
                  <div key={i} className="aspect-square flex justify-center items-center">
                    {day && (
                      <button
                        className={`w-full h-full flex items-center justify-center text-sm rounded-full
                          ${isRangeEnd(day) ? 'bg-indigo-600 text-white' : 
                            isInRange(day) ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                        onClick={() => handleDayClick(day)}
                      >
                        {day.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 rounded-b-lg">
            <button 
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              onClick={applyDateRange}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;