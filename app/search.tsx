"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState, useMemo } from "react"
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type RecentSearch = {
  id: string
  name: string
  image: any
}

type SearchResult = {
  id: string
  name: string
  image: any
  scientificName?: string
  description?: string
  tags?: string[]
}

export default function Search() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const source = params.source as string || "myplants" // "myplants" or "plantpedia"
  
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([
    {
      id: "1",
      name: "Chili Padi",
      image: require("../assets/images/dummy/chilli_padi.jpg"),
    },
    {
      id: "2",
      name: "Lime",
      image: require("../assets/images/dummy/lime.jpeg"),
    },
    {
      id: "3",
      name: "Pandan",
      image: require("../assets/images/dummy/pandan.jpg"),
    },
  ])

  // Mock data - in real app, this would come from props or context
  const myPlants: SearchResult[] = [
    {
      id: "1",
      name: "Chili Padi",
      image: require("../assets/images/dummy/chilli_padi.jpg"),
    },
    {
      id: "2",
      name: "Lime",
      image: require("../assets/images/dummy/lime.jpeg"),
    },
    {
      id: "3",
      name: "Pandan",
      image: require("../assets/images/dummy/pandan.jpg"),
    },
  ]

  const plantPedia: SearchResult[] = [
    {
      id: "1",
      name: "Chili Padi",
      scientificName: "Capsicum frutescens",
      description: "A small, very spicy chili pepper.",
      image: require("../assets/images/dummy/chilli_padi.jpg"),
      tags: ["Indoor", "Pet-friendly"],
    },
    {
      id: "2",
      name: "Mint",
      scientificName: "Mentha",
      description: "Aromatic perennial herb.",
      image: require("../assets/images/dummy/chilli_padi.jpg"),
      tags: ["Indoor", "Pet-friendly"],
    },
    {
      id: "3",
      name: "Hibiscus",
      scientificName: "Hibiscus rosa-sinensis",
      description: "Tropical flowering plant.",
      image: require("../assets/images/dummy/chilli_padi.jpg"),
      tags: ["Indoor", "Pet-friendly"],
    },
  ]

  const dataSource = source === "myplants" ? myPlants : plantPedia

  // Filter results based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    return dataSource.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query)
      const scientificMatch = item.scientificName?.toLowerCase().includes(query)
      const descriptionMatch = item.description?.toLowerCase().includes(query)
      const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(query))
      
      return nameMatch || scientificMatch || descriptionMatch || tagsMatch
    })
  }, [searchQuery, dataSource])

  const handleRemoveRecentSearch = (id: string) => {
    setRecentSearches(prev => prev.filter(item => item.id !== id))
  }

  const handleSearchItemPress = (item: SearchResult) => {
    // Add to recent searches if not already there
    if (!recentSearches.find(r => r.id === item.id)) {
      setRecentSearches(prev => [
        { id: item.id, name: item.name, image: item.image },
        ...prev.slice(0, 2) // Keep only 3 most recent
      ])
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
            {searchResults.length > 0 ? (
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
            {recentSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentSearchItem}
                onPress={() => {
                  const fullItem = dataSource.find(d => d.id === item.id)
                  if (fullItem) {
                    handleSearchItemPress(fullItem)
                  }
                }}
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
            ))}
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




