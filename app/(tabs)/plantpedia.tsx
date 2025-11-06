"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type Plant = {
  id: string
  name: string
  scientificName?: string
  description: string
  image: any
  tags: string[]
  isBookmarked?: boolean
}

export default function PlantPedia() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [bookmarkedPlants, setBookmarkedPlants] = useState<Set<string>>(new Set())

  const placeholderDescription =
    "Papaver somniferum, commonly known as the opium poppy or breadseed poppy, is a species of flowering plant in the family Papaveraceae."

  const plants: Plant[] = [
    {
      id: "1",
      name: "Chili Padi",
      scientificName: "Capsicum frutescens",
      description: placeholderDescription,
      image: require("../../assets/images/dummy/chilli_padi.jpg"),
      tags: ["Indoor", "Pet-friendly"],
    },
    {
      id: "2",
      name: "Mint",
      scientificName: "Mentha",
      description: placeholderDescription,
      image: require("../../assets/images/dummy/chilli_padi.jpg"), // Using placeholder image
      tags: ["Indoor", "Pet-friendly"],
    },
    {
      id: "3",
      name: "Hibiscus",
      scientificName: "Hibiscus rosa-sinensis",
      description: placeholderDescription,
      image: require("../../assets/images/dummy/chilli_padi.jpg"), // Using placeholder image
      tags: ["Indoor", "Pet-friendly"],
    },
  ]

  const categories = ["All Categories", "Indoor", "Outdoor", "Herbs", "Flowers", "Vegetables"]

  const toggleBookmark = (plantId: string) => {
    setBookmarkedPlants((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(plantId)) {
        newSet.delete(plantId)
      } else {
        newSet.add(plantId)
      }
      return newSet
    })
  }

  const filteredPlants =
    selectedCategory === "All Categories"
      ? plants
      : plants.filter((plant) => plant.tags.includes(selectedCategory))

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PlantPedia</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="magnify" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Plant List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.plantList}
      >
        {filteredPlants.map((plant) => (
          <TouchableOpacity
            key={plant.id}
            style={styles.plantCard}
            onPress={() => {
              router.push({
                pathname: "/plantPediaDetails",
                params: {
                  id: plant.id,
                  name: plant.name,
                  scientificName: plant.scientificName || plant.name,
                  description: plant.description,
                  tags: JSON.stringify(plant.tags),
                },
              })
            }}
            activeOpacity={0.8}
          >
            {/* Plant Image */}
            <Image source={plant.image} style={styles.plantImage} />

            {/* Plant Details */}
            <View style={styles.plantDetails}>
              <Text style={styles.plantName}>{plant.name}</Text>
                            {/* Tags */}
                            <View style={styles.tagsContainer}>
                {plant.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.plantDescription} numberOfLines={2}>
                {plant.description}
              </Text>


            </View>

            {/* Action Icons */}
            <View style={styles.actionIcons}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  toggleBookmark(plant.id)
                }}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={bookmarkedPlants.has(plant.id) ? "bookmark" : "bookmark-outline"}
                  size={ms(20)}
                  color={bookmarkedPlants.has(plant.id) ? "#4CAF50" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.modalItem,
                    selectedCategory === category && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category)
                    setShowCategoryModal(false)
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedCategory === category && styles.modalItemTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategory === category && (
                    <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  filterContainer: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    backgroundColor: "#F5F5F5",
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryButtonText: {
    fontSize: ms(15),
    fontWeight: "500",
    color: "#1a1a1a",
  },
  plantList: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
    paddingBottom: vs(100),
  },
  plantCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginVertical: vs(5)
  },
  plantImage: {
    width: hs(100),
    height: vs(100),
    borderRadius: ms(12),
    marginRight: hs(12),
    resizeMode: "cover",
  },
  plantDetails: {
    flex: 1,
    marginRight: hs(8),
  },
  plantName: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(6),
  },
  plantDescription: {
    fontSize: ms(13),
    color: "#666",
    lineHeight: ms(18),
    marginBottom: vs(10),
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(6),
  },
  tag: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    backgroundColor: "#F5F5F5",
    borderRadius: ms(5),
  },
  tagText: {
    fontSize: ms(11),
    fontWeight: "500",
    color: "#666",
  },
  actionIcons: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: vs(4),
    width: hs(30),
  },
  iconButton: {
    padding: ms(4),
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
    maxHeight: "70%",
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
    flexGrow: 0,
    flexShrink: 1,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalItemSelected: {
    backgroundColor: "#F8F8F8",
  },
  modalItemText: {
    fontSize: ms(16),
    color: "#1a1a1a",
  },
  modalItemTextSelected: {
    color: "#4CAF50",
    fontWeight: "600",
  },
})
