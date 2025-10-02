import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useTradespeople } from '../context/TradespeopleContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import colors from '../styles/colors';
import { customerAPI, authAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, profile, logout, updateUser, refreshUser } = useAuth();
  const { clearAllJobs } = useJobs();
  const { clearAllTradespeople } = useTradespeople();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    street: profile?.address?.street || '',
    city: profile?.address?.city || '',
    state: profile?.address?.state || '',
    zipCode: profile?.address?.zipCode || '',
  });

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Update basic user info
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      // Update customer profile (address)
      if (user?.role === 'customer') {
        await customerAPI.updateProfile({
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
        });
      }

      await refreshUser();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete ALL users, jobs, and tradespeople from the database. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data from the backend database
              await authAPI.clearAllData();
              
              // Clear all contexts
              await clearAllJobs();
              await clearAllTradespeople();
              
              // Clear all AsyncStorage
              await AsyncStorage.removeItem('mock_users');
              await AsyncStorage.removeItem('current_user');
              await AsyncStorage.removeItem('shared_jobs');
              await AsyncStorage.removeItem('registered_tradespeople');
              
              Alert.alert('Success', 'All data has been cleared from the database!', [
                { 
                  text: 'OK', 
                  onPress: () => {
                    // Logout to return to login screen
                    logout();
                  }
                }
              ]);
            } catch (error) {
              console.error('Clear all data error:', error);
              Alert.alert('Error', error.message || 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Info Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.userTypeBadge}>
                <Text style={styles.userTypeText}>
                  {user?.role === 'customer' ? 'Customer' : 'Tradesperson'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Card>
            {editing ? (
              <>
                <View style={styles.row}>
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    style={styles.halfInput}
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    style={styles.halfInput}
                  />
                </View>
                <Input
                  label="Email"
                  value={user?.email}
                  editable={false}
                  style={styles.disabledInput}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                />
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Address Information */}
        {user?.role === 'customer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Card>
              {editing ? (
                <>
                  <Input
                    label="Street Address"
                    value={formData.street}
                    onChangeText={(value) => updateFormData('street', value)}
                    placeholder="123 Main St"
                  />
                  <View style={styles.row}>
                    <Input
                      label="City"
                      value={formData.city}
                      onChangeText={(value) => updateFormData('city', value)}
                      placeholder="City"
                      style={styles.halfInput}
                    />
                    <Input
                      label="State"
                      value={formData.state}
                      onChangeText={(value) => updateFormData('state', value)}
                      placeholder="State"
                      style={styles.halfInput}
                    />
                  </View>
                  <Input
                    label="ZIP Code"
                    value={formData.zipCode}
                    onChangeText={(value) => updateFormData('zipCode', value)}
                    placeholder="12345"
                    keyboardType="numeric"
                  />
                </>
              ) : (
                <>
                  {profile?.address?.street ? (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Street</Text>
                        <Text style={styles.infoValue}>{profile.address.street}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>City</Text>
                        <Text style={styles.infoValue}>{profile.address.city}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>State</Text>
                        <Text style={styles.infoValue}>{profile.address.state}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ZIP Code</Text>
                        <Text style={styles.infoValue}>{profile.address.zipCode}</Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.emptyText}>No address provided</Text>
                  )}
                </>
              )}
            </Card>
          </View>
        )}

        {editing && (
          <View style={styles.section}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>

        {/* Clear All Data Button (Dev/Testing) */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.clearDataButton}
            onPress={handleClearAllData}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={styles.clearDataText}>Clear All Data (Reset App)</Text>
          </TouchableOpacity>
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
  
  cancelText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  
  profileCard: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  profileInfo: {
    flex: 1,
  },
  
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  
  profileEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  
  userTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  userTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
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
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  
  halfInput: {
    flex: 1,
  },
  
  disabledInput: {
    opacity: 0.5,
  },
  
  saveButton: {
    marginBottom: 16,
  },
  
  logoutButton: {
    borderColor: colors.error,
  },
  
  clearDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error + '40',
    borderRadius: 8,
    backgroundColor: colors.error + '10',
  },
  
  clearDataText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});

export default ProfileScreen;

