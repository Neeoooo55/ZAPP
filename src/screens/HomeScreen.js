import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import colors from '../styles/colors';

const HomeScreen = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();

  const services = [
    {
      id: 'plumbing',
      title: 'Plumbing',
      icon: 'water',
      description: 'Emergency repairs, installations, and maintenance',
      items: ['Burst pipes', 'Blocked drains', 'Water heater issues', 'Toilet repairs'],
    },
    {
      id: 'electrical',
      title: 'Electrical',
      icon: 'flash',
      description: 'Safe and reliable electrical services',
      items: ['Power outages', 'Faulty wiring', 'Outlet installation', 'Light fixtures'],
    },
    {
      id: 'hvac',
      title: 'HVAC',
      icon: 'thermometer',
      description: 'Heating, ventilation, and air conditioning',
      items: ['AC repairs', 'Heating issues', 'Duct cleaning', 'Thermostat installation'],
    },
  ];

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('Booking');
    }
  };

  const handleJoinTradesperson = () => {
    if (!isAuthenticated) {
      navigation.navigate('Register');
    } else if (user?.role === 'tradesperson') {
      // Navigate to tradesperson dashboard or profile
      navigation.navigate('Profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="construct" size={32} color={colors.primary} />
            <Text style={styles.logoText}>ZAPP</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            A trusted local tradesperson at your door within{' '}
            <Text style={styles.highlight}>30 minutes</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Problem fixed within 24 hours. Fair platform where tradespeople keep more
            of their earnings and collectively own the system.
          </Text>

          <View style={styles.heroButtons}>
            {(!isAuthenticated || user?.role === 'customer') && (
              <Button
                title="Book Now"
                onPress={handleBookNow}
                style={styles.primaryButton}
              />
            )}
            {(!isAuthenticated || user?.role !== 'customer') && (
              <Button
                title="Join as Tradesperson"
                onPress={handleJoinTradesperson}
                variant="outline"
                style={styles.outlineButton}
              />
            )}
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Verified Tradespeople</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="phone-portrait" size={32} color={colors.primary} />
              </View>
              <Text style={styles.stepTitle}>1. Book Online</Text>
              <Text style={styles.stepText}>
                Select your trade, urgency level, and confirm your location with upfront
                pricing.
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="flash" size={32} color={colors.primary} />
              </View>
              <Text style={styles.stepTitle}>2. Instant Match</Text>
              <Text style={styles.stepText}>
                We automatically dispatch the closest available tradesperson to your
                location.
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
              </View>
              <Text style={styles.stepTitle}>3. Problem Fixed</Text>
              <Text style={styles.stepText}>
                Your tradesperson arrives within 30 minutes and fixes the problem within
                24 hours.
              </Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {services.map((service) => (
            <Card key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={service.icon} size={28} color={colors.primary} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
              </View>
              <View style={styles.serviceItems}>
                {service.items.map((item, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                    <Text style={styles.serviceItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>

        {/* Why Choose ZAPP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose ZAPP?</Text>
          <Card style={styles.featureCard}>
            <View style={styles.feature}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>30-Minute Response</Text>
                <Text style={styles.featureDescription}>
                  Trusted local tradesperson at your door within 30 minutes
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Verified Professionals</Text>
                <Text style={styles.featureDescription}>
                  All tradespeople are licensed, insured, and background checked
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Ionicons name="handshake" size={24} color={colors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Fair Platform</Text>
                <Text style={styles.featureDescription}>
                  Only 10% platform fee vs 30%+ on other gig apps
                </Text>
              </View>
            </View>
          </Card>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 36,
  },
  
  highlight: {
    color: colors.primary,
  },
  
  heroSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 24,
  },
  
  heroButtons: {
    gap: 12,
    marginBottom: 32,
  },
  
  primaryButton: {
    width: '100%',
  },
  
  outlineButton: {
    width: '100%',
  },
  
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  
  stat: {
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  
  steps: {
    gap: 24,
  },
  
  step: {
    alignItems: 'center',
  },
  
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  stepText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  serviceCard: {
    marginBottom: 16,
  },
  
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  serviceInfo: {
    flex: 1,
  },
  
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  
  serviceDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  
  serviceItems: {
    gap: 8,
  },
  
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  serviceItemText: {
    fontSize: 14,
    color: colors.text,
  },
  
  featureCard: {
    gap: 24,
  },
  
  feature: {
    flexDirection: 'row',
    gap: 16,
  },
  
  featureText: {
    flex: 1,
  },
  
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  
  featureDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});

export default HomeScreen;

