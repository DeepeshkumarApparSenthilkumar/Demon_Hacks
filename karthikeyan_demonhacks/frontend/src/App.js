import React, { useState } from 'react';
import './App.css';
import PremiumPreferenceForm from './components/PremiumPreferenceForm';
import PremiumTourDisplay from './components/PremiumTourDisplay';

function App() {
  const [currentPage, setCurrentPage] = useState('form'); // 'form' or 'tour'
  const [tourData, setTourData] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

  const handleTourGenerated = (tour, preferences) => {
    setTourData(tour);
    setUserPreferences(preferences);
    setCurrentPage('tour');
  };

  const handleBackToForm = () => {
    setCurrentPage('form');
    setTourData(null);
  };

  return (
    <div className="app">
      {currentPage === 'form' ? (
        <PremiumPreferenceForm onTourGenerated={handleTourGenerated} />
      ) : (
        <PremiumTourDisplay 
          tour={tourData} 
          preferences={userPreferences}
          onBackToForm={handleBackToForm} 
        />
      )}
    </div>
  );
}

export default App;
