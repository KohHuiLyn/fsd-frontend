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

export default function AddProxyGardener() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
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
      await createProxy({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || null,
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
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+65 8123 4567"
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#A7A7A7"
                editable={!isSubmitting}
              />
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
})

