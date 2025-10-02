import React, { createContext, useState, useContext, useEffect } from 'react';
import { customerAPI, tradespeopleAPI } from '../services/api';
import { useAuth } from './AuthContext';

const JobContext = createContext();

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Load jobs from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadJobs();
    }
  }, [isAuthenticated, user]);

  const loadJobs = async () => {
    try {
      if (!user) return;

      let data;
      if (user.role === 'customer') {
        data = await customerAPI.getJobs();
      } else if (user.role === 'tradesperson') {
        data = await tradespeopleAPI.getJobs();
      }

      if (data && data.success) {
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const createJob = async (jobData) => {
    try {
      const data = await customerAPI.createJob(jobData);
      
      if (data.success) {
        setJobs(prevJobs => [data.job, ...prevJobs]);
        return data.job;
      }
      
      throw new Error(data.message || 'Failed to create job');
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  };

  const updateJob = async (jobId, updates) => {
    try {
      // Update locally first for immediate UI feedback
      setJobs(prevJobs => 
        prevJobs.map(job => (job._id === jobId ? { ...job, ...updates } : job))
      );
      
      // Then refresh from backend to ensure consistency
      await loadJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      // Reload jobs on error to revert optimistic update
      await loadJobs();
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await customerAPI.cancelJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };

  const getJobsByCustomer = (customerId) => {
    return jobs.filter(job => {
      const jobCustomerId = typeof job.customerId === 'object' ? job.customerId._id : job.customerId;
      return jobCustomerId === customerId;
    });
  };

  const getJobsForTradesperson = () => {
    return jobs;
  };

  const acceptJob = async (jobId) => {
    try {
      const data = await tradespeopleAPI.acceptJob(jobId);
      
      if (data.success) {
        setJobs(prevJobs => 
          prevJobs.map(job => (job._id === jobId ? data.job : job))
        );
        return data.job;
      }
      
      throw new Error(data.message || 'Failed to accept job');
    } catch (error) {
      console.error('Error accepting job:', error);
      throw error;
    }
  };

  const startJob = async (jobId) => {
    try {
      const data = await tradespeopleAPI.startJob(jobId);
      
      if (data.success) {
        setJobs(prevJobs => 
          prevJobs.map(job => (job._id === jobId ? data.job : job))
        );
        return data.job;
      }
      
      throw new Error(data.message || 'Failed to start job');
    } catch (error) {
      console.error('Error starting job:', error);
      throw error;
    }
  };

  const completeJob = async (jobId, completionData) => {
    try {
      const data = await tradespeopleAPI.completeJob(jobId, completionData);
      
      if (data.success) {
        setJobs(prevJobs => 
          prevJobs.map(job => (job._id === jobId ? data.job : job))
        );
        return data.job;
      }
      
      throw new Error(data.message || 'Failed to complete job');
    } catch (error) {
      console.error('Error completing job:', error);
      throw error;
    }
  };

  const clearAllJobs = async () => {
    setJobs([]);
  };

  const value = {
    jobs,
    createJob,
    updateJob,
    deleteJob,
    getJobsByCustomer,
    getJobsForTradesperson,
    acceptJob,
    startJob,
    completeJob,
    clearAllJobs,
    refreshJobs: loadJobs,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

