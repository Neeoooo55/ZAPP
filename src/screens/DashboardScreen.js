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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';
import colors from '../styles/colors';
import { useJobs } from '../context/JobContext';
import { useTradespeople } from '../context/TradespeopleContext';
import { customerAPI } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { jobs: contextJobs, deleteJob, refreshJobs, updateJob } = useJobs();
  const { updateTradesperson, tradespeople } = useTradespeople();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const loadJobs = async () => {
    try {
      // Load from shared context
      await refreshJobs();
      setJobs(contextJobs);
    } catch (error) {
      console.log('Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const activeJobs = jobs.filter((j) =>
    ['pending', 'accepted', 'assigned', 'in_progress'].includes(j.status)
  );
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  const getStatusColor = (status) => {
    const colors_map = {
      pending: colors.warning,
      accepted: colors.info,
      assigned: colors.info,
      in_progress: colors.primary,
      completed: colors.success,
      cancelled: colors.error,
    };
    return colors_map[status] || colors.textMuted;
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'PENDING',
      accepted: 'ACCEPTED',
      assigned: 'ASSIGNED',
      in_progress: 'JOB STARTED',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED',
    };
    return statusMap[status] || status.replace('_', ' ').toUpperCase();
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

  const handleCancelJob = async (jobId) => {
    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this job?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            deleteJob(jobId);
            Alert.alert('Success', 'Job cancelled successfully');
            loadJobs();
          },
        },
      ]
    );
  };

  const handleReviewPress = (job) => {
    setSelectedJob(job);
    setRating(job.review?.rating || 0);
    setReviewText(job.review?.comment || '');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a star rating');
      return;
    }

    try {
      // Submit review to backend
      await customerAPI.submitReview(selectedJob._id, {
        rating,
        comment: reviewText.trim(),
      });

      setReviewModalVisible(false);
      
      setTimeout(() => {
        loadJobs();
        Alert.alert('Thank You!', 'Your review has been submitted');
      }, 300);
    } catch (error) {
      console.error('Submit review error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handlePayNow = (job) => {
    Alert.alert(
      'Payment', 
      'Payment integration coming soon!\n\nAmount to pay: $' + job.completionDetails?.finalCost?.total.toFixed(2),
      [{ text: 'OK' }]
    );
  };

  const renderJobCard = (job) => (
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
            {getStatusText(job.status)}
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
            ${(job.estimatedCost || job.actualCost || 0).toFixed(2)}
          </Text>
        </View>
        {job.urgency && (
          <View style={styles.jobDetail}>
            <Ionicons name="time" size={16} color={colors.textLight} />
            <Text style={styles.jobDetailText}>{job.urgency}</Text>
          </View>
        )}
      </View>

      {job.tradespersonId && (
        <View style={styles.tradespersonInfo}>
          <Ionicons name="person" size={16} color={colors.success} />
          <Text style={styles.tradespersonText}>
            Assigned to {job.tradespersonId.businessInfo?.businessName || 'Tradesperson'}
          </Text>
        </View>
      )}

      {/* Final Cost for Completed Jobs */}
      {job.status === 'completed' && job.completionDetails?.finalCost && (
        <View style={styles.costSummary}>
          <Text style={styles.costSummaryTitle}>Final Charges</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Service Cost:</Text>
            <Text style={styles.costValue}>
              ${job.completionDetails.finalCost.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Platform Fee (10%):</Text>
            <Text style={styles.costValue}>
              ${job.completionDetails.finalCost.platformFee.toFixed(2)}
            </Text>
          </View>
          {job.completionDetails.finalCost.breakdown && (
            <Text style={styles.costBreakdown}>
              {job.completionDetails.finalCost.breakdown}
            </Text>
          )}
          <View style={[styles.costRow, styles.costTotal]}>
            <Text style={styles.costTotalLabel}>Total Amount Due:</Text>
            <Text style={styles.costTotalValue}>
              ${job.completionDetails.finalCost.total.toFixed(2)}
            </Text>
          </View>
          <Text style={styles.hoursWorked}>
            Time worked: {job.completionDetails.hoursWorked} hours
          </Text>
          
          {/* Action Buttons for Completed Jobs */}
          <View style={styles.completedActions}>
            <TouchableOpacity
              style={styles.payNowButton}
              onPress={() => handlePayNow(job)}
            >
              <Ionicons name="card" size={20} color={colors.white} />
              <Text style={styles.payNowText}>Pay Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.reviewButton, 
                job.review && styles.reviewButtonSubmitted
              ]}
              onPress={() => job.review ? null : handleReviewPress(job)}
              disabled={!!job.review}
            >
              <Ionicons 
                name={job.review ? "checkmark-circle" : "star-outline"} 
                size={20} 
                color={job.review ? colors.success : colors.white} 
              />
              <Text style={[
                styles.reviewButtonText, 
                job.review && styles.reviewButtonTextSubmitted
              ]}>
                {job.review ? 'Review Submitted' : 'Leave Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Show existing review if present */}
      {job.status === 'completed' && job.review && (
        <View style={styles.existingReview}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Your Review</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= job.review.rating ? colors.warning : colors.borderLight}
                />
              ))}
            </View>
          </View>
          {job.review.comment && (
            <Text style={styles.reviewComment}>{job.review.comment}</Text>
          )}
        </View>
      )}

      {/* Status-specific info */}
      {job.status === 'accepted' && (
        <View style={styles.statusInfo}>
          <Ionicons name="checkmark-circle" size={20} color={colors.info} />
          <Text style={styles.statusInfoText}>
            Tradesperson has accepted your job request
          </Text>
        </View>
      )}

      {job.status === 'in_progress' && (
        <View style={styles.statusInfo}>
          <Ionicons name="hammer" size={20} color={colors.primary} />
          <Text style={styles.statusInfoText}>
            Work is in progress
          </Text>
        </View>
      )}

      {job.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelJob(job._id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Job</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

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
          <TouchableOpacity onPress={() => navigation.navigate('Booking')}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
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

        {/* Active Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Jobs</Text>
          {activeJobs.length > 0 ? (
            activeJobs.map(renderJobCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="briefcase-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No active jobs</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate('Booking')}
              >
                <Text style={styles.bookButtonText}>Book a Service</Text>
              </TouchableOpacity>
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

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalJobTitle}>{selectedJob?.title}</Text>

            {/* Star Rating */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating *</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? colors.warning : colors.borderLight}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {rating === 0 ? 'Tap to rate' : 
                 rating === 1 ? 'Poor' :
                 rating === 2 ? 'Fair' :
                 rating === 3 ? 'Good' :
                 rating === 4 ? 'Very Good' :
                 'Excellent'}
              </Text>
            </View>

            {/* Review Text */}
            <View style={styles.reviewForm}>
              <Text style={styles.inputLabel}>Your Review (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Share your experience with this tradesperson..."
                multiline
                numberOfLines={4}
              />

              <Button
                title="Submit Review"
                onPress={handleSubmitReview}
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
  
  tradespersonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 8,
  },
  
  tradespersonText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
  },

  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.info + '10',
    padding: 12,
    borderRadius: 8,
  },

  statusInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  
  cancelButtonText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  
  costSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.success + '10',
    padding: 12,
    borderRadius: 8,
  },
  
  costSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  
  costLabel: {
    fontSize: 13,
    color: colors.textLight,
  },
  
  costValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  
  costBreakdown: {
    fontSize: 11,
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  
  costTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  costTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  
  costTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  
  hoursWorked: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 24,
  },
  
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  bookButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  completedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  
  payNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  
  payNowText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  
  reviewButtonSubmitted: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.success,
    opacity: 0.7,
  },
  
  reviewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  reviewButtonTextSubmitted: {
    color: colors.success,
  },
  
  existingReview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  
  reviewComment: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
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
  
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  
  starButton: {
    padding: 4,
  },
  
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  
  reviewForm: {
    gap: 8,
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
    marginTop: 16,
  },
});

export default DashboardScreen;

