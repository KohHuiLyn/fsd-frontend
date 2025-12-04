import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { horizontalScale as hs, scaleFont, verticalScale as vs } from '@/utils/scale';
import { useAuth } from '@/contexts/AuthContext';
import logo from '../assets/images/logo.png';
import { Redirect } from 'expo-router';

type CountryCode = {
  code: string
  dialCode: string
  name: string
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "SG", dialCode: "+65", name: "Singapore" },
  { code: "MY", dialCode: "+60", name: "Malaysia" },
  { code: "ID", dialCode: "+62", name: "Indonesia" },
  { code: "TH", dialCode: "+66", name: "Thailand" },
  { code: "PH", dialCode: "+63", name: "Philippines" },
  { code: "VN", dialCode: "+84", name: "Vietnam" },
  { code: "US", dialCode: "+1", name: "United States" },
  { code: "GB", dialCode: "+44", name: "United Kingdom" },
  { code: "AU", dialCode: "+61", name: "Australia" },
  { code: "CN", dialCode: "+86", name: "China" },
  { code: "JP", dialCode: "+81", name: "Japan" },
  { code: "KR", dialCode: "+82", name: "South Korea" },
  { code: "IN", dialCode: "+91", name: "India" },
]

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(COUNTRY_CODES[0]); // Default to Singapore
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('gardener');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();

  // Redirect to home if already authenticated
  if (authLoading) {
    return null; // Or a loading indicator
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleRegister = async () => {
    // Validation
    if (!email.trim() || !username.trim() || !phoneNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Basic phone number validation
    if (phoneNumber.trim().length < 8) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Combine country code with phone number (remove all spaces)
    const cleanedPhoneNumber = phoneNumber.trim().replace(/\s+/g, '');
    const fullPhoneNumber = `${selectedCountryCode.dialCode}${cleanedPhoneNumber}`;

    setIsLoading(true);
    try {
      await register(
        email.trim(),
        username.trim(),
        fullPhoneNumber,
        password,
        role
      );
      // Redirect to home after successful registration
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + vs(20), paddingBottom: insets.bottom + vs(20) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PlantPal and start growing</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="account-outline"
              size={hs(20)}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={hs(20)}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.phoneInputContainer}>
            <TouchableOpacity
              style={styles.countryCodeButton}
              onPress={() => setShowCountryCodeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryCodeText}>{selectedCountryCode.dialCode}</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            <View style={[styles.inputContainer, styles.phoneInputWrapper]}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={hs(20)}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="8123 4567"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={hs(20)}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={hs(20)}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={hs(20)}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={hs(20)}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Country Code Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCountryCodeModal}
        onRequestClose={() => setShowCountryCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCountryCodeModal(false)}
          />
          <View style={styles.countryCodeModalContent}>
            <View style={styles.countryCodeModalHeader}>
              <Text style={styles.countryCodeModalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryCodeModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryCodeList} showsVerticalScrollIndicator={false}>
              {COUNTRY_CODES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryCodeItem,
                    selectedCountryCode.code === country.code && styles.countryCodeItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCountryCode(country)
                    setShowCountryCodeModal(false)
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.countryCodeItemContent}>
                    <Text style={styles.countryCodeItemDialCode}>{country.dialCode}</Text>
                    <Text style={styles.countryCodeItemName}>{country.name}</Text>
                  </View>
                  {selectedCountryCode.code === country.code && (
                    <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: hs(24),
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: vs(40),
  },
  logo: {
    width: hs(160),
    height: vs(48),
    marginBottom: vs(20),
  },
  title: {
    fontSize: scaleFont(28),
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: vs(8),
  },
  subtitle: {
    fontSize: scaleFont(14),
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: vs(16),
    paddingHorizontal: hs(16),
    height: vs(50),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: hs(12),
  },
  input: {
    flex: 1,
    fontSize: scaleFont(15),
    color: '#1a1a1a',
  },
  eyeIcon: {
    padding: hs(4),
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: vs(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: vs(24),
  },
  footerText: {
    fontSize: scaleFont(14),
    color: '#666',
  },
  footerLink: {
    fontSize: scaleFont(14),
    color: '#4CAF50',
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: hs(8),
    marginBottom: vs(16),
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: hs(12),
    gap: hs(6),
    minWidth: hs(80),
    height: vs(50),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  countryCodeText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#1a1a1a',
  },
  phoneInputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  countryCodeModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: vs(20),
    maxHeight: '70%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(-2) },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  countryCodeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    marginBottom: vs(20),
  },
  countryCodeModalTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#1a1a1a',
  },
  countryCodeList: {
    flexGrow: 0,
    flexShrink: 1,
  },
  countryCodeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  countryCodeItemSelected: {
    backgroundColor: '#F8F8F8',
  },
  countryCodeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
  },
  countryCodeItemDialCode: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: hs(50),
  },
  countryCodeItemName: {
    fontSize: scaleFont(15),
    color: '#666',
  },
});

