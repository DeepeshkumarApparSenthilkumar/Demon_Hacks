import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const tourService = {
  /**
   * Generate a new tour based on user preferences
   */
  async generateTour(preferences) {
    try {
      const response = await axios.post(`${API_BASE_URL}/tours/generate`, preferences);
      return response.data;
    } catch (error) {
      console.error('Error generating tour:', error);
      throw error;
    }
  },

  /**
   * Adjust an existing tour based on user feedback
   */
  async adjustTour(currentStopId, remainingMinutes, adjustmentType, adjustmentInterest, originalPreferences) {
    try {
      const response = await axios.post(`${API_BASE_URL}/tours/adjust`, {
        current_stop_id: currentStopId,
        remaining_time_minutes: remainingMinutes,
        adjustment_type: adjustmentType,
        adjustment_interest: adjustmentInterest,
        original_preferences: originalPreferences
      });
      return response.data;
    } catch (error) {
      console.error('Error adjusting tour:', error);
      throw error;
    }
  }
};

export default tourService;
