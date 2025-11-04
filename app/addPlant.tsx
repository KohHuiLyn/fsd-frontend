"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { horizontalScale as hs, verticalScale as vs, scaleFont } from "@/utils/scale"

export default function AddPlant() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const [plantName, setPlantName] = useState("")
  const [notes, setNotes] = useState("")
  const [location, setLocation] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  
  // Notification settings
  const [notificationTypes, setNotificationTypes] = useState({
    water: { enabled: false, schedule: "daily" },
    mist: { enabled: false, schedule: "daily" },
    prune: { enabled: false, schedule: "daily" },
    fertilise: { enabled: false, schedule: "daily" },
  })
  
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly" | "interval">("daily")
  const [selectedDays, setSelectedDays] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [intervalDays, setIntervalDays] = useState("1")
  
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"]
  
  const toggleNotification = (type: keyof typeof notificationTypes) => {
    setNotificationTypes((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled },
    }))
  }
  
  const toggleDay = (index: number) => {
    const newDays = [...selectedDays]
    newDays[index] = !newDays[index]
    setSelectedDays(newDays)
  }
  
  const handleSave = () => {
    // TODO: Save plant data
    console.log("Saving plant:", {
      plantName,
      notes,
      location,
      selectedImages,
      notificationTypes,
      scheduleType,
      selectedDays,
      intervalDays,
    })
    router.back()
  }
  
  const handleImagePicker = () => {
    // TODO: Implement image picker
    console.log("Image picker")
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Plant</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: vs(30) }}>
        {/* Plant Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant Image(s)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
            {selectedImages.length > 0 ? (
              <Image source={{ uri: selectedImages[0] }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color="#999" />
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Plant Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter plant name"
            value={plantName}
            onChangeText={setPlantName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {/* Schedule Type Selection */}
          <View style={styles.scheduleTypeContainer}>
            <TouchableOpacity
              style={[styles.scheduleTypeBtn, scheduleType === "daily" && styles.scheduleTypeBtnActive]}
              onPress={() => setScheduleType("daily")}
            >
              <Text style={[styles.scheduleTypeText, scheduleType === "daily" && styles.scheduleTypeTextActive]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scheduleTypeBtn, scheduleType === "weekly" && styles.scheduleTypeBtnActive]}
              onPress={() => setScheduleType("weekly")}
            >
              <Text style={[styles.scheduleTypeText, scheduleType === "weekly" && styles.scheduleTypeTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scheduleTypeBtn, scheduleType === "interval" && styles.scheduleTypeBtnActive]}
              onPress={() => setScheduleType("interval")}
            >
              <Text style={[styles.scheduleTypeText, scheduleType === "interval" && styles.scheduleTypeTextActive]}>
                Every X Days
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Days Selection */}
          {scheduleType === "weekly" && (
            <View style={styles.daysContainer}>
              {weekDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayButton, selectedDays[index] && styles.dayButtonActive]}
                  onPress={() => toggleDay(index)}
                >
                  <Text style={[styles.dayText, selectedDays[index] && styles.dayTextActive]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Interval Days Input */}
          {scheduleType === "interval" && (
            <View style={styles.intervalContainer}>
              <TextInput
                style={styles.intervalInput}
                placeholder="1"
                value={intervalDays}
                onChangeText={setIntervalDays}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.intervalLabel}>days</Text>
            </View>
          )}

          {/* Notification Types */}
          <View style={styles.notificationTypes}>
            {Object.entries(notificationTypes).map(([key, value]) => (
              <View key={key} style={styles.notificationRow}>
                <View style={styles.notificationLeft}>
                  <Ionicons
                    name={
                      key === "water"
                        ? "water-outline"
                        : key === "mist"
                        ? "water-outline"
                        : key === "prune"
                        ? "cut-outline"
                        : "flower-outline"
                    }
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.notificationLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </View>
                <Switch
                  value={value.enabled}
                  onValueChange={() => toggleNotification(key as keyof typeof notificationTypes)}
                  trackColor={{ false: "#ddd", true: "#4CAF50" }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes about your plant..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Living room, Balcony"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: scaleFont(18),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  saveButton: {
    fontSize: scaleFont(16),
    fontWeight: "600",
    color: "#4CAF50",
  },
  section: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(20),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: scaleFont(16),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(12),
  },
  imagePicker: {
    width: "100%",
    height: vs(200),
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: scaleFont(14),
    color: "#999",
    marginTop: vs(8),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: hs(12),
    paddingVertical: vs(12),
    fontSize: scaleFont(14),
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  textArea: {
    height: vs(100),
    paddingTop: vs(12),
  },
  scheduleTypeContainer: {
    flexDirection: "row",
    marginBottom: vs(16),
    gap: hs(8),
  },
  scheduleTypeBtn: {
    flex: 1,
    paddingVertical: vs(10),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  scheduleTypeBtnActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  scheduleTypeText: {
    fontSize: scaleFont(14),
    fontWeight: "500",
    color: "#1a1a1a",
  },
  scheduleTypeTextActive: {
    color: "#fff",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: vs(16),
  },
  dayButton: {
    width: hs(40),
    height: hs(40),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dayText: {
    fontSize: scaleFont(12),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  dayTextActive: {
    color: "#fff",
  },
  intervalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vs(16),
  },
  intervalInput: {
    width: hs(60),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: hs(12),
    paddingVertical: vs(12),
    fontSize: scaleFont(14),
    color: "#1a1a1a",
    marginRight: hs(8),
  },
  intervalLabel: {
    fontSize: scaleFont(14),
    color: "#1a1a1a",
  },
  notificationTypes: {
    marginTop: vs(8),
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(12),
  },
  notificationLabel: {
    fontSize: scaleFont(14),
    fontWeight: "500",
    color: "#1a1a1a",
  },
})
