"use client"

import Template from "@/components/Template"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function DiagnosisResult() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const imageUri = params.imageUri as string

  const [isLoading, setIsLoading] = useState(true)
  const [diagnosis, setDiagnosis] = useState<{
    isHealthy: boolean
    plantName: string
    diseaseName?: string
    confidence: number
    description: string
    metrics?: { height: string; water: string; light: string; humidity: string }
    diseaseImages?: string[]
    symptoms?: string
  } | null>(null)

  useEffect(() => {
    // Simulate diagnosis API call
    const diagnosePlant = async () => {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Randomly determine if plant is healthy or sick (for demo)
      const isHealthy = Math.random() > 0.5
      
      if (isHealthy) {
        setDiagnosis({
          isHealthy: true,
          plantName: "Mint",
          confidence: 92,
          description: "Papaver somniferum, commonly known as the opium poppy or breadseed poppy, is a species of flowering plant in the family Papaveraceae. It is the species of plant from which both opium and poppy seeds are derived and is a valuable ornamental plant, grown in gardens...",
          metrics: {
            height: "Small",
            water: "333ml",
            light: "Normal",
            humidity: "56%",
          },
        })
      } else {
        setDiagnosis({
          isHealthy: false,
          plantName: "Mint Rust",
          diseaseName: "Disease of Mint",
          confidence: 81,
          description: "Papaver somniferum, commonly known as the opium poppy or breadseed poppy, is a species of flowering plant in the family Papaveraceae. It is the species of plant from which both opium and poppy seeds are derived and is a valuable ornamental plant, grown in gardens...",
          diseaseImages: [
            require("../assets/images/dummy/chilli_padi.jpg"),
            require("../assets/images/dummy/chilli_padi.jpg"),
            require("../assets/images/dummy/chilli_padi.jpg"),
          ],
          symptoms: "Rust spots appear on leaves, starting as small orange or brown spots that gradually spread. The leaves may turn yellow and fall off prematurely. The disease is caused by a fungal infection and can spread quickly in humid conditions.",
        })
      }

      setIsLoading(false)
    }

    if (imageUri) {
      diagnosePlant()
    }
  }, [imageUri])

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Diagnosing your plant...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      </View>
    )
  }

  if (!diagnosis) {
    return null
  }

  return (
    <Template
      title={diagnosis.plantName}
      image={{ uri: imageUri }}
      imageHeader
      onPressBack={() => router.back()}
      onPressSettings={() => {}}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {/* Plant Health Section */}
          <View
            style={[
              styles.healthCard,
              diagnosis.isHealthy ? styles.healthCardHealthy : styles.healthCardSick,
            ]}
          >
            <View style={styles.healthHeader}>
              <MaterialCommunityIcons
                name={diagnosis.isHealthy ? "leaf" : "leaf-off"}
                size={24}
                color={diagnosis.isHealthy ? "#4CAF50" : "#ff6b35"}
              />
              <Text style={styles.healthLabel}>Plant Health</Text>
            </View>
            <View
              style={[
                styles.confidenceBadge,
                diagnosis.isHealthy ? styles.confidenceBadgeHealthy : styles.confidenceBadgeSick,
              ]}
            >
              <Text style={styles.confidenceText}>{diagnosis.confidence}% Confidence</Text>
            </View>
            <Text style={styles.healthMessage}>
              {diagnosis.isHealthy
                ? "HORRAY! YOUR PLANT LOOKS HEALTHY!"
                : "YOUR PLANT IS DYING LMAOOOOOOOO"}
            </Text>
            <Text style={styles.disclaimer}>
              The plant was diagnosed automatically. Contact our botany experts to be sure about results.
            </Text>
          </View>

          {/* Disease Name (if sick) */}
          {!diagnosis.isHealthy && diagnosis.diseaseName && (
            <Text style={styles.diseaseName}>{diagnosis.diseaseName}</Text>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sourceText}>From Wikipedia, the free encyclopedia</Text>
            <Text style={styles.descriptionText}>{diagnosis.description}</Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Read more</Text>
            </TouchableOpacity>
          </View>

          {/* Plant Metrics (if healthy) */}
          {diagnosis.isHealthy && diagnosis.metrics && (
            <View style={styles.section}>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="arrow-expand" size={20} color="#4CAF50" />
                  <Text style={styles.metricLabel}>Height</Text>
                  <Text style={styles.metricValue}>{diagnosis.metrics.height}</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="water" size={20} color="#4CAF50" />
                  <Text style={styles.metricLabel}>Water</Text>
                  <Text style={styles.metricValue}>{diagnosis.metrics.water}</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="weather-sunny" size={20} color="#4CAF50" />
                  <Text style={styles.metricLabel}>Light</Text>
                  <Text style={styles.metricValue}>{diagnosis.metrics.light}</Text>
                </View>
                <View style={styles.metricCard}>
                  <MaterialCommunityIcons name="thermometer" size={20} color="#4CAF50" />
                  <Text style={styles.metricLabel}>Humidity</Text>
                  <Text style={styles.metricValue}>{diagnosis.metrics.humidity}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Disease Images (if sick) */}
          {!diagnosis.isHealthy && diagnosis.diseaseImages && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Disease Images</Text>
              <View style={styles.diseaseImagesContainer}>
                {diagnosis.diseaseImages.map((img, index) => (
                  <View key={index} style={styles.diseaseImageWrapper}>
                    <Image source={img} style={styles.diseaseImage} resizeMode="cover" />
                    <Text style={styles.diseaseImageLabel}>{diagnosis.plantName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Symptoms (if sick) */}
          {!diagnosis.isHealthy && diagnosis.symptoms && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              <Text style={styles.symptomsText}>{diagnosis.symptoms}</Text>
            </View>
          )}

          {/* Save Button (if healthy) */}
          {diagnosis.isHealthy && (
            <TouchableOpacity style={styles.saveButton}>
              <MaterialCommunityIcons name="leaf" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save this plant</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Template>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: ms(18),
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: vs(20),
  },
  loadingSubtext: {
    fontSize: ms(14),
    color: "#999",
    marginTop: vs(8),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: hs(20),
    paddingBottom: vs(40),
  },
  healthCard: {
    padding: ms(16),
    borderRadius: ms(12),
    marginTop: vs(20),
    marginBottom: vs(20),
  },
  healthCardHealthy: {
    backgroundColor: "#e8f5e9",
  },
  healthCardSick: {
    backgroundColor: "#fff3e0",
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vs(12),
  },
  healthLabel: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: hs(8),
  },
  confidenceBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(20),
    marginBottom: vs(12),
  },
  confidenceBadgeHealthy: {
    backgroundColor: "#4CAF50",
  },
  confidenceBadgeSick: {
    backgroundColor: "#ff6b35",
  },
  confidenceText: {
    fontSize: ms(12),
    fontWeight: "700",
    color: "#fff",
  },
  healthMessage: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(8),
  },
  disclaimer: {
    fontSize: ms(12),
    color: "#666",
    lineHeight: ms(16),
  },
  diseaseName: {
    fontSize: ms(16),
    color: "#666",
    marginBottom: vs(20),
  },
  section: {
    marginBottom: vs(24),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(8),
  },
  sourceText: {
    fontSize: ms(12),
    color: "#999",
    marginBottom: vs(8),
  },
  descriptionText: {
    fontSize: ms(14),
    color: "#333",
    lineHeight: ms(20),
    marginBottom: vs(8),
  },
  readMore: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#4CAF50",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(12),
  },
  metricCard: {
    width: (hs(320) - hs(12)) / 2,
    backgroundColor: "#f5f5f5",
    padding: ms(16),
    borderRadius: ms(12),
    alignItems: "center",
  },
  metricLabel: {
    fontSize: ms(12),
    color: "#666",
    marginTop: vs(8),
    marginBottom: vs(4),
  },
  metricValue: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  diseaseImagesContainer: {
    flexDirection: "row",
    gap: hs(12),
  },
  diseaseImageWrapper: {
    flex: 1,
  },
  diseaseImage: {
    width: "100%",
    height: vs(100),
    borderRadius: ms(8),
    marginBottom: vs(8),
  },
  diseaseImageLabel: {
    fontSize: ms(12),
    color: "#666",
    textAlign: "center",
  },
  symptomsText: {
    fontSize: ms(14),
    color: "#333",
    lineHeight: ms(20),
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: vs(16),
    paddingHorizontal: hs(24),
    borderRadius: ms(12),
    justifyContent: "center",
    alignItems: "center",
    marginTop: vs(20),
    gap: hs(8),
  },
  saveButtonText: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#fff",
  },
})

