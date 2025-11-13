"use client"

import Template from "@/components/Template"
import {
  fetchPlantSpeciesDetails,
  type PlantHardinessRange,
  type PlantImage,
  type PlantSpecies,
  type PlantSpeciesDetails,
} from "@/services/plantService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

type PlantDetail = {
  label: string
  value: string
  icon: string
  color: string
  bgColor: string
}

const FALLBACK_IMAGE = require("../assets/images/dummy/chilli_padi.jpg")

export default function PlantPediaDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [detailedPlant, setDetailedPlant] = useState<PlantSpeciesDetails | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)


  const plant: PlantSpecies | null = useMemo(() => {
    if (typeof params.plant === "string") {
      try {
        return JSON.parse(params.plant) as PlantSpecies
      } catch (error) {
        console.warn("Unable to parse plant payload:", error)
      }
    }
    return null
  }, [params.plant])

  const displayName = useMemo(() => {
    if (typeof params.name === "string" && params.name.trim().length > 0) {
      return params.name.trim()
    }
    return plant?.common_name || plant?.scientific_name?.[0] || "Plant details"
  }, [params.name, plant])

  const scientificName = useMemo(() => {
    if (typeof params.scientificName === "string" && params.scientificName.trim().length > 0) {
      return params.scientificName.trim()
    }
    return plant?.scientific_name?.join(", ") || displayName
  }, [params.scientificName, plant, displayName])

  const speciesId = useMemo(() => {
    if (typeof params.id === "string") {
      const parsed = Number.parseInt(params.id, 10)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
    return typeof plant?.id === "number" ? plant.id : null
  }, [params.id, plant])

  useEffect(() => {
    if (!speciesId) {

      return
    }

    let isMounted = true
    setIsFetchingDetails(true)

    fetchPlantSpeciesDetails(speciesId)
      .then((response) => {
        if (!isMounted) {
          return
        }
        setDetailedPlant(response)
        setDetailsError(null)
      })
      .catch((error: any) => {
        if (!isMounted) {
          return
        }
        console.error("Failed to fetch plant details:", error)
        setDetailsError(error?.message ?? "Unable to load plant details.")
      })
      .finally(() => {
        if (isMounted) {
          setIsFetchingDetails(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [speciesId])

  const resolvedPlant: (PlantSpecies | PlantSpeciesDetails) | null = detailedPlant ?? plant

  const tags: string[] = useMemo(() => {
    if (typeof params.tags === "string") {
      try {
        const parsed = JSON.parse(params.tags)
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
          if (cleaned.length > 0) {
            return cleaned
          }
        }
      } catch (error) {
        console.warn("Unable to parse tags payload:", error)
      }
    }

    const fallbackSource = resolvedPlant ?? undefined
    const detailCandidate = detailedPlant ?? undefined

    const fallbackTags = [
      ...(fallbackSource?.other_name?.slice(0, 3) ?? []),
      fallbackSource?.family ? `Family: ${fallbackSource.family}` : null,
      fallbackSource?.genus ? `Genus: ${fallbackSource.genus}` : null,
      detailCandidate?.type ? `Type: ${formatLabel(detailCandidate.type)}` : null,
      detailCandidate?.care_level ? `Care: ${formatLabel(detailCandidate.care_level)}` : null,
    ].filter(Boolean) as string[]

    return fallbackTags.length > 0 ? fallbackTags : ["Plant overview"]
  }, [params.tags, resolvedPlant])

  const primaryImageUrl = useMemo(() => {
    if (typeof params.imageUrl === "string" && params.imageUrl.trim().length > 0) {
      return params.imageUrl.trim()
    }

    const source = resolvedPlant ?? undefined
    const detailDefault = (detailedPlant?.default_image as PlantImage | undefined) ?? undefined

    return (
      detailDefault?.original_url ||
      detailDefault?.regular_url ||
      source?.default_image?.original_url ||
      source?.default_image?.regular_url ||
      source?.default_image?.medium_url ||
      source?.default_image?.small_url ||
      ""
    )
  }, [params.imageUrl, resolvedPlant, detailedPlant])

  const images: ImageSourcePropType[] = useMemo(() => {
    const sources: ImageSourcePropType[] = []

    if (primaryImageUrl) {
      sources.push({ uri: primaryImageUrl })
    }

    const detailImages = Array.isArray(detailedPlant?.other_images) ? detailedPlant.other_images : []
    if (detailImages.length) {
      detailImages.forEach((img) => {
        const uri =
          img.original_url ||
          img.regular_url ||
          img.medium_url ||
          img.small_url ||
          img.thumbnail ||
          null
        if (uri) {
          sources.push({ uri })
        }
      })
    }

    if (sources.length === 0) {
      sources.push(FALLBACK_IMAGE)
    }

    return sources
  }, [primaryImageUrl, detailedPlant])

  const description = useMemo(() => {
    if (typeof params.description === "string" && params.description.trim().length > 0) {
      return params.description.trim()
    }

    if (typeof detailedPlant?.description === "string" && detailedPlant.description.trim().length > 0) {
      return detailedPlant.description.trim()
    }

    if (!resolvedPlant) {
      return `Explore ${displayName} and learn how to care for this plant species.`
    }

    const sentences: string[] = []

    if (resolvedPlant.common_name) {
      sentences.push(`${resolvedPlant.common_name} is commonly recognised in the PlantPedia collection.`)
    }

    if (resolvedPlant.family) {
      sentences.push(
        `It belongs to the ${resolvedPlant.family} family${
          resolvedPlant.genus ? ` and the ${resolvedPlant.genus} genus` : ""
        }.`
      )
    } else if (resolvedPlant.genus) {
      sentences.push(`It is part of the ${resolvedPlant.genus} genus.`)
    }

    if (resolvedPlant.cycle) {
      sentences.push(`This species typically has a ${formatLabel(resolvedPlant.cycle)} growth cycle.`)
    }

    if (resolvedPlant.sunlight && resolvedPlant.sunlight.length) {
      sentences.push(`Preferred sunlight: ${resolvedPlant.sunlight.map((item) => formatLabel(item)).join(", ")}.`)
    }

    if (resolvedPlant.watering) {
      sentences.push(`Watering requirements are ${formatLabel(resolvedPlant.watering)}.`)
    }

    if ("care_level" in (resolvedPlant || {}) && (resolvedPlant as PlantSpeciesDetails)?.care_level) {
      sentences.push(`Care level is ${formatLabel((resolvedPlant as PlantSpeciesDetails).care_level || "")}.`)
    }

    if (typeof resolvedPlant.edible === "boolean") {
      sentences.push(`Edible: ${resolvedPlant.edible ? "Yes" : "No"}.`)
    } else if (typeof (resolvedPlant as PlantSpeciesDetails)?.edible_fruit === "boolean") {
      sentences.push(`Edible fruit: ${(resolvedPlant as PlantSpeciesDetails).edible_fruit ? "Yes" : "No"}.`)
    }

    if (typeof (resolvedPlant as PlantSpeciesDetails)?.poisonous_to_humans === "boolean") {
      sentences.push(
        `Poisonous to humans: ${(resolvedPlant as PlantSpeciesDetails).poisonous_to_humans ? "Yes" : "No"}.`
      )
    } else if (typeof resolvedPlant.poisonous === "boolean") {
      sentences.push(`Poisonous: ${resolvedPlant.poisonous ? "Yes" : "No"}.`)
    }

    if (sentences.length === 0) {
      sentences.push(`Explore ${displayName} and learn how to care for this plant species.`)
    }

    return sentences.join(" ")
  }, [params.description, detailedPlant, resolvedPlant, displayName])

  const plantDetails: PlantDetail[] = useMemo(() => {
    const details: PlantDetail[] = []
    const addDetail = (detail: Omit<PlantDetail, "value"> & { value?: string | null }) => {
      const value = detail.value?.toString().trim()
      if (value) {
        details.push({ ...detail, value })
      }
    }

    const source = resolvedPlant
    const detailSource = detailedPlant ?? undefined

    addDetail({
      label: "Cycle",
      value: source?.cycle ? formatLabel(source.cycle) : null,
      icon: "leaf",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    })

    addDetail({
      label: "Watering",
      value: source?.watering ? formatLabel(source.watering) : null,
      icon: "watering-can",
      color: "#2196F3",
      bgColor: "#E3F2FD",
    })

    addDetail({
      label: "Sunlight",
      value: source?.sunlight?.length ? source.sunlight.map((item) => formatLabel(item)).join(", ") : null,
      icon: "weather-sunny",
      color: "#FF9800",
      bgColor: "#FFF3E0",
    })

    addDetail({
      label: "Indoor",
      value: typeof source?.indoor === "boolean" ? (source.indoor ? "Yes" : "No") : null,
      icon: "home-heart",
      color: "#795548",
      bgColor: "#EFEBE9",
    })

    const edibleValue =
      typeof detailSource?.edible_fruit === "boolean"
        ? detailSource.edible_fruit
        : typeof source?.edible === "boolean"
        ? source.edible
        : null
    addDetail({
      label: "Edible",
      value: typeof edibleValue === "boolean" ? (edibleValue ? "Yes" : "No") : null,
      icon: "food-apple",
      color: "#8BC34A",
      bgColor: "#F1F8E9",
    })

    const poisonousValue =
      typeof detailSource?.poisonous_to_humans === "boolean"
        ? detailSource.poisonous_to_humans
        : typeof source?.poisonous === "boolean"
        ? source.poisonous
        : null
    addDetail({
      label: "Poisonous",
      value: typeof poisonousValue === "boolean" ? (poisonousValue ? "Yes" : "No") : null,
      icon: "skull-outline",
      color: "#E53935",
      bgColor: "#FFEBEE",
    })

    const hardinessValueRaw = source?.hardiness
    let hardinessValue: string | null = null

    if (Array.isArray(hardinessValueRaw)) {
      hardinessValue = hardinessValueRaw.filter(Boolean).join(" / ")
    } else if (typeof hardinessValueRaw === "string") {
      hardinessValue = hardinessValueRaw
    } else if (hardinessValueRaw && typeof hardinessValueRaw === "object") {
      const range = hardinessValueRaw as PlantHardinessRange
      hardinessValue = [range.min, range.max].filter(Boolean).join(" - ")
    }

    addDetail({
      label: "Hardiness",
      value: hardinessValue,
      icon: "thermometer",
      color: "#9C27B0",
      bgColor: "#F3E5F5",
    })

    addDetail({
      label: "Care Level",
      value: detailSource?.care_level ? formatLabel(detailSource.care_level) : null,
      icon: "account-heart",
      color: "#009688",
      bgColor: "#E0F2F1",
    })

    if (detailSource?.watering_general_benchmark?.value) {
      addDetail({
        label: "Water Benchmark",
        value: `${detailSource.watering_general_benchmark.value}${
          detailSource.watering_general_benchmark.unit ? ` ${detailSource.watering_general_benchmark.unit}` : ""
        }`,
        icon: "cup-water",
        color: "#3F51B5",
        bgColor: "#E8EAF6",
      })
    }

    if (detailSource?.growth_rate) {
      addDetail({
        label: "Growth Rate",
        value: formatLabel(detailSource.growth_rate),
        icon: "chart-line",
        color: "#673AB7",
        bgColor: "#EDE7F6",
      })
    }

    if (detailSource?.soil?.length) {
      addDetail({
        label: "Soil Preferences",
        value: detailSource.soil.map((item) => formatLabel(item)).join(", "),
        icon: "shovel",
        color: "#6D4C41",
        bgColor: "#EFEBE9",
      })
    }


    if (details.length === 0) {
      return [
        {
          label: "Watering",
          value: "Check plant requirements",
          icon: "watering-can",
          color: "#2196F3",
          bgColor: "#E3F2FD",
        },
        {
          label: "Sunlight",
          value: "See recommended lighting",
          icon: "weather-sunny",
          color: "#FF9800",
          bgColor: "#FFF3E0",
        },
      ]
    }

    return details
  }, [resolvedPlant, detailedPlant])

  const descriptionLength = description?.length ?? 0
  const shouldTruncateDescription = descriptionLength > 180
  const descriptionText =
    shouldTruncateDescription && !isDescriptionExpanded
      ? `${description.substring(0, 180)}…`
      : description

  return (
    <Template
      title={scientificName}
      images={images}
      imageHeader
      onPressBack={() => router.back()}
    >
      <ScrollView
        style={styles.contentCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentCardContent}
      >
        <Text style={styles.plantName}>{scientificName}</Text>

        {isFetchingDetails ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading detailed information…</Text>
          </View>
        ) : null}

        {detailsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{detailsError}</Text>
          </View>
        ) : null}

        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About this plant</Text>
          <Text style={styles.descriptionText}>{descriptionText}</Text>
          {shouldTruncateDescription && (
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

        <View style={styles.detailsGrid}>
          {plantDetails.map((detail, index) => (
            <View key={`${detail.label}-${index}`} style={styles.detailCard}>
              <View style={[styles.detailIconContainer, { backgroundColor: detail.bgColor }]}>
                <MaterialCommunityIcons name={detail.icon as any} size={24} color={detail.color} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: detail.color }]}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            </View>
          ))}
        </View>

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
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(8),
    marginBottom: vs(16),
  },
  loadingText: {
    fontSize: ms(13),
    color: "#666",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderRadius: ms(8),
    paddingVertical: vs(12),
    paddingHorizontal: hs(12),
    marginBottom: vs(16),
  },
  errorText: {
    fontSize: ms(13),
    color: "#C62828",
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
    flexDirection: "row",
  },
  detailIconContainer: {
    width: hs(48),
    height: vs(48),
    borderRadius: ms(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: vs(8),
  },
  detailContent: {
    flexDirection: "column",
    paddingLeft: hs(10),
    flex: 1,
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

function formatLabel(label: string | null | undefined): string {
  if (!label) {
    return ""
  }

  return label
    .toString()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

