"use client"

import Template from "@/components/Template"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type PlantDetail = {
  label: string
  value: string
  icon: string
  color: string
  bgColor: string
}

export default function PlantPediaDetails() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Get plant data from params or use default
  const plantData = {
    id: params.id || "1",
    name: params.name || "Papaver Somniferum",
    scientificName: params.scientificName || "Papaver Somniferum",
    description:
      params.description ||
      "Papaver somniferum, commonly known as the opium poppy or breadseed poppy, is a species of flowering plant in the family Papaveraceae. It is the species of plant from which opium and poppy seeds are derived and is a valuable ornamental plant, grown in gardens. Its native range is probably the eastern Mediterranean, but is now obscured by ancient introductions and cultivation.",
    tags: params.tags ? JSON.parse(params.tags as string) : ["Indoor", "Pet friendly", "Papaveraceae"],
    image: params.image
      ? { uri: params.image }
      : require("../assets/images/dummy/chilli_padi.jpg"),
    images: [
      require("../assets/images/dummy/chilli_padi.jpg"),
      require("../assets/images/dummy/chilli_padi.jpg"),
      require("../assets/images/dummy/chilli_padi.jpg"),
    ],
  }

  const plantDetails: PlantDetail[] = [
    {
      label: "Height",
      value: "Small",
      icon: "arrow-expand",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    },
    {
      label: "Water",
      value: "333ml",
      icon: "water",
      color: "#2196F3",
      bgColor: "#E3F2FD",
    },
    {
      label: "Light",
      value: "Normal",
      icon: "weather-sunny",
      color: "#FF9800",
      bgColor: "#FFF3E0",
    },
    {
      label: "Humidity",
      value: "56%",
      icon: "thermometer",
      color: "#9C27B0",
      bgColor: "#F3E5F5",
    },
  ]

  const description = typeof plantData.description === 'string' 
    ? plantData.description 
    : Array.isArray(plantData.description) 
      ? plantData.description.join(' ') 
      : ''
  const descriptionText = isDescriptionExpanded
    ? description
    : description.substring(0, 150) + "..."

  return (
    <Template
      title={String(plantData.scientificName)}
      images={plantData.images}
      imageHeader
      onPressBack={() => router.back()}
    >


      {/* Content Card */}
      <ScrollView
        style={styles.contentCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentCardContent}
      >
        {/* Plant Name */}
        <Text style={styles.plantName}>{plantData.scientificName}</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {plantData.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sourceText}>From Wikipedia, the free encyclopedia</Text>
          <Text style={styles.descriptionText}>{descriptionText}</Text>
          {plantData.description.length > 150 && (
            <TouchableOpacity
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.readMoreText}>
                {isDescriptionExpanded ? "Read less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Plant Details Grid */}
        <View style={styles.detailsGrid}>
          {plantDetails.map((detail, index) => (
            <View key={index} style={styles.detailCard}>
              <View style={[styles.detailIconContainer, { backgroundColor: detail.bgColor }]}>
                <MaterialCommunityIcons name={detail.icon as any} size={24} color={detail.color} />
              </View>
              <View style={{flexDirection:'column', paddingLeft:hs(10), alignContent:'center', justifyContent:'center'}}>

                <Text style={[styles.detailLabel, { color: detail.color }]}>
                  {detail.label}
                </Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setIsSaved(!isSaved)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={20}
            color="#fff"
          />
          <Text style={styles.saveButtonText}>
            {isSaved ? "Saved" : "Save this plant"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </Template>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: vs(300),
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    paddingTop: vs(10),
    paddingBottom: vs(20),
    paddingHorizontal: hs(20),
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  closeButtonBackground: {
    width: hs(36),
    height: vs(36),
    borderRadius: ms(18),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: hs(6),
  },
  indicator: {
    width: hs(6),
    height: vs(6),
    borderRadius: ms(3),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  indicatorActive: {
    backgroundColor: "#fff",
    width: hs(8),
    height: vs(8),
    borderRadius: ms(4),
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentCardContent: {
    paddingHorizontal: hs(20),
    paddingTop: vs(20),
    paddingBottom: vs(40),
  },
  plantName: {
    fontSize: ms(28),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(12),
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(8),
    marginBottom: vs(24),
  },
  tag: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    backgroundColor: "#F5F5F5",
    borderRadius: ms(2),
  },
  tagText: {
    fontSize: ms(12),
    fontWeight: "500",
    color: "#666",
  },
  descriptionSection: {
    marginBottom: vs(24),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  sourceText: {
    fontSize: ms(12),
    color: "#999",
    marginBottom: vs(12),
  },
  descriptionText: {
    fontSize: ms(14),
    color: "#666",
    lineHeight: ms(20),
    marginBottom: vs(8),
  },
  readMoreText: {
    fontSize: ms(14),
    color: "#4CAF50",
    fontWeight: "600",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(12),
    marginBottom: vs(32),
  },
  detailCard: {
    width: "47%",
    padding: ms(16),
    alignItems: "center",
    flexDirection:'row'
  },
  detailIconContainer: {
    width: hs(48),
    height: vs(48),
    borderRadius: ms(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(8),
  },
  detailLabel: {
    fontSize: ms(12),
    fontWeight: "600",
    marginBottom: vs(4),
  },
  detailValue: {
    fontSize: ms(14),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: vs(16),
    borderRadius: ms(12),
    gap: hs(8),
  },
  saveButtonText: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#fff",
  },
})

