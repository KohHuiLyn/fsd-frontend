"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import fallbackPlantImage from "@/assets/images/dummy/chilli_padi.jpg"
import Template from "@/components/Template"
import AnalyticsTab from "../components/PlantDetails/AnalyticsTab"
import GalleryTab from "../components/PlantDetails/GalleryTab"
import JournalTab from "../components/PlantDetails/JournalTab"
import ToDoTab from "../components/PlantDetails/ToDoTab"

export default function PlantDetails() {
  const router = useRouter()
  const params = useLocalSearchParams() // 🌿 get params from router.push()
  
  const [activeTab, setActiveTab] = useState("todo")
  const [showNewEntry, setShowNewEntry] = useState(false)

  // 🌱 handle plant data from params
  const rawName = typeof params.name === "string" ? params.name : undefined
  const rawImage = typeof params.image === "string" ? params.image : undefined
  const rawNotes = typeof params.notes === "string" ? params.notes : undefined

  console.log(rawImage)
  const resolvedName = rawName && rawName.trim() ? rawName.trim() : "Chili Padi"

  let decodedImageUri: string | null = null
  if (rawImage && rawImage.trim()) {
    try {
      decodedImageUri = rawImage
    } catch (error) {
      decodedImageUri = rawImage.trim()
    }
  }

  const resolvedNotes = rawNotes && rawNotes.trim() ? rawNotes.trim() : "No notes added yet."

  const plantData = {
    name: resolvedName,
    image: decodedImageUri ? { uri: decodedImageUri } : fallbackPlantImage,
    notes: resolvedNotes,
    lastWatered: "30/11/25 10:03PM",
  }

  const tabs = [
    { id: "todo", label: "To-Do" },
    { id: "journal", label: "Journal" },
    { id: "analytics", label: "Analytics" },
    { id: "gallery", label: "Gallery" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "todo":
        return <ToDoTab />
      case "journal":
        return <JournalTab showNewEntry={showNewEntry} setShowNewEntry={setShowNewEntry} />
      case "analytics":
        return <AnalyticsTab />
      case "gallery":
        return <GalleryTab />
      default:
        return null
    }
  }

  return (
    <View style={styles.wrapper}>
      <Template
        title={String(plantData.name)}
        image={plantData.image}
        imageHeader
        onPressBack={() => router.back()}
        
      >
        <View style={styles.infoSection}>
          <Text style={styles.plantName}>{plantData.name}</Text>
          <Text style={styles.lastWatered}>Last watered {plantData.lastWatered}</Text>

          {/* Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{plantData.notes}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsWrapper}>
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>{renderTabContent()}</View>
        </View>
      </Template>

      {/* Floating Action Button - Only show on Journal tab */}
      {activeTab === "journal" && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setShowNewEntry(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="pencil" size={ms(24)} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  plantImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  plantName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  lastWatered: {
    fontSize: 13,
    color: "#999",
    marginBottom: 15,
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  tabsWrapper: {
    marginHorizontal: -20,
    paddingBottom: 10,
    marginBottom: 0,
    backgroundColor: "#F5F5F5",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    backgroundColor:'white'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
  },
  tabLabelActive: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  tabContent: {
    marginHorizontal: -20,
    backgroundColor: "#F5F5F5",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fab: {
    position: "absolute",
    bottom: vs(20),
    right: hs(16),
    width: hs(56),
    height: hs(56),
    borderRadius: ms(28),
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.3,
    shadowRadius: ms(6),
    zIndex: 1000,
  },
})
