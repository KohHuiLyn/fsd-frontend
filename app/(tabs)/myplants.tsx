"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function MyPlants() {
  
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [searchText, setSearchText] = useState("")
  const [showActions, setShowActions] = useState(false)
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null)
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)

  const plants = [
    {
      id: "1",
      name: "Chili Padi",
      lastWatered: "Yesterday",
      status: "Watered, Fertilised",
      nextAction: "In 1 day | Needs Water",
      image: require("../../assets/images/dummy/chilli_padi.jpg"),
      statusColor: "#4CAF50",
    },
    {
      id: "2",
      name: "Lime",
      lastWatered: "Yesterday",
      status: "Watered, Fertilised",
      nextAction: "Today | Water",
      image: require("../../assets/images/dummy/lime.jpeg"),
      statusColor: "#FFA500",
    },
    {
      id: "3",
      name: "Pandan",
      lastWatered: "Yesterday",
      status: "Watered, Fertilised",
      nextAction: "Overdue by 2 days | Needs Water",
      image: require("../../assets/images/dummy/pandan.jpg"),
      statusColor: "#d32f2f",
    },
  ]

  const actions = [
    { id: "1", label: "Water", iconName: "water-outline" },
    { id: "2", label: "Fertilise", iconName: "flower-outline" },
    { id: "3", label: "Mist", iconName: "water-outline" },
    { id: "4", label: "Pruned", iconName: "cut-outline" },
    { id: "5", label: "Repot", iconName: "leaf-outline" },
    { id: "6", label: "Picture", iconName: "image-outline" },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Plants</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Plant List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {plants.map((plant) => (
          <View key={plant.id} style={styles.plantCard}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              onPress={() => router.push({ pathname: "/plantDetails", params: { id: plant.id } })}
              activeOpacity={0.8}
            >
              <Image source={plant.image} style={styles.plantImage} />
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>{plant.name}</Text>
                <View style={styles.statusRow}>
                  <Ionicons name="checkbox-outline" size={16} color="#4CAF50" />
                  <Text style={styles.plantMeta}>
                    {plant.lastWatered} | {plant.status}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Ionicons name="notifications-outline" size={16} color={plant.statusColor} />
                  <Text style={[styles.nextAction, { color: plant.statusColor }]}>
                    {plant.nextAction}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.actionsRight}>
              <TouchableOpacity
                style={styles.moreBtn}
                onPress={() => {
                  setSelectedPlantId(plant.id)
                  setShowActions(true)
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.moreText}>More</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.9}>
                <Text style={styles.primaryText}>Water</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/addPlant")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* More Actions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showActions}
        onRequestClose={() => {
          setShowActions(false)
          setSelectedActionId(null)
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowActions(false)
            setSelectedActionId(null)
          }}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>More Actions</Text>
                <TouchableOpacity onPress={() => {
                  setShowActions(false)
                  setSelectedActionId(null)
                }}>
                  <Ionicons name="close-outline" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.actionsGrid}>
                {actions.map((action) => {
                  const isSelected = selectedActionId === action.id
                  return (
                    <TouchableOpacity 
                      key={action.id} 
                      style={[
                        styles.actionButton,
                        isSelected && styles.actionButtonSelected
                      ]} 
                      onPress={() => {
                        setSelectedActionId(action.id)
                        // Close modal after a brief delay to show selection
                        setTimeout(() => {
                          setShowActions(false)
                          setSelectedActionId(null)
                        }, 300)
                      }}
                    >
                      <Ionicons 
                        name={action.iconName as any} 
                        size={32} 
                        color="#4CAF50" 
                        style={styles.actionIcon}
                      />
                      <Text style={[
                        styles.actionLabel,
                        isSelected && styles.actionLabelSelected
                      ]}>
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  plantCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  plantImage: {
    width: 80,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: "cover",
  },
  plantInfo: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 120,
  },
  plantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  plantMeta: {
    fontSize: 12,
    color: "#999",
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  nextAction: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  actionsRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginLeft: 8,
    minHeight: 120,
    paddingBottom: 4,
  },
  moreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 18,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  moreText: {
    fontSize: 13,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fabText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  actionLabelSelected: {
    color: "#fff",
  },
})
