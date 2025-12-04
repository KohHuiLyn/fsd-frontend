"use client"

import { useAuth } from "@/contexts/AuthContext"
import { createReminder, deleteReminder, getReminders, type Reminder as ReminderDto } from "@/services/reminderService"
import { getUserProfile } from "@/services/userService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type ReminderCategory = "all" | "water" | "fertilise" | "mist"

type ReminderItem = {
  id: string
  name: string
  notes?: string | null
  dueAt?: string
  category: ReminderCategory
}

type DateItem = {
  date: Date
  isSelected: boolean
}

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  all: "All",
  water: "Water",
  fertilise: "Fertilise",
  mist: "Mist",
}

const CATEGORY_ICONS: Record<ReminderCategory, string> = {
  all: "calendar-check",
  water: "water",
  fertilise: "flower",
  mist: "weather-partly-rainy",
}


const WEEKDAY_OPTIONS = [
  { label: "S", value: 0, fullLabel: "Sun" },
  { label: "M", value: 1, fullLabel: "Mon" },
  { label: "T", value: 2, fullLabel: "Tue" },
  { label: "W", value: 3, fullLabel: "Wed" },
  { label: "T", value: 4, fullLabel: "Thu" },
  { label: "F", value: 5, fullLabel: "Fri" },
  { label: "S", value: 6, fullLabel: "Sat" },
] as const

