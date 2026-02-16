import React, { useState } from 'react';
import { AppSettings, FinalSlideType } from '../types';

interface SettingsViewProps {
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const SettingsView: React.FC<SettingsViewProps> = ({ currentSettings, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AppSettings>(currentSettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'countdownDurationMinutes' || name === 'autoStartDay' || name === 'autoStartHour' || name === 'autoStartMinute') {
        setFormData(prev => ({
          ...prev,
          [name]: parseInt(value, 10)
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          finalSlideContent: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8 overflow-y-auto">
      <div className="max-w-xl w-full bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 my-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Presentation Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Countdown Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Countdown Duration (Minutes)</label>
            <input
              type="number"
              name="countdownDurationMinutes"
              min="1"
              max="60"
              value={formData.countdownDurationMinutes}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-xl font-semibold mb-4 text-blue-300">Auto-Start Automation</h3>
            
            {/* Day of Week */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Day of Week</label>
              <select
                name="autoStartDay"
                value={formData.autoStartDay}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index}>{day}</option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hour (0-23)</label>
                <input
                  type="number"
                  name="autoStartHour"
                  min="0"
                  max="23"
                  value={formData.autoStartHour}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">17 = 5 PM</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Minute (0-59)</label>
                <input
                  type="number"
                  name="autoStartMinute"
                  min="0"
                  max="59"
                  value={formData.autoStartMinute}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-xl font-semibold mb-4 text-green-400">Final Slide Configuration</h3>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Slide Type</label>
                <select
                    name="finalSlideType"
                    value={formData.finalSlideType}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="black">Black Screen (Default)</option>
                    <option value="text">Custom Text</option>
                    <option value="image">Custom Image</option>
                </select>
            </div>

            {formData.finalSlideType === 'text' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Text Content</label>
                    <textarea
                        name="finalSlideContent"
                        rows={3}
                        value={formData.finalSlideContent}
                        onChange={handleChange}
                        className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter text to display..."
                    />
                </div>
            )}

            {formData.finalSlideType === 'image' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Upload Image</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full bg-black border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {formData.finalSlideContent && (
                        <div className="mt-2">
                             <p className="text-xs text-green-500 mb-1">Preview:</p>
                             <img src={formData.finalSlideContent} alt="Preview" className="h-20 object-contain border border-gray-700" />
                        </div>
                    )}
                </div>
            )}

          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold shadow-lg"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};