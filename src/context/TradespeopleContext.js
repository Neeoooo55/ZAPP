import React, { createContext, useState, useContext, useEffect } from 'react';
import { tradespeopleAPI } from '../services/api';
import { useAuth } from './AuthContext';

const TradespeopleContext = createContext();

export const useTradespeople = () => {
  const context = useContext(TradespeopleContext);
  if (!context) {
    throw new Error('useTradespeople must be used within a TradespeopleProvider');
  }
  return context;
};

export const TradespeopleProvider = ({ children }) => {
  const [tradespeople, setTradespeople] = useState([]);
  const { user, isAuthenticated } = useAuth();

  const loadTradespeople = async (trade = 'all', lat = null, lng = null) => {
    try {
      const data = await tradespeopleAPI.getAvailable(trade, lat, lng);
      
      if (data && data.success) {
        setTradespeople(data.tradespeople || []);
      }
    } catch (error) {
      console.error('Error loading tradespeople:', error);
    }
  };

  const registerTradesperson = async (tradespersonData) => {
    // Registration is now handled through the auth register flow
    // This method is kept for compatibility but redirects to proper registration
    console.log('Tradesperson registration should use AuthContext.register with role="tradesperson"');
    return null;
  };

  const updateTradesperson = async (tradespersonId, updates) => {
    try {
      // This should use the tradesperson profile update endpoint
      const data = await tradespeopleAPI.updateProfile(updates);
      
      if (data && data.success) {
        // Update local state
        setTradespeople(prev => 
          prev.map(tp => (tp._id === tradespersonId ? data.profile : tp))
        );
        return data.profile;
      }
      
      throw new Error(data?.message || 'Failed to update tradesperson');
    } catch (error) {
      console.error('Error updating tradesperson:', error);
      throw error;
    }
  };

  const getTradespeopleByTrade = async (trade, lat = null, lng = null) => {
    try {
      const data = await tradespeopleAPI.getAvailable(trade, lat, lng);
      
      if (data && data.success) {
        return data.tradespeople || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting tradespeople by trade:', error);
      return [];
    }
  };

  const clearAllTradespeople = async () => {
    setTradespeople([]);
  };

  const value = {
    tradespeople,
    registerTradesperson,
    updateTradesperson,
    getTradespeopleByTrade,
    clearAllTradespeople,
    refreshTradespeople: loadTradespeople,
  };

  return (
    <TradespeopleContext.Provider value={value}>
      {children}
    </TradespeopleContext.Provider>
  );
};