export default function Reminders() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<number>(2)
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false)
  const [newReminderName, setNewReminderName] = useState<string>("")
  const [newReminderNotes, setNewReminderNotes] = useState<string>("")
  const [newReminderDueAt, setNewReminderDueAt] = useState<string>(new Date().toISOString())
  const [newReminderSelectedDays, setNewReminderSelectedDays] = useState<Set<number>>(new Set())
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null)

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date())
  
  const today = useMemo(() => new Date(), [])
  const dates: DateItem[] = useMemo(() => {
    const items: DateItem[] = []
    for (let i = -2; i <= 2; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      items.push({ date, isSelected: i === 0 })
    }
    return items
  }, [today])

  const mapDtoToReminderItem = useCallback((dto: ReminderDto): ReminderItem => {
    const name = dto.name || (dto as any).rName || (dto as any).r_name || "Reminder"
    const normalizedName = name.toLowerCase()
    let category: ReminderCategory = "all"
    if (normalizedName.includes("fertil")) {
      category = "fertilise"
    } else if (normalizedName.includes("mist")) {
      category = "mist"
    } else if (normalizedName.includes("water")) {
      category = "water"
    }

    const rawDueAt = (dto as any).dueAt ?? (dto as any).due_at
    const dueAt = rawDueAt == null ? undefined : String(rawDueAt)

    return {
      id: dto.id,
      name,
      notes: dto.notes ?? null,
      dueAt,
      category,
    }
  }, [])
  function isSameDay(dateA: Date, dateB: Date): boolean {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }
  
  const loadReminders = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (options?.refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const data = await getReminders()
        setReminders((data ?? []).map(mapDtoToReminderItem))
        setError(null)
      } catch (err: any) {
        console.error("Failed to load reminders:", err)
        if (typeof err?.message === "string" && err.message.toLowerCase().includes("notfound")) {
          setReminders([])
          setError(null)
        } else {
          setError(err?.message ?? "Unable to load reminders")
        }
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [mapDtoToReminderItem]
  )

  useEffect(() => {
    loadReminders()
  }, [loadReminders])

  // Load user phone number from profile
  useEffect(() => {
    const loadUserPhoneNumber = async () => {
      if (!user?.id) {
        return
      }

      try {
        const profile = await getUserProfile(user.id)
        setUserPhoneNumber(profile.phoneNumber ?? null)
      } catch (error) {
        console.error("Failed to load user phone number:", error)
        // Fallback to user object phone number if available
        setUserPhoneNumber(user.phoneNumber ?? null)
      }
    }

    loadUserPhoneNumber()
  }, [user?.id, user?.phoneNumber])

  const filteredReminders = useMemo(() => {
    const targetDate = dates[selectedDate]?.date;
    if (!targetDate) return reminders;
  
    return reminders.filter((reminder) => {
      // Date filter only
      if (!reminder.dueAt) return false;
      const reminderDate = new Date(reminder.dueAt);
      const matchDate = isSameDay(reminderDate, targetDate);
  
      return matchDate;
    });
  }, [reminders, selectedDate, dates]);
  
  

  const resetCreateForm = useCallback(() => {
    setNewReminderName("")
    setNewReminderNotes("")
    setNewReminderDueAt(new Date().toISOString())
    setNewReminderSelectedDays(new Set())
  }, [])

  const handleCreateReminder = useCallback(async () => {
    if (!newReminderName.trim()) {
      Alert.alert("Reminder name required", "Please enter a reminder name.")
      return
    }

    const dueDayArray = Array.from(newReminderSelectedDays).sort((a, b) => a - b)

    // Format phone number: add +65 if it doesn't start with +
    let formattedPhoneNumber: string | null = null
    if (userPhoneNumber) {
      const trimmedPhone = userPhoneNumber.trim()
      if (trimmedPhone.startsWith("+")) {
        formattedPhoneNumber = trimmedPhone
      } else {
        formattedPhoneNumber = `+65 ${trimmedPhone}`
      }
    }

    setIsSubmitting(true)
    try {
      await createReminder({
        rName: newReminderName.trim(),
        notes: newReminderNotes.trim() ? newReminderNotes.trim() : null,
        dueAt: normalizeDueAtInput(newReminderDueAt),
        dueDay: dueDayArray,
        isActive: true,
        isProxy: false,
        proxy: formattedPhoneNumber,
      })
      resetCreateForm()
      setIsCreateModalVisible(false)
      await loadReminders()
    } catch (error: any) {
      console.error("Failed to create reminder:", error)
      Alert.alert("Unable to create reminder", error?.message ?? "Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }, [newReminderName, newReminderNotes, newReminderDueAt, newReminderSelectedDays, userPhoneNumber, loadReminders, resetCreateForm])

  const handleDeleteReminder = useCallback(
    (reminderId: string) => {
      Alert.alert(
        "Delete reminder",
        "Are you sure you want to delete this reminder?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteReminder(reminderId)
                setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId))
              } catch (error: any) {
                console.error("Failed to delete reminder:", error)
                Alert.alert("Unable to delete reminder", error?.message ?? "Please try again later.")
              }
            },
          },
        ],
        { cancelable: true }
      )
    },
    []
  )

  const toggleDueDaySelection = useCallback((dayValue: number) => {
    setNewReminderSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayValue)) {
        next.delete(dayValue)
      } else {
        next.add(dayValue)
      }
      return next
    })
  }, [])

  const formatDate = (date: Date) => {
    const month = date.toLocaleString("default", { month: "short" })
    const day = date.getDate()
    const weekday = date.toLocaleString("default", { weekday: "short" })
    return { month, day, weekday }
  }

  function formatFriendlyDate(dateString: string): string {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return dateString
    }
    const relativeFormatter = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    })
    return relativeFormatter.format(date)
  }

  function normalizeDueAtInput(input: string): string | null {
    const trimmed = input.trim()
    if (!trimmed) {
      return null
    }
  
    // Try to parse into Date
    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) {
      console.warn("Invalid date input:", trimmed)
      return null
    }
  
    // Convert to "YYYY-MM-DD HH:mm:ss+00" (UTC-based)
    const yyyy = parsed.getUTCFullYear()
    const mm = String(parsed.getUTCMonth() + 1).padStart(2, "0")
    const dd = String(parsed.getUTCDate()).padStart(2, "0")
    const hh = String(parsed.getUTCHours()).padStart(2, "0")
    const mi = String(parsed.getUTCMinutes()).padStart(2, "0")
    const ss = String(parsed.getUTCSeconds()).padStart(2, "0")
  
    // This is the key difference — no "T", no "Z", but explicit +00 offset
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}+00`
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reminders</Text>
        {error ? <Text style={styles.headerError}>{error}</Text> : null}
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSelector}
        >
        {dates.map((dateItem, index) => {
          const { month, day, weekday } = formatDate(dateItem.date)
          const isSelected = index === selectedDate
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => setSelectedDate(index)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                {month}
              </Text>
              <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                {day}
              </Text>
              <Text style={[styles.dateWeekday, isSelected && styles.dateTextSelected]}>
                {weekday}
              </Text>
            </TouchableOpacity>
          )
        })}
        </ScrollView>
      </View>

      {/* Reminder List */}
      <FlatList
        data={filteredReminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reminderList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Text style={styles.emptyStateText}>No reminders found</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View key={item.id} style={styles.reminderCard}>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderName}>{item.name}</Text>
              {item.notes ? <Text style={styles.reminderNotes}>{item.notes}</Text> : null}
              <View style={styles.timeRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
                <Text style={styles.timeText}>{item.dueAt ? formatFriendlyDate(item.dueAt) : "No due time"}</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={CATEGORY_ICONS[item.category] as any}
                  size={32}
                  color="#4CAF50"
                />
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteReminder(item.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadReminders({ refresh: true })}
            tintColor="#4CAF50"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          resetCreateForm()
          setIsCreateModalVisible(true)
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        transparent
        animationType="slide"
        visible={isCreateModalVisible}
        onRequestClose={() => {
          if (!isSubmitting) {
            setIsCreateModalVisible(false)
          }
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              if (!isSubmitting) {
                setIsCreateModalVisible(false)
              }
            }}
          />
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>Create Reminder</Text>
              <Text style={styles.modalLabel}>Reminder Name</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Reminder name"
              value={newReminderName}
              onChangeText={setNewReminderName}
              editable={!isSubmitting}
            />
              <Text style={styles.modalLabel}>Notes (optional)</Text>

            <TextInput
              style={[styles.modalInput, styles.modalInputMultiline]}
              placeholder="Water with care"
              value={newReminderNotes}
              onChangeText={setNewReminderNotes}
              editable={!isSubmitting}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>When should we remind you?</Text>
              <View>
  <TouchableOpacity
    style={styles.modalInput}
    onPress={() => setShowDatePicker(true)}
    disabled={isSubmitting}
  >
    <Text style={{ color: "#1a1a1a" }}>
      {selectedDateTime.toLocaleString()}
    </Text>
  </TouchableOpacity>

  {showDatePicker && (
    <DateTimePicker
      value={selectedDateTime}
      mode="date"
      display={Platform.OS === "ios" ? "spinner" : "default"}
      onChange={(event, date) => {
        setShowDatePicker(false)
        if (date) {
          const newDate = new Date(date)
          newDate.setHours(selectedDateTime.getHours())
          newDate.setMinutes(selectedDateTime.getMinutes())
          setSelectedDateTime(newDate)
          setShowTimePicker(true)
        }
      }}
    />
  )}

  {showTimePicker && (
    <DateTimePicker
      value={selectedDateTime}
      mode="time"
      is24Hour={true}
      display={Platform.OS === "ios" ? "spinner" : "default"}
      onChange={(event, time) => {
        setShowTimePicker(false)
        if (time) {
          const newDate = new Date(selectedDateTime)
          newDate.setHours(time.getHours())
          newDate.setMinutes(time.getMinutes())
          setSelectedDateTime(newDate)
          setNewReminderDueAt(newDate.toISOString()) // update your existing string state
        }
      }}
    />
  )}
</View>

            </View>

            <View style={styles.modalFormGroup}>
              <Text style={styles.modalLabel}>Remind me on</Text>
              <View style={styles.dueDayRow}>
                {WEEKDAY_OPTIONS.map((option) => {
                  const isSelected = newReminderSelectedDays.has(option.value)
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.dueDayButton, isSelected && styles.dueDayButtonSelected]}
                      onPress={() => toggleDueDaySelection(option.value)}
                      activeOpacity={0.75}
                      disabled={isSubmitting}
                    >
                      <Text style={[styles.dueDayLabel, isSelected && styles.dueDayLabelSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleCreateReminder}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalSubmitButtonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(15),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerError: {
    marginTop: vs(4),
    fontSize: ms(12),
    color: "#D32F2F",
  },
  dateSelectorContainer: {
    height: vs(120),
    paddingVertical: vs(10),
  },
  dateSelector: {
    paddingHorizontal: hs(15),
    gap: hs(10),
  },
  dateCard: {
    width: hs(70),
    paddingVertical: vs(12),
    paddingHorizontal: hs(8),
    backgroundColor: "#fff",
    borderRadius: ms(12),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateCardSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dateMonth: {
    fontSize: ms(12),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  dateDay: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  dateWeekday: {
    fontSize: ms(11),
    fontWeight: "500",
    color: "#666",
  },
  dateTextSelected: {
    color: "#fff",
  },
  reminderList: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
    paddingBottom: vs(100),
  },
  reminderCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.05,
    shadowRadius: ms(3),
    elevation: 2,
  },
  reminderContent: {
    flex: 1,
  },
  reminderName: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(6),
  },
  reminderNotes: {
    fontSize: ms(13),
    color: "#666",
    marginBottom: vs(10),
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(6),
  },
  timeText: {
    fontSize: ms(12),
    color: "#999",
  },
  cardActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: hs(12),
  },
  iconContainer: {
    paddingTop: vs(4),
  },
  deleteButton: {
    marginTop: vs(12),
    padding: ms(6),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(60),
  },
  emptyStateText: {
    fontSize: ms(16),
    color: "#999",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: hs(20),
    bottom: vs(30),
    width: hs(56),
    height: hs(56),
    borderRadius: hs(28),
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.2,
    shadowRadius: ms(4),
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    paddingHorizontal: hs(20),
    paddingTop: vs(24),
    paddingBottom: vs(28),
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
  },
  modalTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(16),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: ms(12),
    paddingHorizontal: hs(14),
    paddingVertical: vs(12),
    fontSize: ms(14),
    color: "#1a1a1a",
    marginBottom: vs(12),
  },
  modalInputMultiline: {
    minHeight: vs(80),
    textAlignVertical: "top",
  },
  modalSubmitButton: {
    marginTop: vs(4),
    backgroundColor: "#4CAF50",
    paddingVertical: vs(14),
    borderRadius: ms(12),
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitButtonText: {
    color: "#fff",
    fontSize: ms(16),
    fontWeight: "600",
  },
  modalFormGroup: {
    marginBottom: vs(12),
  },
  modalLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  dueDayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: hs(8),
    marginTop: vs(8),
  },
  dueDayButton: {
    width: hs(40),
    paddingVertical: vs(10),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: "#cfcfcf",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dueDayButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dueDayLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  dueDayLabelSelected: {
    color: "#fff",
  },
  dueDayHelper: {
    marginTop: vs(6),
    fontSize: ms(11),
    color: "#777",
  },
})
