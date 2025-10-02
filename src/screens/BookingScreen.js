import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useTradespeople } from '../context/TradespeopleContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import colors from '../styles/colors';
import { customerAPI, jobsAPI } from '../services/api';

const BookingScreen = ({ navigation }) => {
  const { profile, user } = useAuth();
  const { createJob } = useJobs();
  const { getTradespeopleByTrade, tradespeople } = useTradespeople();
  const [loading, setLoading] = useState(false);
  const [loadingTradespeople, setLoadingTradespeople] = useState(false);
  const [assignmentType, setAssignmentType] = useState('auto');
  const [availableTradespeople, setAvailableTradespeople] = useState([]);
  const [selectedTradesperson, setSelectedTradesperson] = useState(null);
  const [formData, setFormData] = useState({
    trade: '',
    urgency: 'standard',
    title: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    accessInstructions: '',
    pricingType: 'hourly',
    amount: '75',
  });

  // Load saved address from profile when component mounts
  useEffect(() => {
    if (profile?.address) {
      setFormData((prev) => ({
        ...prev,
        street: profile.address.street || '',
        city: profile.address.city || '',
        state: profile.address.state || '',
        zipCode: profile.address.zipCode || '',
      }));
    }
  }, [profile]);

  // Auto-set pricing based on urgency level
  useEffect(() => {
    if (formData.urgency === 'emergency') {
      setFormData((prev) => ({
        ...prev,
        pricingType: 'emergency_fee',
        amount: '150',
      }));
    } else if (formData.pricingType === 'emergency_fee') {
      // If urgency changed from emergency to something else, reset to hourly
      setFormData((prev) => ({
        ...prev,
        pricingType: 'hourly',
        amount: '75',
      }));
    }
  }, [formData.urgency]);

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  // Get available pricing options based on urgency
  const getAvailablePricingOptions = () => {
    const allOptions = [
      { value: 'emergency_fee', label: 'Emergency Fee', price: '$150 charge + $75/hr', amount: '150' },
      { value: 'hourly', label: 'Hourly Rate', price: '$75/hr', amount: '75' },
      { value: 'fixed', label: 'Fixed Price', price: 'Quote', amount: '0' },
    ];

    if (formData.urgency === 'emergency') {
      // Only emergency fee for emergency jobs
      return allOptions.filter(opt => opt.value === 'emergency_fee');
    } else {
      // Only hourly and fixed for urgent/standard jobs
      return allOptions.filter(opt => opt.value !== 'emergency_fee');
    }
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const platformFee = amount * 0.1;
    return {
      serviceCost: amount,
      platformFee: platformFee,
      total: amount + platformFee,
    };
  };

  // Load available tradespeople when trade is selected
  const loadAvailableTradespeople = async () => {
    if (!formData.trade) return;

    setLoadingTradespeople(true);
    try {
      // Get tradespeople from backend
      const registeredTradespeople = await getTradespeopleByTrade(formData.trade);
      setAvailableTradespeople(registeredTradespeople);
    } catch (error) {
      setAvailableTradespeople([]);
    } finally {
      setLoadingTradespeople(false);
    }
  };

  // Load tradespeople when assignment type changes to manual or when tradespeople are registered
  useEffect(() => {
    if (assignmentType === 'manual' && formData.trade) {
      loadAvailableTradespeople();
    }
  }, [assignmentType, formData.trade, tradespeople]);

  const handleSubmit = async () => {
    const { trade, title, description, street, city, state, zipCode, pricingType, amount } = formData;

    if (!trade || !title || !description || !street || !city || !state || !zipCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (assignmentType === 'manual' && !selectedTradesperson) {
      Alert.alert('Error', 'Please select a tradesperson');
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        category: formData.trade,
        urgency: formData.urgency,
        pricingType: formData.pricingType,
        description: `${formData.title}\n\n${formData.description}`,
        location: {
          address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          coordinates: { lat: 37.7749, lng: -122.4194 }, // Default coords for demo
        },
        scheduledTime: new Date().toISOString(),
        estimatedCost: parseFloat(formData.amount) || 0,
      };

      // Create job using backend API
      const createdJob = await createJob(jobData);
      
      Alert.alert(
        'Success!',
        'Your job has been submitted! A tradesperson will review it soon.',
        [{ text: 'OK', onPress: () => {
          navigation.goBack();
          navigation.navigate('MainTabs', { screen: 'Dashboard' });
        }}]
      );
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to submit booking. Please check your connection and try again.';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const costs = calculateTotal();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book a Service</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          {/* Service Type */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Service Type *</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.trade}
                onValueChange={(value) => updateFormData('trade', value)}
              >
                <Picker.Item label="Select a service" value="" />
                <Picker.Item label="Plumbing" value="plumbing" />
                <Picker.Item label="Electrical" value="electrical" />
                <Picker.Item label="HVAC" value="hvac" />
                <Picker.Item label="Carpentry" value="carpentry" />
                <Picker.Item label="Painting" value="painting" />
                <Picker.Item label="General Repairs" value="general" />
              </Picker>
            </View>
          </View>

          {/* Urgency */}
          <Text style={styles.label}>Urgency Level *</Text>
          <View style={styles.urgencyButtons}>
            {[
              { value: 'emergency', label: 'Emergency', icon: 'warning', color: colors.error },
              { value: 'urgent', label: 'Urgent', icon: 'time', color: colors.warning },
              { value: 'standard', label: 'Standard', icon: 'calendar', color: colors.info },
            ].map((urgency) => (
              <TouchableOpacity
                key={urgency.value}
                style={[
                  styles.urgencyButton,
                  formData.urgency === urgency.value && {
                    backgroundColor: urgency.color,
                    borderColor: urgency.color,
                  },
                ]}
                onPress={() => updateFormData('urgency', urgency.value)}
              >
                <Ionicons
                  name={urgency.icon}
                  size={20}
                  color={formData.urgency === urgency.value ? colors.white : urgency.color}
                />
                <Text
                  style={[
                    styles.urgencyText,
                    formData.urgency === urgency.value && { color: colors.white },
                  ]}
                >
                  {urgency.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title & Description */}
          <Input
            label="Brief Description *"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            placeholder="e.g., Burst pipe in kitchen"
          />

          <Input
            label="Detailed Description *"
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Please provide more details about the issue..."
            multiline
            numberOfLines={3}
          />

          {/* Address */}
          <Text style={styles.sectionTitle}>Location</Text>
          <Input
            label="Street Address *"
            value={formData.street}
            onChangeText={(value) => updateFormData('street', value)}
            placeholder="123 Main St"
          />

          <View style={styles.row}>
            <Input
              label="City *"
              value={formData.city}
              onChangeText={(value) => updateFormData('city', value)}
              placeholder="City"
              style={styles.halfInput}
            />
            <Input
              label="State *"
              value={formData.state}
              onChangeText={(value) => updateFormData('state', value)}
              placeholder="State"
              style={styles.halfInput}
            />
          </View>

          <Input
            label="ZIP Code *"
            value={formData.zipCode}
            onChangeText={(value) => updateFormData('zipCode', value)}
            placeholder="12345"
            keyboardType="numeric"
          />

          <Input
            label="Access Instructions (Optional)"
            value={formData.accessInstructions}
            onChangeText={(value) => updateFormData('accessInstructions', value)}
            placeholder="e.g., Ring doorbell, use side entrance"
            multiline
            numberOfLines={2}
          />

          {/* Tradesperson Selection */}
          {formData.trade && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Your Tradesperson</Text>
              
              <View style={styles.assignmentButtons}>
                <TouchableOpacity
                  style={[
                    styles.assignmentButton,
                    assignmentType === 'auto' && styles.assignmentButtonActive,
                  ]}
                  onPress={() => {
                    setAssignmentType('auto');
                    setSelectedTradesperson(null);
                  }}
                >
                  <Ionicons
                    name="flash"
                    size={24}
                    color={assignmentType === 'auto' ? colors.white : colors.primary}
                  />
                  <View style={styles.assignmentInfo}>
                    <Text style={[
                      styles.assignmentTitle,
                      assignmentType === 'auto' && styles.assignmentTitleActive,
                    ]}>
                      Auto-Assign (Recommended)
                    </Text>
                    <Text style={[
                      styles.assignmentDescription,
                      assignmentType === 'auto' && styles.assignmentDescriptionActive,
                    ]}>
                      We'll find the best available tradesperson near you
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.assignmentButton,
                    assignmentType === 'manual' && styles.assignmentButtonActive,
                  ]}
                  onPress={() => setAssignmentType('manual')}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={assignmentType === 'manual' ? colors.white : colors.primary}
                  />
                  <View style={styles.assignmentInfo}>
                    <Text style={[
                      styles.assignmentTitle,
                      assignmentType === 'manual' && styles.assignmentTitleActive,
                    ]}>
                      Choose Manually
                    </Text>
                    <Text style={[
                      styles.assignmentDescription,
                      assignmentType === 'manual' && styles.assignmentDescriptionActive,
                    ]}>
                      Select from available tradespeople in your area
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Available Tradespeople List */}
              {assignmentType === 'manual' && (
                <View style={styles.tradespeopleContainer}>
                  <Text style={styles.tradespeopleTitle}>Available Tradespeople</Text>
                  
                  {loadingTradespeople ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Loading tradespeople...</Text>
                    </View>
                  ) : availableTradespeople.length === 0 ? (
                    <Card style={styles.emptyCard}>
                      <Ionicons name="person-outline" size={48} color={colors.textMuted} />
                      <Text style={styles.emptyText}>
                        No tradespeople available for this service in your area.
                      </Text>
                    </Card>
                  ) : (
                    <ScrollView style={styles.tradespeopleList}>
                      {availableTradespeople.map((tradesperson) => (
                        <TouchableOpacity
                          key={tradesperson._id}
                          style={[
                            styles.tradespersonCard,
                            selectedTradesperson === tradesperson._id && styles.tradespersonCardSelected,
                          ]}
                          onPress={() => setSelectedTradesperson(tradesperson._id)}
                        >
                          <View style={styles.tradespersonHeader}>
                            <View style={styles.tradespersonAvatar}>
                              <Ionicons name="person" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.tradespersonInfo}>
                              <Text style={styles.tradespersonName}>
                                {tradesperson.firstName} {tradesperson.lastName}
                              </Text>
                              <Text style={styles.tradespersonBusiness}>
                                {tradesperson.businessInfo?.businessName || 'Independent'}
                              </Text>
                              <View style={styles.tradespersonRating}>
                                <Ionicons name="star" size={14} color={colors.warning} />
                                <Text style={styles.ratingText}>
                                  {tradesperson.rating?.average?.toFixed(1) || 'New'} 
                                  {tradesperson.rating?.totalReviews > 0 && 
                                    ` (${tradesperson.rating.totalReviews} reviews)`
                                  }
                                </Text>
                              </View>
                            </View>
                            {selectedTradesperson === tradesperson._id && (
                              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                            )}
                          </View>
                          
                          <View style={styles.tradespersonStats}>
                            <View style={styles.statItem}>
                              <Ionicons name="briefcase" size={14} color={colors.textLight} />
                              <Text style={styles.statText}>
                                {tradesperson.completedJobs || 0} jobs
                              </Text>
                            </View>
                            <View style={styles.statItem}>
                              <Ionicons name="time" size={14} color={colors.textLight} />
                              <Text style={styles.statText}>
                                {tradesperson.responseTime || 'Fast'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Pricing */}
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingButtons}>
            {getAvailablePricingOptions().map((pricing) => (
              <TouchableOpacity
                key={pricing.value}
                style={[
                  styles.pricingButton,
                  formData.pricingType === pricing.value && styles.pricingButtonActive,
                  formData.urgency === 'emergency' && styles.pricingButtonDisabled,
                ]}
                onPress={() => {
                  // Prevent changing pricing for emergency jobs
                  if (formData.urgency === 'emergency') return;
                  
                  // Update both pricing type and amount in a single state update
                  setFormData(prev => ({
                    ...prev,
                    pricingType: pricing.value,
                    amount: pricing.amount,
                  }));
                }}
                disabled={formData.urgency === 'emergency'}
              >
                <Text style={[
                  styles.pricingLabel,
                  formData.pricingType === pricing.value && styles.pricingLabelActive
                ]}>{pricing.label}</Text>
                <Text style={[
                  styles.pricingPrice,
                  formData.pricingType === pricing.value && styles.pricingPriceActive
                ]}>{pricing.price}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* {formData.pricingType !== 'emergency_fee' && (
            <Input
              label="Estimated Amount ($)"
              value={formData.amount}
              onChangeText={(value) => updateFormData('amount', value)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          )} */}

          {/* Pricing Summary */}
          {costs.serviceCost > 0 && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Cost:</Text>
                <Text style={styles.summaryValue}>${costs.serviceCost.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform Fee (10%):</Text>
                <Text style={styles.summaryValue}>${costs.platformFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total Due Now:</Text>
                <Text style={styles.summaryTotalValue}>${costs.total.toFixed(2)}</Text>
              </View>
            </Card>
          )}

          <Button
            title="Book Service"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollView: {
    paddingBottom: 32,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  pickerContainer: {
    marginBottom: 16,
  },
  
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  
  urgencyButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  
  urgencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: 6,
  },
  
  urgencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  
  halfInput: {
    flex: 1,
  },
  
  pricingButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  
  pricingNote: {
    fontSize: 13,
    color: colors.warning,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  
  pricingButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  
  pricingButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  
  pricingButtonDisabled: {
    opacity: 1,
    borderColor: colors.emergency,
    backgroundColor: colors.emergency + '10',
  },
  
  pricingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  
  pricingLabelActive: {
    color: colors.primary,
  },
  
  pricingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  
  pricingPriceActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  
  summaryCard: {
    backgroundColor: colors.backgroundGray,
    marginBottom: 24,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  
  summaryTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  
  submitButton: {
    marginTop: 8,
  },
  
  section: {
    marginBottom: 24,
  },
  
  assignmentButtons: {
    gap: 12,
    marginBottom: 16,
  },
  
  assignmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: 12,
  },
  
  assignmentButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  
  assignmentInfo: {
    flex: 1,
  },
  
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  
  assignmentTitleActive: {
    color: colors.white,
  },
  
  assignmentDescription: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  
  assignmentDescriptionActive: {
    color: colors.white,
    opacity: 0.9,
  },
  
  tradespeopleContainer: {
    marginTop: 16,
  },
  
  tradespeopleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  
  tradespeopleList: {
    maxHeight: 400,
  },
  
  tradespersonCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  
  tradespersonCardSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  
  tradespersonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  
  tradespersonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tradespersonInfo: {
    flex: 1,
  },
  
  tradespersonName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  
  tradespersonBusiness: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  
  tradespersonRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  ratingText: {
    fontSize: 12,
    color: colors.textLight,
  },
  
  tradespersonStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  statText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default BookingScreen;

