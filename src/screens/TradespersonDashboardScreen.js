import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';
import colors from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useTradespeople } from '../context/TradespeopleContext';
import { tradespeopleAPI } from '../services/api';

const TradespersonDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { jobs: contextJobs, acceptJob, startJob, completeJob, deleteJob, refreshJobs } = useJobs();
  const { tradespeople, updateTradesperson } = useTradespeople();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const loadJobs = async () => {
    try {
      // Load from shared context
      await refreshJobs();
    } catch (error) {
      console.log('Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sync local jobs state with context whenever it changes
  useEffect(() => {
    setJobs(contextJobs);
  }, [contextJobs]);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [])
  );

  // Update timer every second for in-progress jobs
  useEffect(() => {
    const hasInProgressJobs = jobs.some(j => j.status === 'in_progress');
    
    if (hasInProgressJobs) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [jobs]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  // Calculate elapsed time for a job
  const getElapsedTime = (job) => {
    if (!job.timeline?.startedAt) return null;
    
    const start = new Date(job.timeline.startedAt).getTime();
    const now = currentTime;
    const diffMs = now - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalHours: diffMs / (1000 * 60 * 60) };
  };

  // Calculate final cost based on urgency and time worked
  const calculateFinalCost = (job, hoursWorked) => {
    const hours = parseFloat(hoursWorked);
    const hourlyRate = 75; // Standard rate
    
    if (job.urgency === 'emergency') {
      // Emergency: $150 flat fee + hourly rate
      const emergencyFee = 150;
      const hourlyCharge = hourlyRate * hours;
      const subtotal = emergencyFee + hourlyCharge;
      const platformFee = subtotal * 0.1;
      return {
        subtotal,
        platformFee,
        total: subtotal + platformFee,
        breakdown: `$${emergencyFee} emergency fee + $${hourlyCharge.toFixed(2)} (${hours.toFixed(2)}hrs × $${hourlyRate}/hr)`,
      };
    } else {
      // Standard/Urgent: hourly rate
      const subtotal = hourlyRate * hours;
      const platformFee = subtotal * 0.1;
      return {
        subtotal,
        platformFee,
        total: subtotal + platformFee,
      };
    }
  };

  const activeJobs = jobs.filter((j) =>
    ['accepted', 'in_progress'].includes(j.status)
  );
  const pendingJobs = jobs.filter((j) => j.status === 'pending');
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  const getStatusColor = (status) => {
    const colors_map = {
      pending: colors.warning,
      accepted: colors.info,
      in_progress: colors.primary,
      completed: colors.success,
      cancelled: colors.error,
    };
    return colors_map[status] || colors.textMuted;
  };

  const getTradeIcon = (trade) => {
    const icons = {
      plumbing: 'water',
      electrical: 'flash',
      hvac: 'thermometer',
      carpentry: 'hammer',
      painting: 'brush',
      general: 'construct',
    };
    return icons[trade] || 'construct';
  };

  const handleStartJob = async (jobId) => {
    Alert.alert(
      'Start Job',
      'Are you ready to start this job? The timer will start.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Timer',
          onPress: async () => {
            try {
              await startJob(jobId);
              Alert.alert('Timer Started', 'Job timer is now running');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to start job');
            }
          },
        },
      ]
    );
  };

  const handleCompleteJobPress = (job) => {
    setSelectedJob(job);
    
    // Check if it's a fixed-price job
    if (job.pricingType === 'fixed') {
      setFixedAmount('');
      setHoursWorked('');
    } else {
      // Auto-calculate hours from timer for hourly/emergency jobs
      const elapsed = getElapsedTime(job);
      if (elapsed) {
        setHoursWorked(elapsed.totalHours.toFixed(2));
      } else {
        setHoursWorked('');
      }
      setFixedAmount('');
    }
    
    setCompletionNotes('');
    setCompletionModalVisible(true);
  };

  const handleCompleteJobSubmit = async () => {
    const isFixedPrice = selectedJob.pricingType === 'fixed';
    
    // Validate inputs based on pricing type
    if (isFixedPrice) {
      if (!fixedAmount || parseFloat(fixedAmount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }
    } else {
      if (!hoursWorked || parseFloat(hoursWorked) <= 0) {
        Alert.alert('Error', 'Please enter valid hours worked');
        return;
      }
    }

    try {
      let finalCost;
      let completionData;
      
      if (isFixedPrice) {
        // For fixed-price jobs, calculate based on entered amount
        const amount = parseFloat(fixedAmount);
        const platformFee = amount * 0.1;
        finalCost = {
          subtotal: amount,
          platformFee: platformFee,
          total: amount + platformFee,
          breakdown: 'Fixed price quote',
        };
        
        completionData = {
          actualCost: finalCost.total,
          fixedAmount: amount,
          notes: completionNotes.trim() || 'Fixed price job completed',
        };
      } else {
        // For hourly/emergency jobs, calculate based on hours
        finalCost = calculateFinalCost(selectedJob, hoursWorked);
        
        completionData = {
          actualCost: finalCost.total,
          hoursWorked: parseFloat(hoursWorked),
          notes: completionNotes.trim() || `Completed in ${hoursWorked} hours`,
        };
      }
      
      await completeJob(selectedJob._id, completionData);
      setCompletionModalVisible(false);
      
      Alert.alert(
        'Job Completed!', 
        `Total charge: $${finalCost.total.toFixed(2)}\n${finalCost.breakdown || ''}`
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete job');
    }
  };

  const handleAcceptJob = async (jobId) => {
    Alert.alert(
      'Accept Job',
      'Do you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await acceptJob(jobId);
              Alert.alert('Success', 'Job accepted successfully');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to accept job');
            }
          },
        },
      ]
    );
  };

  const handleDeclineJob = async (jobId) => {
    Alert.prompt(
      'Decline Job',
      'Please provide a reason (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              await deleteJob(jobId);
              Alert.alert('Success', 'Job declined');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to decline job');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleOpenWebPortal = async () => {
    const portalUrl = 'http://localhost:3000/portal';
    try {
      const supported = await Linking.canOpenURL(portalUrl);
      if (supported) {
        await Linking.openURL(portalUrl);
      } else {
        Alert.alert('Error', 'Cannot open web portal. Please check your connection.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open web portal');
    }
  };

  const renderJobCard = (job) => {
    const canStart = job.status === 'accepted';
    const canComplete = job.status === 'in_progress';
    const isPending = job.status === 'pending';

    return (
      <Card key={job._id} style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleContainer}>
            <Ionicons name={getTradeIcon(job.category)} size={24} color={colors.primary} />
            <View style={styles.jobTitleText}>
              <Text style={styles.jobTitle}>{job.description?.split('\n')[0] || 'Job'}</Text>
              <Text style={styles.jobTrade}>
                {job.category?.charAt(0).toUpperCase() + job.category?.slice(1)}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
            <Text style={styles.statusText}>
              {job.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>
          {job.description}
        </Text>

        <View style={styles.jobDetails}>
          <View style={styles.jobDetail}>
            <Ionicons name="calendar" size={16} color={colors.textLight} />
            <Text style={styles.jobDetailText}>
              {new Date(job.timeline.requestedAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.jobDetail}>
            <Ionicons name="cash" size={16} color={colors.textLight} />
            <Text style={styles.jobDetailText}>
              {job.pricingType === 'fixed' && job.status !== 'completed' 
                ? 'Quote' 
                : `$${(job.estimatedCost || job.actualCost || 75).toFixed(2)}`
              }
            </Text>
          </View>
          {job.urgency && (
            <View style={styles.jobDetail}>
              <Ionicons 
                name={job.urgency === 'emergency' ? 'warning' : 'time'} 
                size={16} 
                color={job.urgency === 'emergency' ? colors.error : colors.textLight} 
              />
              <Text style={[
                styles.jobDetailText,
                job.urgency === 'emergency' && { color: colors.error, fontWeight: '600' }
              ]}>
                {job.urgency.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Customer Info */}
        {job.customerId && (
          <View style={styles.customerInfo}>
            <Ionicons name="person-circle" size={16} color={colors.info} />
            <Text style={styles.customerText}>
              {job.customerId.firstName} {job.customerId.lastName}
            </Text>
          </View>
        )}

        {/* Location */}
        {job.location?.address && (
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color={colors.textLight} />
            <Text style={styles.locationText}>
              {job.location.address}
            </Text>
          </View>
        )}

        {/* Timer Display for In-Progress Jobs */}
        {canComplete && job.timeline?.startedAt && (
          <View style={styles.timerContainer}>
            <Ionicons name="timer" size={20} color={colors.primary} />
            <View style={styles.timerInfo}>
              <Text style={styles.timerLabel}>Time Elapsed:</Text>
              {(() => {
                const elapsed = getElapsedTime(job);
                return (
                  <Text style={styles.timerText}>
                    {String(elapsed.hours).padStart(2, '0')}:
                    {String(elapsed.minutes).padStart(2, '0')}:
                    {String(elapsed.seconds).padStart(2, '0')}
                  </Text>
                );
              })()}
              <Text style={styles.timerSubtext}>
                ({(getElapsedTime(job)?.totalHours || 0).toFixed(2)} hours)
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isPending && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAcceptJob(job._id)}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDeclineJob(job._id)}
              >
                <Ionicons name="close-circle" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Decline</Text>
              </TouchableOpacity>
            </>
          )}
          {canStart && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStartJob(job._id)}
            >
              <Ionicons name="play-circle" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Start Job</Text>
            </TouchableOpacity>
          )}
          {canComplete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleCompleteJobPress(job)}
            >
              <Ionicons name="checkmark-done-circle" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Complete Job</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Jobs</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleOpenWebPortal} style={styles.webPortalButton}>
              <Ionicons name="globe-outline" size={20} color={colors.white} />
              <Text style={styles.webPortalButtonText}>Web Portal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{jobs.length}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{activeJobs.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{completedJobs.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        {/* Pending Jobs */}
        {pendingJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Job Requests</Text>
            {pendingJobs.map(renderJobCard)}
          </View>
        )}

        {/* Active Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Jobs</Text>
          {activeJobs.length > 0 ? (
            activeJobs.map(renderJobCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="briefcase-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No active jobs</Text>
            </Card>
          )}
        </View>

        {/* Completed Jobs */}
        {completedJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Jobs</Text>
            {completedJobs.map(renderJobCard)}
          </View>
        )}
      </ScrollView>

      {/* Completion Modal */}
      <Modal
        visible={completionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCompletionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Job</Text>
              <TouchableOpacity onPress={() => setCompletionModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalJobTitle}>{selectedJob?.title}</Text>

            <View style={styles.modalForm}>
              {/* Show different input based on pricing type */}
              {selectedJob?.pricingType === 'fixed' ? (
                <>
                  <Text style={styles.inputLabel}>Quote Amount ($) *</Text>
                  <TextInput
                    style={styles.input}
                    value={fixedAmount}
                    onChangeText={setFixedAmount}
                    placeholder="Enter your quoted price"
                    keyboardType="decimal-pad"
                  />
                  
                  {/* Cost Preview for Fixed Price */}
                  {selectedJob && fixedAmount && parseFloat(fixedAmount) > 0 && (
                    <View style={styles.costPreview}>
                      <Text style={styles.costPreviewTitle}>Cost Preview</Text>
                      {(() => {
                        const amount = parseFloat(fixedAmount);
                        const platformFee = amount * 0.1;
                        const total = amount + platformFee;
                        return (
                          <>
                            <View style={styles.previewRow}>
                              <Text style={styles.previewLabel}>Your Quote:</Text>
                              <Text style={styles.previewValue}>${amount.toFixed(2)}</Text>
                            </View>
                            <View style={styles.previewRow}>
                              <Text style={styles.previewLabel}>Platform Fee (10%):</Text>
                              <Text style={styles.previewValue}>${platformFee.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.previewRow, styles.previewTotal]}>
                              <Text style={styles.previewTotalLabel}>Customer Pays:</Text>
                              <Text style={styles.previewTotalValue}>${total.toFixed(2)}</Text>
                            </View>
                            <Text style={styles.previewBreakdown}>Fixed price quote</Text>
                          </>
                        );
                      })()}
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Hours Worked *</Text>
                  <TextInput
                    style={styles.input}
                    value={hoursWorked}
                    onChangeText={setHoursWorked}
                    placeholder="Enter hours worked"
                    keyboardType="decimal-pad"
                  />

                  {/* Cost Preview for Hourly */}
                  {selectedJob && hoursWorked && parseFloat(hoursWorked) > 0 && (
                    <View style={styles.costPreview}>
                      <Text style={styles.costPreviewTitle}>Cost Preview</Text>
                      {(() => {
                        const preview = calculateFinalCost(selectedJob, hoursWorked);
                        return (
                          <>
                            <View style={styles.previewRow}>
                              <Text style={styles.previewLabel}>Service Cost:</Text>
                              <Text style={styles.previewValue}>${preview.subtotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.previewRow}>
                              <Text style={styles.previewLabel}>Platform Fee:</Text>
                              <Text style={styles.previewValue}>${preview.platformFee.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.previewRow, styles.previewTotal]}>
                              <Text style={styles.previewTotalLabel}>Customer Pays:</Text>
                              <Text style={styles.previewTotalValue}>${preview.total.toFixed(2)}</Text>
                            </View>
                            {preview.breakdown && (
                              <Text style={styles.previewBreakdown}>{preview.breakdown}</Text>
                            )}
                          </>
                        );
                      })()}
                    </View>
                  )}
                </>
              )}

              <Text style={styles.inputLabel}>Completion Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={completionNotes}
                onChangeText={setCompletionNotes}
                placeholder="Add any notes about the completed work..."
                multiline
                numberOfLines={4}
              />

              <Button
                title="Mark as Complete"
                onPress={handleCompleteJobSubmit}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scrollView: {
    paddingBottom: 32,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  webPortalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  webPortalButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  
  jobCard: {
    marginBottom: 12,
  },
  
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  jobTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  
  jobTitleText: {
    flex: 1,
  },
  
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  
  jobTrade: {
    fontSize: 13,
    color: colors.textLight,
  },
  
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  
  jobDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  jobDetailText: {
    fontSize: 13,
    color: colors.textLight,
  },
  
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 8,
  },
  
  customerText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: '600',
  },
  
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  
  locationText: {
    fontSize: 13,
    color: colors.textLight,
    flex: 1,
  },
  
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  timerInfo: {
    flex: 1,
  },
  
  timerLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  
  timerSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  
  acceptButton: {
    backgroundColor: colors.success,
  },
  
  declineButton: {
    backgroundColor: colors.error,
  },
  
  startButton: {
    backgroundColor: colors.primary,
  },
  
  completeButton: {
    backgroundColor: colors.success,
  },
  
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  
  modalJobTitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  
  modalForm: {
    gap: 16,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  submitButton: {
    marginTop: 8,
  },
  
  costPreview: {
    backgroundColor: colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  
  costPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  
  previewLabel: {
    fontSize: 13,
    color: colors.textLight,
  },
  
  previewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  
  previewTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  previewTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  
  previewTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  
  previewBreakdown: {
    fontSize: 11,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 6,
  },
});

export default TradespersonDashboardScreen;

