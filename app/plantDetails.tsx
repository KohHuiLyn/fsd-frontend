"use client"

import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import Template from "@/components/Template"
import AnalyticsTab from "../components/PlantDetails/AnalyticsTab"
import GalleryTab from "../components/PlantDetails/GalleryTab"
import JournalTab from "../components/PlantDetails/JournalTab"
import ToDoTab from "../components/PlantDetails/ToDoTab"
const { width } = Dimensions.get("window")

export default function PlantDetails() {
  const router = useRouter()
  const params = useLocalSearchParams() // 🌿 get params from router.push()
  
  const [activeTab, setActiveTab] = useState("todo")

  // 🌱 handle plant data from params
  const plantData = {
    name: params.name || "Chili Padi",
    image: params.image ? { uri: params.image } : require("../assets/images/dummy/chilli_padi.jpg"),
    notes: "Every few days need to harvest and water, then it should be okay.",
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
        return <JournalTab />
      case "analytics":
        return <AnalyticsTab />
      case "gallery":
        return <GalleryTab />
      default:
        return null
    }
  }

  return (
    <Template
      title={String(plantData.name)}
      image={plantData.image}
      imageHeader
      onPressBack={() => router.back()}
      onPressSettings={() => {}}
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

        {/* Tab Underline */}
        <View style={styles.tabUnderline}>
          <View
            style={[
              styles.activeUnderline,
              { left: tabs.findIndex((t) => t.id === activeTab) * (width / 4) },
            ]}
          />
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>{renderTabContent()}</View>
      </View>
    </Template>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 24,
    color: "#1a1a1a",
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsText: {
    fontSize: 20,
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
  tabsContainer: {
    flexDirection: "row",
    marginVertical: 15,
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
  tabUnderline: {
    height: 2,
    backgroundColor: "#f0f0f0",
    position: "relative",
    marginHorizontal: -20,
  },
  activeUnderline: {
    position: "absolute",
    height: 2,
    width: width / 4,
    backgroundColor: "#4CAF50",
  },
  tabContent: {
    marginTop: 20,
  },
})
