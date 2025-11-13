import logo from "@/assets/images/logo.png"
import monsterra from "@/assets/images/monsterra.png"
import plantDoctor from "@/assets/images/plant_doctor.png"
import reminder_new from "@/assets/images/reminder.png"
import snakeplant from "@/assets/images/snakeplant.png"
import { getUserPlants, type UserPlant } from "@/services/myPlantService"
import { getReminders, type Reminder } from "@/services/reminderService"
import { horizontalScale as hs, scaleFont, verticalScale as vs } from "@/utils/scale"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
const REMINDER_ICON_URL = reminder_new

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const FALLBACK_PLANT_IMAGE = require("@/assets/images/dummy_image.jpg") as ImageSourcePropType

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const popularPlants = [
    {
      id: "1",
      name: "Peperomia Houseplant",
      image: monsterra,
    },
    {
      id: "2",
      name: "Asplenium Houseplant",
      image: snakeplant,
    },
  ]
  const [userPlants, setUserPlants] = useState<UserPlant[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadHomeData = useCallback(async (options?: { refresh?: boolean }) => {
    if (options?.refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const [plantsResponse, remindersResponse] = await Promise.all([getUserPlants(), getReminders()])
      setUserPlants(plantsResponse)
      setReminders(remindersResponse)
      setError(null)
    } catch (err: any) {
      console.error("Failed to load home data:", err)
      setError(err?.message ?? "Unable to load dashboard data.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadHomeData()
    }, [loadHomeData])
  )

  const topPlants = useMemo(() => userPlants.slice(0, 3), [userPlants])
  const todaysReminders = useMemo(
    () => reminders.filter(isReminderForToday).slice(0, 3),
    [reminders]
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + vs(50) }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadHomeData({ refresh: true })}
          tintColor="#4CAF50"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Popular Plants Section - Enhanced with card styling */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular plants</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
          {popularPlants.map((plant) => (
            <TouchableOpacity key={plant.id} style={styles.popularItem} activeOpacity={0.9}>
              {/* Image floats above the card */}
              <Image source={plant.image} style={styles.popularImage} />
              {/* Card */}
              <View style={styles.popularCard}>
                <Text style={styles.popularName}>{plant.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Plant Doctor */}
      
      <Pressable onPress={() => router.push("/diagnosisCamera")}>
      <View style={styles.doctorWrapper}>
        <View style={styles.doctorCard}>
          <View style={styles.doctorImageWrapper}>
            <Image source={plantDoctor} style={styles.doctorImage} resizeMode="contain" />
          </View>
          <View style={styles.doctorContent}>
            <Text style={styles.doctorTitle}>Plant Doctor</Text>
            <Text style={styles.doctorDesc}>
              Upload a photo of your plant and get an AI-powered diagnosis of your plant in seconds!
            </Text>
              <Text style={styles.diagnosisBtn}>Start Diagnosis →</Text>

          </View>
        </View>
      </View>
      </Pressable>

      {/* My Plants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Plants</Text>
          <TouchableOpacity onPress={() => router.push("/myplants")}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {isLoading && userPlants.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        ) : topPlants.length === 0 ? (
          <Text style={styles.emptyStateText}>Add your first plant to see it here.</Text>
        ) : (
          topPlants.map((plant) => {
            const plantImageSource = plant.imageUrl ? { uri: plant.imageUrl } : FALLBACK_PLANT_IMAGE
            const addedDate = formatPlantDate(plant.createdAt)
            const plantName = plant.name ?? plant.plantName ?? "Unnamed plant"

            return (
              <TouchableOpacity
                key={plant.id}
                style={styles.myPlantRow}
                onPress={() =>
                  router.push({
                    pathname: "/plantDetails",
                    params: {
                      id: plant.id,
                      name: plantName,
                      notes: plant.notes ?? "",
                      image: plant.imageUrl ? encodeURIComponent(plant.imageUrl) : "",
                    },
                  })
                }
              >
                <Image source={plantImageSource} style={styles.myPlantImage} />
                <View>
                  <Text style={styles.myPlantName}>{plantName}</Text>
                  {addedDate ? <Text style={styles.myPlantDate}>Added on {addedDate}</Text> : null}
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </View>

      {/* Reminders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reminders for today</Text>
        </View>

        {isLoading && reminders.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        ) : todaysReminders.length === 0 ? (
          <Text style={styles.emptyStateText}>No reminders due today.</Text>
        ) : (
          todaysReminders.map((reminder) => {
            const subtitle = formatReminderSubtitle(reminder)

            return (
              <View key={reminder.id} style={styles.reminderCard}>
                                
                <Image source={REMINDER_ICON_URL} style={styles.reminderImage} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderTitle}>{reminder.name}</Text>
                  {subtitle ? <Text style={styles.reminderDesc}>{subtitle}</Text> : null}
                </View>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}

function formatPlantDate(dateString?: string | null): string | null {
  if (!dateString) {
    return null
  }

  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function parseReminderDate(value?: string | null): Date | null {
  if (!value) {
    return null
  }

  const normalized = value.includes(" ") && !value.includes("T") ? value.replace(" ", "T") : value
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isReminderForToday(reminder: Reminder): boolean {
  const today = new Date()
  const dueDate = parseReminderDate(reminder.dueAt)

  if (dueDate && isSameDay(dueDate, today)) {
    return true
  }

  if (Array.isArray(reminder.dueDay) && reminder.dueDay.length > 0) {
    const todayIndex = today.getDay()
    return reminder.dueDay.includes(todayIndex)
  }

  return false
}

function formatReminderSubtitle(reminder: Reminder): string | null {
  if (reminder.notes) {
    return reminder.notes
  }

  const dueDate = parseReminderDate(reminder.dueAt)
  if (dueDate) {
    return `Due ${dueDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
  }

  if (Array.isArray(reminder.dueDay) && reminder.dueDay.length > 0) {
    const labels = reminder.dueDay
      .map((day) => WEEKDAY_LABELS[day] ?? `Day ${day}`)
      .join(", ")
    return `Repeats on ${labels}`
  }

  return null
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: hs(20),
    paddingTop: vs(20),
  },
  header: {
    marginVertical: 10,
  },
  logoImage: {
    width: hs(140),
    height: vs(42),
    marginHorizontal:hs(-25)
  },
  section: {
    marginBottom: vs(30),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: "#1a1a1a",
    
    marginBottom: vs(10),
  },
  viewAll: {
    fontSize: scaleFont(14),
    color: "#4CAF50",
    fontWeight: "500",
  },
  popularScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  popularItem: {
    width: hs(160),
    marginRight: hs(16),
    position: "relative",
    paddingTop: vs(45), // space for image that peeks out
  },
  popularCard: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    overflow: "hidden",
    paddingTop: vs(60),
    paddingHorizontal: hs(12),
    paddingBottom: vs(18),
  },
  popularImage: {
    position: "absolute",
    top: vs(12), // peeks from container, not clipped by card radius

    right: -30,
    marginLeft: "auto",
    marginRight: "auto",
    width: hs(145),
    height: hs(145),
    resizeMode: "contain",
    zIndex: 2,
  },
  popularName: {
    fontSize: scaleFont(14),
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "left",
    paddingRight: hs(10),
  },
  doctorWrapper: {
    marginBottom: vs(30),
  },
  doctorCard: {
    backgroundColor: "#1abc9c",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  doctorImageWrapper: {
    height: vs(150),
    justifyContent: "center",
    alignItems: "center",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  doctorContent: {
    backgroundColor: "#e0f7f4",
    padding: hs(16),
  },
  doctorTitle: {
    fontSize: scaleFont(16),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  doctorDesc: {
    fontSize: scaleFont(13),
    color: "#333",
    lineHeight: vs(18),
    marginBottom: 12,
  },
  diagnosisBtn: {
    fontSize: scaleFont(14),
    fontWeight: "700",
    color: "#000",
  },
  myPlantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vs(15),
    paddingBottom: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  myPlantImage: {
    width: hs(60),
    height: hs(60),
    borderRadius: hs(12),
    marginRight: hs(15),
  },
  myPlantDate: {
    fontSize: scaleFont(12),
    color: "#999",
    marginBottom: 4,
  },
  myPlantName: {
    fontSize: scaleFont(15),
    fontWeight: "600",
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: hs(12),
    borderRadius: 12,
    marginBottom: vs(12),
  },
  reminderImage: {
    width: hs(50),
    height: hs(50),
    borderRadius: hs(10),
    marginRight: hs(12),
  },
  reminderTitle: {
    fontSize: scaleFont(14),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  reminderDesc: {
    fontSize: scaleFont(12),
    color: "#666",
    lineHeight: vs(16),
  },
  loadingContainer: {
    paddingVertical: vs(20),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: scaleFont(13),
    color: "#7A7A7A",
    fontStyle: "italic",
    marginBottom: vs(10),
  },
  errorText: {
    color: "#D32F2F",
    fontSize: scaleFont(12),
    marginBottom: vs(12),
  },
})
