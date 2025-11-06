"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function MyPlants() {
  
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [searchText, setSearchText] = useState("")
  const [showActions, setShowActions] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([])
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([])

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
    { id: "4", label: "Prune", iconName: "cut-outline" },
    { id: "5", label: "Repot", iconName: "leaf-outline" },
    { id: "6", label: "Picture", iconName: "image-outline" },
  ]

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    if (isSelectionMode) {
      setSelectedPlantIds([])
    }
  }

  const togglePlantSelection = (plantId: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true)
    }
    setSelectedPlantIds((prev) => {
      if (prev.includes(plantId)) {
        const newSelection = prev.filter((id) => id !== plantId)
        if (newSelection.length === 0) {
          setIsSelectionMode(false)
        }
        return newSelection
      } else {
        return [...prev, plantId]
      }
    })
  }

  const handleWaterPlants = () => {
    // Water all selected plants
    console.log("Watering plants:", selectedPlantIds)
    // Add your watering logic here
    setSelectedPlantIds([])
    setIsSelectionMode(false)
  }

  const toggleActionSelection = (actionId: string) => {
    setSelectedActionIds((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((id) => id !== actionId)
      } else {
        return [...prev, actionId]
      }
    })
  }

  const handleCompleteTasks = () => {
    console.log(`Applying actions ${selectedActionIds.join(", ")} to plants:`, selectedPlantIds)
    // Add your action logic here - apply all selected actions to all selected plants
    setShowActions(false)
    setSelectedActionIds([])
    setSelectedPlantIds([])
    setIsSelectionMode(false)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isSelectionMode && selectedPlantIds.length > 0 ? `${selectedPlantIds.length} Selected` : "My Plants"}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleSelectionMode}
            style={styles.checkboxIconButton}
          >
            <MaterialCommunityIcons 
              name={isSelectionMode ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={isSelectionMode ? "#4CAF50" : "#1a1a1a"} 
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons name="magnify" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Plant List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isSelectionMode && selectedPlantIds.length > 0 ? 80 : 0 }}
      >
        {plants.map((plant) => {
          const isSelected = selectedPlantIds.includes(plant.id)
          return (
            <TouchableOpacity
              key={plant.id}
              style={[
                styles.plantCard,
                isSelected && styles.plantCardSelected
              ]}
              onPress={() => {
                if (isSelectionMode) {
                  togglePlantSelection(plant.id)
                } else {
                  router.push({ pathname: "/plantDetails", params: { id: plant.id } })
                }
              }}
              onLongPress={() => {
                togglePlantSelection(plant.id)
              }}
              activeOpacity={0.8}
            >
              {isSelectionMode && (
                <View style={styles.checkboxContainer}>
                  <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color={isSelected ? "#4CAF50" : "#ccc"}
                  />
                </View>
              )}
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Image source={plant.image} style={styles.plantImage} />
                <View style={styles.plantInfo}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  <View style={styles.statusRow}>
                    <MaterialCommunityIcons name="checkbox-blank-outline" size={16} color="#4CAF50" />
                    <Text style={styles.plantMeta}>
                      {plant.lastWatered} | {plant.status}
                    </Text>
                  </View>
                  <View style={styles.statusRow}>
                    <MaterialCommunityIcons name="bell-outline" size={16} color={plant.statusColor} />
                    <Text style={[styles.nextAction, { color: plant.statusColor }]}>
                      {plant.nextAction}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Bottom Action Bar - Shows when plants are selected in selection mode */}
      {isSelectionMode && selectedPlantIds.length > 0 && (
        <View style={[styles.bottomActionBar, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={styles.bottomMoreBtn}
            onPress={() => setShowActions(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomMoreText}>More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomWaterBtn}
            onPress={handleWaterPlants}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomWaterText}>Water</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      {!isSelectionMode && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push("/addPlant")}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* More Actions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showActions}
        onRequestClose={() => {
          setShowActions(false)
          setSelectedActionIds([])
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              setShowActions(false)
              setSelectedActionIds([])
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                More Actions {selectedPlantIds.length > 0 && `(${selectedPlantIds.length} plants)`}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowActions(false)
                setSelectedActionIds([])
              }}>
                <MaterialCommunityIcons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.actionsScrollView}
              contentContainerStyle={styles.actionsScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.actionsGrid}>
                {actions.map((action) => {
                  const isSelected = selectedActionIds.includes(action.id)
                  return (
                    <TouchableOpacity 
                      key={action.id} 
                      style={[
                        styles.actionButton,
                        isSelected && styles.actionButtonSelected
                      ]} 
                      onPress={() => toggleActionSelection(action.id)}
                    >
                      <MaterialCommunityIcons 
                        name={action.iconName as any} 
                        size={32} 
                        color={isSelected ? "#fff" : "#4CAF50"} 
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
            </ScrollView>

            {selectedActionIds.length > 0 && (
              <View style={[styles.completeTasksContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <TouchableOpacity
                  style={styles.completeTasksButton}
                  onPress={handleCompleteTasks}
                  activeOpacity={0.9}
                >
                  <Text style={styles.completeTasksText}>
                    Complete Tasks ({selectedActionIds.length})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingHorizontal: hs(20),
    paddingVertical: vs(15),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(12),
  },
  checkboxIconButton: {
    padding: ms(4),
  },
  clearButton: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
  },
  clearButtonText: {
    fontSize: ms(14),
    color: "#4CAF50",
    fontWeight: "600",
  },
  plantCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: hs(15),
    marginVertical: vs(10),
    padding: ms(12),
    borderBottomColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderRadius: ms(12),
  },
  plantCardSelected: {
    backgroundColor: "#F0F8F0",
  },
  checkboxContainer: {
    marginRight: hs(12),
    marginTop: vs(4),
  },
  plantImage: {
    width: hs(80),
    height: vs(120),
    borderRadius: ms(12),
    marginRight: hs(12),
    resizeMode: "cover",
  },
  plantInfo: {
    flex: 1,
    minHeight: vs(120),
  },
  plantName: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(10)
  },
  plantMeta: {
    fontSize: ms(12),
    color: "#999",
    marginLeft: hs(6),

  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vs(10),
  },
  nextAction: {
    fontSize: ms(12),
    fontWeight: "500",
    marginLeft: hs(6),
  },
  actionsRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginLeft: hs(8),
    minHeight: vs(120),
    paddingBottom: vs(4),
  },
  moreBtn: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(6),
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: ms(18),
    backgroundColor: "#fff",
    marginRight: hs(8),
  },
  moreText: {
    fontSize: ms(13),
    color: "#1a1a1a",
    fontWeight: "600",
  },
  primaryBtn: {
    paddingHorizontal: hs(16),
    paddingVertical: vs(8),
    borderRadius: ms(18),
    backgroundColor: "#4CAF50",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: hs(20),
    paddingTop: vs(15),
    paddingBottom: vs(15),
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(-2) },
    shadowOpacity: 0.1,
    shadowRadius: ms(8),
    gap: hs(12),
  },
  bottomMoreBtn: {
    flex: 1,
    paddingVertical: vs(14),
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: ms(18),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomMoreText: {
    fontSize: ms(15),
    color: "#1a1a1a",
    fontWeight: "600",
  },
  bottomWaterBtn: {
    flex: 1,
    paddingVertical: vs(14),
    borderRadius: ms(18),
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomWaterText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: ms(15),
  },
  fab: {
    position: "absolute",
    bottom: vs(30),
    right: hs(20),
    width: hs(56),
    height: hs(56),
    borderRadius: ms(28),
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.2,
    shadowRadius: ms(5),
  },
  fabText: {
    fontSize: ms(28),
    color: "#fff",
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingTop: vs(20),
    paddingBottom: vs(20),
    maxHeight: "85%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(-2) },
    shadowOpacity: 0.1,
    shadowRadius: ms(8),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(20),
    marginBottom: vs(20),
  },
  modalTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  actionsScrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  actionsScrollContent: {
    paddingBottom: vs(10),
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: hs(15),
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: ms(12),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  actionIcon: {
    marginBottom: vs(8),
  },
  actionLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  actionLabelSelected: {
    color: "#fff",
  },
  completeTasksContainer: {
    paddingHorizontal: hs(20),
    paddingTop: vs(15),
    paddingBottom: vs(10),
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  completeTasksButton: {
    backgroundColor: "#4CAF50",
    borderRadius: ms(18),
    paddingVertical: vs(16),
    alignItems: "center",
    justifyContent: "center",
  },
  completeTasksText: {
    color: "#fff",
    fontSize: ms(16),
    fontWeight: "700",
  },
})
