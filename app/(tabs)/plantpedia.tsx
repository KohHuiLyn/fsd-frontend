"use client"

import { fetchPlantSpeciesList, type PlantSpecies, type SpeciesListParams } from "@/services/plantService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type FilterOption = {
  label: string
  params: Partial<SpeciesListParams>
}

const PLACEHOLDER_IMAGE = require("../../assets/images/dummy/chilli_padi.jpg")

export default function PlantPedia() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [selectedFilter, setSelectedFilter] = useState<string>("All Plants")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [bookmarkedPlants, setBookmarkedPlants] = useState<Set<number>>(new Set())
  const [plants, setPlants] = useState<PlantSpecies[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)



  const filterOptions: FilterOption[] = useMemo(
    () => [
      { label: "All Plants", params: {} },
      { label: "Indoor Friendly", params: { indoor: true } },
      { label: "Edible", params: { edible: true } },
      { label: "Poisonous", params: { poisonous: true } },
      { label: "Perennial", params: { cycle: "perennial" } },
      { label: "Full Sun", params: { sunlight: "full_sun" } },
    ],
    []
  )

  const selectedFilterParams = useMemo(() => {
    const match = filterOptions.find((option) => option.label === selectedFilter)
    return match?.params ?? {}
  }, [filterOptions, selectedFilter])

  const toggleBookmark = (plantId: number) => {
    setBookmarkedPlants((prev) => {
      const next = new Set(prev)
      if (next.has(plantId)) {
        next.delete(plantId)
      } else {
        next.add(plantId)
      }
      return next
    })
  }

  const loadPlants = useCallback(
    async (pageToFetch: number, options?: { refresh?: boolean }) => {


      if (pageToFetch === 1 && !options?.refresh) {
        setIsInitialLoading(true)
      } else if (options?.refresh) {
        setIsRefreshing(true)
      } else {
        setIsFetchingMore(true)
      }

      try {
        const response = await fetchPlantSpeciesList({
          ...selectedFilterParams,
          page: pageToFetch,
        })

        setError(null)

        setPlants((prev) => (pageToFetch === 1 ? response.data : [...prev, ...response.data]))
        setPage(pageToFetch)
        setHasMore(pageToFetch < response.last_page)
      } catch (err: any) {
        console.error("Failed to load plants:", err)
        setError(err?.message ?? "Unable to load plants right now.")
        if (pageToFetch === 1) {
          setPlants([])
        }
      } finally {
        setIsInitialLoading(false)
        setIsFetchingMore(false)
        setIsRefreshing(false)
      }
    },
    [ selectedFilterParams]
  )

  useEffect(() => {
    setPlants([])
    setPage(1)
    setHasMore(true)
    loadPlants(1)
  }, [loadPlants, selectedFilter])

  const handleLoadMore = () => {
    if (!isFetchingMore && !isInitialLoading && hasMore) {
      loadPlants(page + 1)
    }
  }

  const handleRefresh = () => {
    loadPlants(1, { refresh: true })
  }

  const renderPlantCard = ({ item }: { item: PlantSpecies }) => {
    const imageSource = item?.default_image?.medium_url
      ? { uri: item.default_image.medium_url }
      : PLACEHOLDER_IMAGE

    const displayName = item.common_name || item.scientific_name?.[0] || "Unknown Plant"
    const scientificName = item.scientific_name?.join(", ")

    const tagCandidates = [
      item.family ? `Family: ${item.family}` : null,
      item.genus ? `Genus: ${item.genus}` : null,
      item.cycle ? `Cycle: ${formatLabel(item.cycle)}` : null,
      item.watering ? `Watering: ${formatLabel(item.watering)}` : null,
      ...(Array.isArray(item.sunlight) ? item.sunlight.slice(0, 2).map((sun) => formatLabel(sun)) : []),
    ].filter(Boolean) as string[]

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.plantCard}
        onPress={() => {
          router.push({
            pathname: "/plantPediaDetails",
            params: {
              id: item.id.toString(),
              plant: JSON.stringify(item),
              tags: JSON.stringify(tagCandidates),
              imageUrl: item.default_image?.regular_url ?? "",
              name: displayName,
              scientificName,
            },
          })
        }}
        activeOpacity={0.85}
      >
        <Image source={imageSource} style={styles.plantImage} />

        <View style={styles.plantDetails}>
          <Text style={styles.plantName}>{displayName}</Text>
          {scientificName ? <Text style={styles.scientificName}>{scientificName}</Text> : null}

          <View style={styles.tagsContainer}>
            {tagCandidates.length > 0 ? (
              tagCandidates.slice(0, 3).map((tag, index) => (
                <View key={`${item.id}-tag-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Tap to view details</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionIcons}>
          <TouchableOpacity
            onPress={(event) => {
              event.stopPropagation()
              toggleBookmark(item.id)
            }}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={bookmarkedPlants.has(item.id) ? "bookmark" : "bookmark-outline"}
              size={ms(20)}
              color={bookmarkedPlants.has(item.id) ? "#4CAF50" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => {
    if (isInitialLoading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.emptyStateText}>Loading plants...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPlants(1)}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No plants found for this filter.</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PlantPedia</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: "/search", params: { source: "plantpedia" } })}>
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
          <Text style={styles.categoryButtonText}>{selectedFilter}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Plant List */}
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlantCard}
        contentContainerStyle={styles.plantList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        onEndReachedThreshold={0.3}
        onEndReached={handleLoadMore}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />}
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          ) : null
        }
      />

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
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.modalItem,
                    selectedFilter === option.label && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedFilter(option.label)
                    setShowCategoryModal(false)
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedFilter === option.label && styles.modalItemTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedFilter === option.label && (
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
    gap: vs(10),
  },
  plantCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: vs(12),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: hs(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  plantImage: {
    width: hs(96),
    height: vs(96),
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
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: vs(40),
  },
  emptyStateText: {
    fontSize: ms(14),
    color: "#666",
    marginTop: vs(12),
    textAlign: "center",
    paddingHorizontal: hs(20),
  },
  retryButton: {
    marginTop: vs(12),
    paddingHorizontal: hs(16),
    paddingVertical: vs(10),
    borderRadius: ms(8),
    backgroundColor: "#4CAF50",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: ms(14),
    fontWeight: "600",
  },
  footerLoading: {
    paddingVertical: vs(16),
  },
  scientificName: {
    fontSize: ms(13),
    color: "#777",
    marginBottom: vs(6),
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
