"use client"

import Template from "@/components/Template"
import { deleteProxy, getProxy, updateProxy } from "@/services/proxyService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
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

function parseProxyDate(value?: string | null): Date | null {
  if (!value) {
    return null
  }
  const normalized = value.replace(" ", "T")
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatProxyApiDateTime(date: Date | null): string | null {
  if (!date) {
    return null
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

export default function EditProxyGardener() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const proxyId = typeof params.id === "string" ? params.id : ""

  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [startDateTime, setStartDateTime] = useState<Date | null>(null)
  const [endDateTime, setEndDateTime] = useState<Date | null>(null)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const formattedStartDate = useMemo(() => formatProxyDisplayDate(startDateTime), [startDateTime])
  const formattedEndDate = useMemo(() => formatProxyDisplayDate(endDateTime), [endDateTime])

  const loadProxy = useCallback(async () => {
    if (!proxyId) {
      Alert.alert("Missing proxy", "No proxy identifier was provided.", [
        { text: "Back", onPress: () => router.back() },
      ])
      return
    }

    setIsLoading(true)
    try {
      const proxy = await getProxy(proxyId)
      console.log('proxy', JSON.stringify(proxy));
      if (!proxy) {
        Alert.alert("Proxy not found", "This proxy is no longer available.", [
          { text: "Back", onPress: () => router.back() },
        ])
        return
      }

      setName(proxy.name ?? "")
      setPhoneNumber(proxy.phoneNumber ?? "")
      setStartDateTime(parseProxyDate(proxy.startDate))
      setEndDateTime(parseProxyDate(proxy.endDate))
    } catch (error: any) {
      console.error("Failed to load proxy:", error)
      Alert.alert("Unable to load proxy", error?.message ?? "Please try again later.", [
        { text: "Back", onPress: () => router.back() },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [proxyId, router])

  useEffect(() => {
    loadProxy()
  }, [loadProxy])

  const handleSave = useCallback(async () => {
    if (!proxyId) {
      Alert.alert("Missing proxy", "No proxy identifier was provided.")
      return
    }

    if (!name.trim()) {
      Alert.alert("Missing name", "Please provide the proxy name.")
      return
    }

    setIsSubmitting(true)
    try {
      await updateProxy(proxyId, {
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || null,
        startDate: formatProxyApiDateTime(startDateTime),
        endDate: formatProxyApiDateTime(endDateTime),
      })
      Alert.alert("Changes saved", "Proxy details updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ])
    } catch (error: any) {
      console.error("Failed to update proxy:", error)
      Alert.alert("Unable to update", error?.message ?? "Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }, [proxyId, name, phoneNumber, startDateTime, endDateTime, router])

  const handleDelete = useCallback(() => {
    if (!proxyId) {
      return
    }

    Alert.alert(
      "Remove proxy",
      "Are you sure you want to delete this proxy?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProxy(proxyId)
              Alert.alert("Proxy removed", "The proxy has been deleted.", [
                { text: "Back", onPress: () => router.back() },
              ])
            } catch (error: any) {
              console.error("Failed to delete proxy:", error)
              Alert.alert("Unable to delete", error?.message ?? "Please try again later.")
            }
          },
        },
      ],
      { cancelable: true }
    )
  }, [proxyId, router])

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
    [],
  )

  if (isLoading) {
    return (
      <Template title="Proxy" onPressBack={() => router.back()}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </Template>
    )
  }

  return (
    <Template title={name || "Edit Proxy"} onPressBack={() => router.back()}>
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
            <Text style={styles.sectionTitle}>Edit proxy</Text>
            <Text style={styles.sectionSubtitle}>
              Update proxy information. They will receive the latest reminders once you save changes.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Helper"
                style={styles.input}
                placeholderTextColor="#A7A7A7"
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

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSave}
              activeOpacity={0.9}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Save changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E53935" />
              <Text style={styles.deleteButtonText}>Delete proxy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {renderDatePicker(showStartDatePicker, setShowStartDatePicker, startDateTime, "start", true)}
        {renderDatePicker(showStartTimePicker, setShowStartTimePicker, startDateTime, "start", false)}
        {renderDatePicker(showEndDatePicker, setShowEndDatePicker, endDateTime, "end", true)}
        {renderDatePicker(showEndTimePicker, setShowEndTimePicker, endDateTime, "end", false)}

      </KeyboardAvoidingView>
    </Template>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: hs(20),
    paddingBottom: vs(24),
    backgroundColor:'whitesmoke'
  },
  contentContainer: {
    paddingBottom: vs(140),
    gap: vs(24),
  },
  section: {
    gap: vs(6),
    marginTop: vs(10),
    backgroundColor:'white',
    padding: hs(16),

    borderRadius: ms(18),
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
    marginTop: vs(3),
    backgroundColor: "#4CAF50",
    borderRadius: ms(16),
    
    paddingVertical: vs(14),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: hs(8),
    shadowColor: "#4CAF50",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    width: "100%",
  },
  primaryButtonText: {
    fontSize: ms(14),
    fontWeight: "700",
    color: "#fff",
  },
  deleteButton: {
    marginTop: vs(3),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: "#E53935",
    paddingVertical: vs(14),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: hs(8),
    width: "100%",
  },
  deleteButtonText: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#E53935",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(60),
  },
})

