"use client"

import { createUserPlant } from "@/services/myPlantService"
import { horizontalScale as hs, scaleFont, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function AddPlant() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const [plantName, setPlantName] = useState("")
  const [notes, setNotes] = useState("")
  const [location, setLocation] = useState("")
  const [selectedImage, setSelectedImage] = useState<{ uri: string; name: string; type: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Notification settings - each activity has its own schedule
  const [notificationTypes, setNotificationTypes] = useState({
    water: { 
      enabled: false, 
      scheduleType: "daily" as "daily" | "weekly" | "interval",
      selectedDays: [false, false, false, false, false, false, false] as boolean[],
      intervalDays: "1"
    },
    mist: { 
      enabled: false, 
      scheduleType: "daily" as "daily" | "weekly" | "interval",
      selectedDays: [false, false, false, false, false, false, false] as boolean[],
      intervalDays: "1"
    },
    prune: { 
      enabled: false, 
      scheduleType: "daily" as "daily" | "weekly" | "interval",
      selectedDays: [false, false, false, false, false, false, false] as boolean[],
      intervalDays: "1"
    },
    fertilise: { 
      enabled: false, 
      scheduleType: "daily" as "daily" | "weekly" | "interval",
      selectedDays: [false, false, false, false, false, false, false] as boolean[],
      intervalDays: "1"
    },
  })
  
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"]
  
  const toggleNotification = (type: keyof typeof notificationTypes) => {
    setNotificationTypes((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled },
    }))
  }
  
  const setScheduleType = (type: keyof typeof notificationTypes, scheduleType: "daily" | "weekly" | "interval") => {
    setNotificationTypes((prev) => ({
      ...prev,
      [type]: { ...prev[type], scheduleType },
    }))
  }
  
  const toggleDay = (activityType: keyof typeof notificationTypes, index: number) => {
    setNotificationTypes((prev) => {
      const newDays = [...prev[activityType].selectedDays]
      newDays[index] = !newDays[index]
      return {
        ...prev,
        [activityType]: { ...prev[activityType], selectedDays: newDays },
      }
    })
  }
  
  const setIntervalDays = (type: keyof typeof notificationTypes, days: string) => {
    setNotificationTypes((prev) => ({
      ...prev,
      [type]: { ...prev[type], intervalDays: days },
    }))
  }
  
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos to attach a picture.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    })

    if (result.canceled || !result.assets?.length) {
      return
    }

    const asset = result.assets[0]
    if (!asset?.uri) {
      Alert.alert("Unable to use image", "No image URI was returned.")
      return
    }

    const mimeType = asset.mimeType ?? (asset.uri.endsWith(".png") ? "image/png" : "image/jpeg")
    const filename = asset.fileName ?? asset.uri.split("/").pop() ?? `plant-${Date.now()}.jpg`

    setSelectedImage({
      uri: asset.uri,
      name: filename,
      type: mimeType,
    })
  }

  const handleSave = async () => {
    if (!plantName.trim()) {
      Alert.alert("Validation Error", "Please enter a plant name.")
      return
    }

    setIsSaving(true)
    try {
      console.log('Creating plant with:', {
        plantName: plantName.trim(),
        notes: notes.trim() || undefined,
        imageFile: selectedImage,
      })
      
      await createUserPlant({
        plantName: plantName.trim(),
        notes: notes.trim() || undefined,
        imageFile: selectedImage ?? undefined,
      })
      Alert.alert("Success", "Plant created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error: any) {
      console.error("Failed to create plant:", error)
      Alert.alert("Unable to create plant", error?.message ?? "Please try again later.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Plant</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: vs(30) }}>
        {/* Plant Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant Image(s)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="camera-outline" size={32} color="#999" />
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

          {/* Notification Types with Individual Schedules */}
          <View style={styles.notificationTypes}>
            {Object.entries(notificationTypes).map(([key, value]) => {
              const activityType = key as keyof typeof notificationTypes
              return (
                <View key={key} style={styles.notificationItem}>
                  {/* Activity Toggle Row */}
                  <View style={styles.notificationRow}>
                    <View style={styles.notificationLeft}>
                      <MaterialCommunityIcons
                        name={
                          key === "water"
                            ? "water"
                            : key === "mist"
                            ? "water"
                            : key === "prune"
                            ? "content-cut"
                            : "flower"
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
                      onValueChange={() => toggleNotification(activityType)}
                      trackColor={{ false: "#ddd", true: "#4CAF50" }}
                      thumbColor="#fff"
                    />
                  </View>

                  {/* Schedule Options - Only show when enabled */}
                  {value.enabled && (
                    <View style={styles.scheduleOptions}>
                      {/* Schedule Type Selection */}
                      <View style={styles.scheduleTypeContainer}>
                        <TouchableOpacity
                          style={[styles.scheduleTypeBtn, value.scheduleType === "daily" && styles.scheduleTypeBtnActive]}
                          onPress={() => setScheduleType(activityType, "daily")}
                        >
                          <Text style={[styles.scheduleTypeText, value.scheduleType === "daily" && styles.scheduleTypeTextActive]}>
                            Daily
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.scheduleTypeBtn, value.scheduleType === "weekly" && styles.scheduleTypeBtnActive]}
                          onPress={() => setScheduleType(activityType, "weekly")}
                        >
                          <Text style={[styles.scheduleTypeText, value.scheduleType === "weekly" && styles.scheduleTypeTextActive]}>
                            Weekly
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.scheduleTypeBtn, value.scheduleType === "interval" && styles.scheduleTypeBtnActive]}
                          onPress={() => setScheduleType(activityType, "interval")}
                        >
                          <Text style={[styles.scheduleTypeText, value.scheduleType === "interval" && styles.scheduleTypeTextActive]}>
                            Every X Days
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Weekly Days Selection */}
                      {value.scheduleType === "weekly" && (
                        <View style={styles.daysContainer}>
                          {weekDays.map((day, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[styles.dayButton, value.selectedDays[index] && styles.dayButtonActive]}
                              onPress={() => toggleDay(activityType, index)}
                            >
                              <Text style={[styles.dayText, value.selectedDays[index] && styles.dayTextActive]}>{day}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Interval Days Input */}
                      {value.scheduleType === "interval" && (
                        <View style={styles.intervalContainer}>
                          <TextInput
                            style={styles.intervalInput}
                            placeholder="1"
                            value={value.intervalDays}
                            onChangeText={(text) => setIntervalDays(activityType, text)}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                          />
                          <Text style={styles.intervalLabel}>days</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )
            })}
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
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: vs(16),
    marginBottom: vs(16),
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: vs(12),
  },
  scheduleOptions: {
    marginTop: vs(12),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
