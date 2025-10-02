import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { useTradespeople } from '../context/TradespeopleContext';
import Input from '../components/Input';
import Button from '../components/Button';
import colors from '../styles/colors';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const { registerTradesperson } = useTradespeople();
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    trade: '', // For tradespeople
    businessName: '', // Optional business name
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, phone, password, trade, businessName } = formData;

    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (userType === 'tradesperson' && !trade) {
      Alert.alert('Error', 'Please select your trade/service type');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    // Build API data with role-specific fields
    const apiData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: userType, // Backend expects 'role', not 'userType'
    };

    // Add tradesperson-specific fields if registering as tradesperson
    if (userType === 'tradesperson') {
      apiData.trades = [trade];
      apiData.businessName = businessName || `${firstName} ${lastName}`;
      apiData.licenseNumber = ''; // Optional, can be added to form later
    }
    
    const result = await register(apiData);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="construct" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ZAPP today</Text>
          </View>

          <View style={styles.userTypeContainer}>
            <Text style={styles.label}>I am a:</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'customer' && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType('customer')}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={userType === 'customer' ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.userTypeText,
                    userType === 'customer' && styles.userTypeTextActive,
                  ]}
                >
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'tradesperson' && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType('tradesperson')}
              >
                <Ionicons
                  name="hammer"
                  size={24}
                  color={userType === 'tradesperson' ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.userTypeText,
                    userType === 'tradesperson' && styles.userTypeTextActive,
                  ]}
                >
                  Tradesperson
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="First name"
                style={[styles.input, styles.halfInput]}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Last name"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Create a password (min 6 characters)"
              secureTextEntry
            />

            {/* Tradesperson-specific fields */}
            {userType === 'tradesperson' && (
              <>
                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>Primary Trade/Service *</Text>
                  <View style={styles.picker}>
                    <Picker
                      selectedValue={formData.trade}
                      onValueChange={(value) => updateFormData('trade', value)}
                    >
                      <Picker.Item label="Select your trade" value="" />
                      <Picker.Item label="Plumbing" value="plumbing" />
                      <Picker.Item label="Electrical" value="electrical" />
                      <Picker.Item label="HVAC" value="hvac" />
                      <Picker.Item label="Carpentry" value="carpentry" />
                      <Picker.Item label="Painting" value="painting" />
                      <Picker.Item label="General Repairs" value="general" />
                    </Picker>
                  </View>
                </View>

                <Input
                  label="Business Name (Optional)"
                  value={formData.businessName}
                  onChangeText={(value) => updateFormData('businessName', value)}
                  placeholder="Your business name"
                />
              </>
            )}

            <Button
              title="Sign Up"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginTextBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  keyboardView: {
    flex: 1,
  },
  
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  
  userTypeContainer: {
    marginBottom: 24,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    gap: 8,
  },
  
  userTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  
  userTypeTextActive: {
    color: colors.white,
  },
  
  form: {
    marginTop: 8,
  },
  
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  
  input: {
    marginBottom: 0,
  },
  
  halfInput: {
    flex: 1,
  },
  
  registerButton: {
    marginTop: 8,
  },
  
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  
  loginText: {
    fontSize: 14,
    color: colors.textLight,
  },
  
  loginTextBold: {
    color: colors.primary,
    fontWeight: '600',
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
});

export default RegisterScreen;

