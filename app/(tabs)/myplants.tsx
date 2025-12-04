"use client"

import { createUserPlant, deleteUserPlant, getUserPlants, type UserPlant } from "@/services/myPlantService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const FALLBACK_PLANT_IMAGE = require("../../assets/images/dummy/chilli_padi.jpg") as ImageSourcePropType

type PlantListItem = {
  id: string
  name: string
  notes?: string | null
  image: ImageSourcePropType
  imageUrl?: string | null
}

export default function MyPlants() {
  
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [searchText, setSearchText] = useState("")
  const [showActions, setShowActions] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([])
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([])
  const [plants, setPlants] = useState<PlantListItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [newPlantName, setNewPlantName] = useState<string>("")
  const [newPlantNotes, setNewPlantNotes] = useState<string>("")
  const [newPlantImage, setNewPlantImage] = useState<{ uri: string; name: string; type: string } | null>(null)

  const actions = [
    { id: "1", label: "Water", iconName: "water-outline" },
    { id: "2", label: "Fertilise", iconName: "flower-outline" },
    { id: "3", label: "Mist", iconName: "water-outline" },
    { id: "4", label: "Prune", iconName: "content-cut" },
    { id: "5", label: "Repot", iconName: "fence" },
  ]

  const mapUserPlantToItem = useCallback((plant: UserPlant): PlantListItem => {
    return {
      id: plant.id,
      name: plant.plantName ?? "Untitled Plant",
      notes: plant.notes ?? null,
      image: plant.imageUrl ? { uri: plant.imageUrl } : FALLBACK_PLANT_IMAGE,
      imageUrl: plant.imageUrl ?? null,
    }
  }, [])

  const loadPlants = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (options?.refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      try {
        const data = await getUserPlants()
        setPlants(data.map(mapUserPlantToItem))
        setError(null)
      } catch (err: any) {
        console.error("Failed to load plants:", err)
        setError(err?.message ?? "Unable to load plants")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [mapUserPlantToItem]
  )

  useEffect(() => {
    loadPlants()
  }, [loadPlants])

  const filteredPlants = useMemo(() => {
    if (!searchText.trim()) {
      return plants
    }
    const term = searchText.trim().toLowerCase()
    return plants.filter((plant) =>
      plant.name.toLowerCase().includes(term) ||
      (plant.notes ?? "").toLowerCase().includes(term)
    )
  }, [plants, searchText])

  const resetCreateForm = useCallback(() => {
    setNewPlantName("")
    setNewPlantNotes("")
    setNewPlantImage(null)
  }, [])

  const handleCreatePlant = useCallback(async () => {
    if (!newPlantName.trim()) {
      Alert.alert("Plant name required", "Please enter a name for your plant.")
      return
    }

    setIsSubmitting(true)
    try {
      await createUserPlant({
        plantName: newPlantName.trim(),
        notes: newPlantNotes.trim() || undefined,
        imageFile: newPlantImage ?? undefined,
      })
      resetCreateForm()
      setIsCreateModalVisible(false)
      await loadPlants()
    } catch (error: any) {
      console.error("Failed to create plant:", error)
      Alert.alert("Unable to create plant", error?.message ?? "Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }, [newPlantName, newPlantNotes, resetCreateForm, loadPlants])

  const handleDeletePlants = useCallback(() => {
    if (selectedPlantIds.length === 0) {
      return
    }

    Alert.alert(
      "Delete plants",
      `Are you sure you want to delete ${selectedPlantIds.length} plant${selectedPlantIds.length === 1 ? "" : "s"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(selectedPlantIds.map((id) => deleteUserPlant(id)))
              setPlants((prev) => prev.filter((plant) => !selectedPlantIds.includes(plant.id)))
              setSelectedPlantIds([])
              setIsSelectionMode(false)
            } catch (error: any) {
              console.error("Failed to delete plants:", error)
              Alert.alert("Unable to delete", error?.message ?? "Please try again later.")
            }
          },
        },
      ],
      { cancelable: true }
    )
  }, [selectedPlantIds])

  const handlePickImage = useCallback(async () => {
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

    setNewPlantImage({
      uri: asset.uri,
      name: filename,
      type: mimeType,
    })
  }, [])

  const handleRemoveImage = useCallback(() => {
    setNewPlantImage(null)
  }, [])

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
          <TouchableOpacity onPress={() => router.push({ pathname: "/search", params: { source: "myplants" } })}>
            <MaterialCommunityIcons name="magnify" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <Text style={styles.headerError}>{error}</Text>
      ) : null}

      {/* Plant List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isSelectionMode && selectedPlantIds.length > 0 ? 80 : 0 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadPlants({ refresh: true })}
            tintColor="#4CAF50"
          />
        }
      >
        {isLoading && plants.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : null}

        {filteredPlants.length === 0 && !isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyStateText}>No plants found</Text>
          </View>
        ) : null}

        {filteredPlants.map((plant) => {
          const isSelected = selectedPlantIds.includes(plant.id)
          const notesColor = "#4CAF50"
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
                }
              }}
              onLongPress={() => {
                togglePlantSelection(plant.id)
              }}
              activeOpacity={isSelectionMode ? 0.8 : 1}
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
                    <MaterialCommunityIcons name="note-text-outline" size={16} color={notesColor} />
                    <Text style={[styles.nextAction, { color: notesColor }]}
                      numberOfLines={2}
                    >
                      {plant.notes ?? "No notes yet"}
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
            style={styles.bottomDeleteBtn}
            onPress={handleDeletePlants}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomDeleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            resetCreateForm()
            setIsCreateModalVisible(true)
          }}
        >
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

      {/* Create Plant Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={isCreateModalVisible}
        onRequestClose={() => {
          if (!isSubmitting) {
            setIsCreateModalVisible(false)
            resetCreateForm()
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
                resetCreateForm()
              }
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Plant</Text>
              <TouchableOpacity onPress={() => {
                setIsCreateModalVisible(false)
                resetCreateForm()
              }}>
                <MaterialCommunityIcons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Plant name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Monstera"
                  value={newPlantName}
                  onChangeText={setNewPlantName}
                  editable={!isSubmitting}
                />
              </View>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Notes</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalInputMultiline]}
                  placeholder="Care notes, watering schedule, etc."
                  value={newPlantNotes}
                  onChangeText={setNewPlantNotes}
                  editable={!isSubmitting}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    setNewPlantName(newPlantName.trim())
                  }}
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>Photo</Text>
                {newPlantImage ? (
                  <View style={styles.modalImagePreviewWrapper}>
                    <Image source={{ uri: newPlantImage.uri }} style={styles.modalImagePreview} />
                    <TouchableOpacity
                      style={styles.modalRemoveImageButton}
                      onPress={handleRemoveImage}
                      activeOpacity={0.8}
                      disabled={isSubmitting}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E53935" />
                      <Text style={styles.modalRemoveImageText}>Remove photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.modalImagePickerButton}
                    onPress={handlePickImage}
                    activeOpacity={0.85}
                    disabled={isSubmitting}
                  >
                    <MaterialCommunityIcons name="image-plus" size={24} color="#4CAF50" />
                    <Text style={styles.modalImagePickerText}>Attach photo</Text>
                  </TouchableOpacity>
                )}
              </View>

            </ScrollView>

            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleCreatePlant}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalSubmitButtonText}>Add Plant</Text>
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
    marginVertical: vs(2),
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
    height: vs(80),
    backgroundColor:'whitesmoke',
    borderRadius: ms(12),
    marginRight: hs(12),
    resizeMode: "cover",
    alignSelf:'flex-start'
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(10),
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
    fontSize: ms(13),
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
  bottomDeleteBtn: {
    flex: 1,
    paddingVertical: vs(14),
    borderRadius: ms(18),
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomDeleteText: {
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
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
  modalScrollView: {
    paddingHorizontal: hs(20),
  },
  modalScrollContent: {
    paddingBottom: vs(20),
  },
  modalFormGroup: {
    marginBottom: vs(15),
  },
  modalLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(8),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: ms(12),
    paddingHorizontal: hs(12),
    paddingVertical: vs(12),
    fontSize: ms(16),
    color: "#1a1a1a",
    backgroundColor: "#f9f9f9",
  },
  modalInputMultiline: {
    minHeight: vs(80),
    textAlignVertical: "top",
  },
  modalImagePreviewWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: ms(12),
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  modalImagePreview: {
    width: "100%",
    aspectRatio: 1.5,
    resizeMode: "cover",
  },
  modalRemoveImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: hs(6),
    paddingVertical: vs(10),
  },
  modalRemoveImageText: {
    fontSize: ms(13),
    fontWeight: "600",
    color: "#E53935",
  },
  modalImagePickerButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
    borderRadius: ms(12),
    paddingVertical: vs(18),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3fbf6",
    flexDirection: "row",
    gap: hs(8),
  },
  modalImagePickerText: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#2e7d32",
  },
  modalSubmitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: ms(18),
    paddingVertical: vs(16),
    alignItems: "center",
    justifyContent: "center",
    marginTop: vs(20),
  },
  modalSubmitButtonText: {
    color: "#fff",
    fontSize: ms(16),
    fontWeight: "700",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(50),
  },
  emptyStateText: {
    fontSize: ms(16),
    color: "#999",
    textAlign: "center",
  },
  headerError: {
    marginTop: vs(4),
    paddingHorizontal: hs(20),
    fontSize: ms(12),
    color: "#D32F2F",
  },
})
