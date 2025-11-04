"use client"

import { useRouter } from "expo-router"
import { useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function MyPlants() {
  
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [searchText, setSearchText] = useState("")
  const [showActions, setShowActions] = useState(false)

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
    { id: "1", label: "Water", icon: "💧" },
    { id: "2", label: "Fertilise", icon: "🌱" },
    { id: "3", label: "Mist", icon: "💦" },
    { id: "4", label: "Pruned", icon: "✂️" },
    { id: "5", label: "Repot", icon: "🪴" },
    { id: "6", label: "Picture", icon: "📷" },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Plants</Text>
        <TouchableOpacity>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Plant List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {plants.map((plant) => (
          <TouchableOpacity
            key={plant.id}
            style={styles.plantCard}
            
    onPress={() => router.push({
      pathname: "/plantDetails",
      params: { id: plant.id }
    })}
          >
            <Image source={plant.image} style={styles.plantImage} />
            <View style={styles.plantInfo}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantMeta}>
                {plant.lastWatered} | {plant.status}
              </Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { borderColor: plant.statusColor }]}>
                  <Text style={{ color: plant.statusColor, fontSize: 12 }}>{plant.nextAction}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowActions(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* More Actions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showActions}
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Actions</Text>
              <TouchableOpacity onPress={() => setShowActions(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsGrid}>
              {actions.map((action) => (
                <TouchableOpacity key={action.id} style={styles.actionButton} onPress={() => setShowActions(false)}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
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
  searchIcon: {
    fontSize: 20,
  },
  plantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  plantMeta: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
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
  closeBtn: {
    fontSize: 24,
    color: "#999",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
  },
  actionButton: {
    width: "48%",
    aspectRatio: 1,
    margin: "1%",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
})
