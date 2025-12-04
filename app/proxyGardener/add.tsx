"use client"

import Template from "@/components/Template"
import { createProxy } from "@/services/proxyService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

function formatProxyApiDateTime(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  const day = `${date.getUTCDate()}`.padStart(2, "0")
  const hours = `${date.getUTCHours()}`.padStart(2, "0")
  const minutes = `${date.getUTCMinutes()}`.padStart(2, "0")
  const seconds = `${date.getUTCSeconds()}`.padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00`
}

function formatProxyDisplayDate(date: Date | null): string {
  if (!date) {
    return "Tap to choose"
  }
  return date.toLocaleString()
}

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

export default function AddProxyGardener() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(COUNTRY_CODES[0]) // Default to Singapore
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false)
  const [startDateTime, setStartDateTime] = useState<Date | null>(null)
  const [endDateTime, setEndDateTime] = useState<Date | null>(null)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const resetForm = () => {
    setName("")
    setPhoneNumber("")
    setSelectedCountryCode(COUNTRY_CODES[0])
    setStartDateTime(null)
    setEndDateTime(null)
  }

  const formattedStartDate = useMemo(() => formatProxyDisplayDate(startDateTime), [startDateTime])
  const formattedEndDate = useMemo(() => formatProxyDisplayDate(endDateTime), [endDateTime])

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing details", "Please enter the proxy's name.")
      return
    }

    setIsSubmitting(true)
    try {
      const fullPhoneNumber = phoneNumber.trim()
        ? `${selectedCountryCode.dialCode} ${phoneNumber.trim()}`
        : null

      await createProxy({
        name: name.trim(),
        phoneNumber: fullPhoneNumber,
        startDate: formatProxyApiDateTime(startDateTime),
        endDate: formatProxyApiDateTime(endDateTime),
      })
      Alert.alert("Proxy added", `${name.trim()} will now receive plant reminders.`, [
        { text: "Back to list", onPress: () => router.back() },
      ])
      resetForm()
    } catch (error: any) {
      console.error("Failed to create proxy:", error)
      Alert.alert("Unable to add proxy", error?.message ?? "Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderDatePicker = useCallback(
    (
      visible: boolean,
      setVisible: (value: boolean) => void,
      currentValue: Date | null,
      mode: "start" | "end",
      isDatePicker: boolean,
    ) => {
      if (!visible) {
        return null
      }

      return (
        <DateTimePicker
          value={currentValue ?? new Date()}
          mode={isDatePicker ? "date" : "time"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          is24Hour
          onChange={(event, selectedDate) => {
            setVisible(false)
            if (!selectedDate) {
              return
            }

            if (isDatePicker) {
              const baseDate = currentValue ?? new Date()
              const nextDate = new Date(selectedDate)
              nextDate.setHours(baseDate.getHours())
              nextDate.setMinutes(baseDate.getMinutes())
              nextDate.setSeconds(0, 0)

              if (mode === "start") {
                setStartDateTime(nextDate)
                setShowStartTimePicker(true)
              } else {
                setEndDateTime(nextDate)
                setShowEndTimePicker(true)
              }
            } else {
              const baseDate = new Date((currentValue ?? new Date()).getTime())
              baseDate.setHours(selectedDate.getHours())
              baseDate.setMinutes(selectedDate.getMinutes())
              baseDate.setSeconds(0, 0)

              if (mode === "start") {
                setStartDateTime(baseDate)
              } else {
                setEndDateTime(baseDate)
              }
            }
          }}
        />
      )
    },
    [setStartDateTime, setEndDateTime, setShowStartTimePicker, setShowEndTimePicker],
  )

  return (
    <Template title="Add Proxy Gardener" onPressBack={() => router.back()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proxy details</Text>
            <Text style={styles.sectionSubtitle}>
              Share reminders with a trusted person while you’re away.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Helper"
                style={styles.input}
                placeholderTextColor="#A7A7A7"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                  style={styles.countryCodeButton}
                  onPress={() => setShowCountryCodeModal(true)}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Text style={styles.countryCodeText}>{selectedCountryCode.dialCode}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="8123 4567"
                  keyboardType="phone-pad"
                  style={styles.phoneInput}
                  placeholderTextColor="#A7A7A7"
                  editable={!isSubmitting}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start date & time</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
                activeOpacity={0.85}
                disabled={isSubmitting}
              >
                <Text style={styles.dateInputText}>{formattedStartDate}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End date & time</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndDatePicker(true)}
                activeOpacity={0.85}
                disabled={isSubmitting}
              >
                <Text style={styles.dateInputText}>{formattedEndDate}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {renderDatePicker(showStartDatePicker, setShowStartDatePicker, startDateTime, "start", true)}
        {renderDatePicker(showStartTimePicker, setShowStartTimePicker, startDateTime, "start", false)}
        {renderDatePicker(showEndDatePicker, setShowEndDatePicker, endDateTime, "end", true)}
        {renderDatePicker(showEndTimePicker, setShowEndTimePicker, endDateTime, "end", false)}

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

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          activeOpacity={0.9}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Add proxy</Text>
            </>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Template>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: hs(20),
    paddingBottom: vs(24),
  },
  contentContainer: {
    paddingBottom: vs(140),
    gap: vs(24),
  },
  section: {
    gap: vs(6),
    marginTop: vs(4),
  },
  sectionTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionSubtitle: {
    fontSize: ms(14),
    color: "#6F6F6F",
    lineHeight: ms(20),
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: ms(18),
    paddingHorizontal: hs(18),
    paddingVertical: vs(18),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.05)",
    gap: vs(18),
  },
  inputGroup: {
    gap: vs(8),
  },
  inputLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  input: {
    backgroundColor: "#F6F8F9",
    borderRadius: ms(14),
    paddingHorizontal: hs(16),
    paddingVertical: vs(14),
    fontSize: ms(15),
    color: "#1A1A1A",
  },
  dateInput: {
    backgroundColor: "#F6F8F9",
    borderRadius: ms(14),
    paddingHorizontal: hs(16),
    paddingVertical: vs(14),
  },
  dateInputText: {
    fontSize: ms(15),
    color: "#1A1A1A",
  },
  primaryButton: {
    marginTop: vs(12),
    backgroundColor: "#4CAF50",
    borderRadius: ms(16),
    paddingVertical: vs(16),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: hs(8),
    shadowColor: "#4CAF50",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#fff",
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: hs(8),
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F8F9",
    borderRadius: ms(14),
    paddingHorizontal: hs(12),
    paddingVertical: vs(14),
    gap: hs(6),
    minWidth: hs(80),
  },
  countryCodeText: {
    fontSize: ms(15),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F6F8F9",
    borderRadius: ms(14),
    paddingHorizontal: hs(16),
    paddingVertical: vs(14),
    fontSize: ms(15),
    color: "#1A1A1A",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  countryCodeModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingTop: vs(20),
    maxHeight: "70%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(-2) },
    shadowOpacity: 0.1,
    shadowRadius: ms(8),
  },
  countryCodeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(20),
    marginBottom: vs(20),
  },
  countryCodeModalTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  countryCodeList: {
    flexGrow: 0,
    flexShrink: 1,
  },
  countryCodeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  countryCodeItemSelected: {
    backgroundColor: "#F8F8F8",
  },
  countryCodeItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(12),
  },
  countryCodeItemDialCode: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1a1a1a",
    minWidth: hs(50),
  },
  countryCodeItemName: {
    fontSize: ms(15),
    color: "#666",
  },
})

