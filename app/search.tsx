"use client"

import { searchUserPlants, type UserPlant } from "@/services/myPlantService"
import { fetchPlantSpeciesList, type PlantSpecies } from "@/services/plantService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type RecentSearch = {
  id: string
  name: string
  image: any
  imageUrl?: string | null
  source: "myplants" | "plantpedia"
}

type SearchResult = {
  id: string
  name: string
  image: any
  imageUrl?: string | null
  scientificName?: string
  description?: string
  tags?: string[]
  source?: "myplants" | "plantpedia"
}

const FALLBACK_PLANT_IMAGE = require("../assets/images/dummy/chilli_padi.jpg")

const STORAGE_KEY = "@plantpal_recent_searches"

export default function Search() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const source = params.source as string || "myplants" // "myplants" or "plantpedia"
  
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)

  // Load recent searches from AsyncStorage on mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        setIsLoadingRecent(true)
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as RecentSearch[]
          // Filter to only show recent searches for the current source
          const filtered = parsed.filter(item => item.source === source)
          setRecentSearches(filtered)
        }
      } catch (error) {
        console.error("Failed to load recent searches:", error)
      } finally {
        setIsLoadingRecent(false)
      }
    }
    loadRecentSearches()
  }, [source])

  // Save recent searches to AsyncStorage whenever they change
  useEffect(() => {
    const saveRecentSearches = async () => {
      if (isLoadingRecent) return // Don't save on initial load
      try {
        // Load all recent searches first
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        let allRecentSearches: RecentSearch[] = []
        if (stored) {
          allRecentSearches = JSON.parse(stored) as RecentSearch[]
        }
        
        // Remove old searches for this source and add new ones (limit to 10 per source)
        const filtered = allRecentSearches.filter(item => item.source !== source)
        const limitedRecent = recentSearches.slice(0, 10) // Keep max 10 recent per source
        const updated = [...limitedRecent, ...filtered]
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error("Failed to save recent searches:", error)
      }
    }
    saveRecentSearches()
  }, [recentSearches, source, isLoadingRecent])

  // Search function using API
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      if (source === "myplants") {
        // Use user plants search API
        const results = await searchUserPlants({ searchValue: query })
        const mappedResults: SearchResult[] = results.map((plant: UserPlant) => ({
          id: plant.id,
          name: plant.plantName ?? plant.name ?? "Unnamed Plant",
          image: plant.imageUrl ? { uri: plant.imageUrl } : FALLBACK_PLANT_IMAGE,
          imageUrl: plant.imageUrl ?? null,
          source: "myplants" as const,
        }))
        setSearchResults(mappedResults)
      } else {
        // Use plant pedia search API
        const response = await fetchPlantSpeciesList({ q: query, page: 1 })
        const mappedResults: SearchResult[] = response.data.map((species: PlantSpecies) => ({
          id: String(species.id),
          name: species.common_name || species.scientific_name?.[0] || "Unknown Plant",
          scientificName: species.scientific_name?.[0],
          image: species.default_image?.regular_url 
            ? { uri: species.default_image.regular_url } 
            : FALLBACK_PLANT_IMAGE,
          description: species.genus ? `Genus: ${species.genus}` : undefined,
          source: "plantpedia" as const,
        }))
        setSearchResults(mappedResults)
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [source])

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  const handleRemoveRecentSearch = (id: string) => {
    setRecentSearches(prev => prev.filter(item => item.id !== id))
  }

  const handleSearchItemPress = (item: SearchResult) => {
    // Add to recent searches if not already there
    const existingIndex = recentSearches.findIndex(r => r.id === item.id && r.source === source)
    if (existingIndex === -1) {
      const newRecent: RecentSearch = {
        id: item.id,
        name: item.name,
        image: item.image,
        imageUrl: item.imageUrl ?? null,
        source: source as "myplants" | "plantpedia",
      }
      setRecentSearches(prev => [
        newRecent,
        ...prev.slice(0, 2) // Keep only 3 most recent
      ])
    } else {
      // Move to top if already exists
      const updated = [...recentSearches]
      const [existing] = updated.splice(existingIndex, 1)
      setRecentSearches([existing, ...updated])
    }

    // Navigate based on source
    if (source === "myplants") {
      router.push({ pathname: "/plantDetails", params: { id: item.id } })
    } else {
      router.push({
        pathname: "/plantPediaDetails",
        params: {
          id: item.id,
          name: item.name,
          scientificName: item.scientificName || item.name,
          description: item.description || "",
          tags: JSON.stringify(item.tags || []),
        },
      })
    }
  }

  const handleRecentSearchPress = (recentItem: RecentSearch) => {
    // Find the item in search results or create a search result from recent
    const searchResult: SearchResult = {
      id: recentItem.id,
      name: recentItem.name,
      image: recentItem.image,
      imageUrl: recentItem.imageUrl ?? null,
      source: recentItem.source,
    }
    handleSearchItemPress(searchResult)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {searchQuery.trim() ? (
          // Search Results
          <View style={styles.resultsContainer}>
            {isSearching ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={[styles.emptyText, { marginTop: vs(12) }]}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultItem}
                  onPress={() => handleSearchItemPress(item)}
                  activeOpacity={0.7}
                >
                  <Image source={item.image} style={styles.resultImage} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    {item.scientificName && (
                      <Text style={styles.resultScientificName}>{item.scientificName}</Text>
                    )}
                    {item.description && (
                      <Text style={styles.resultDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            )}
          </View>
        ) : (
          // Recent Searches
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {isLoadingRecent ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : recentSearches.length > 0 ? (
              recentSearches.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentSearchItem}
                  onPress={() => handleRecentSearchPress(item)}
                  activeOpacity={0.7}
                >
                  <Image source={item.image} style={styles.recentSearchImage} />
                  <Text style={styles.recentSearchName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleRemoveRecentSearch(item.id)
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="close" size={18} color="#999" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recent searches</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: hs(20),
    paddingVertical: vs(15),
    gap: hs(12),
  },
  backButton: {
    padding: ms(4),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: ms(12),
    paddingHorizontal: hs(12),
    paddingVertical: vs(10),
  },
  searchIcon: {
    marginRight: hs(8),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(16),
    color: "#1a1a1a",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(20),
  },
  recentSearchesContainer: {
    paddingHorizontal: hs(20),
    paddingTop: vs(10),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(16),
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  recentSearchImage: {
    width: hs(50),
    height: vs(50),
    borderRadius: ms(8),
    marginRight: hs(12),
    resizeMode: "cover",
  },
  recentSearchName: {
    flex: 1,
    fontSize: ms(16),
    fontWeight: "500",
    color: "#1a1a1a",
  },
  removeButton: {
    padding: ms(4),
  },
  resultsContainer: {
    paddingHorizontal: hs(20),
    paddingTop: vs(10),
  },
  resultItem: {
    flexDirection: "row",
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resultImage: {
    width: hs(60),
    height: vs(60),
    borderRadius: ms(8),
    marginRight: hs(12),
    resizeMode: "cover",
  },
  resultInfo: {
    flex: 1,
    justifyContent: "center",
  },
  resultName: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  resultScientificName: {
    fontSize: ms(14),
    color: "#666",
    marginBottom: vs(4),
    fontStyle: "italic",
  },
  resultDescription: {
    fontSize: ms(13),
    color: "#999",
    lineHeight: ms(18),
  },
  emptyContainer: {
    paddingVertical: vs(40),
    alignItems: "center",
  },
  emptyText: {
    fontSize: ms(16),
    color: "#999",
  },
})





