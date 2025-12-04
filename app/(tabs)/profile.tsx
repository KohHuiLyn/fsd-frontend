"use client"

import { useAuth } from "@/contexts/AuthContext"
import { fetchPlantSpeciesDetails, type PlantSpecies } from "@/services/plantService"
import { getProxies, type ProxyContact } from "@/services/proxyService"
import { getUserProfile, type UserProfile } from "@/services/userService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const BOOKMARKS_STORAGE_KEY = "@plantpal_bookmarked_plants"
const PLACEHOLDER_IMAGE = require("../../assets/images/dummy/chilli_padi.jpg")

function parseProxyDate(value?: string | null): Date | null {
  if (!value) {
    return null
  }
  const normalized = value.replace(" ", "T")
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatProxyDateRange(start?: string | null, end?: string | null): string | null {
  const startDate = parseProxyDate(start)
  const endDate = parseProxyDate(end)

  if (!startDate && !endDate) {
    return null
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  const format = (date: Date | null) => {
    if (!date) {
      return ""
    }
    return `${dateFormatter.format(date)} • ${timeFormatter.format(date)}`
  }

  if (startDate && endDate) {
    return `${format(startDate)} → ${format(endDate)}`
  }

  if (startDate) {
    return `Starts ${format(startDate)}`
  }

  return `Ends ${format(endDate)}`
}

export default function Profile() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [bookmarkedPlants, setBookmarkedPlants] = useState<PlantSpecies[]>([])
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState<boolean>(false)
  const [proxies, setProxies] = useState<ProxyContact[]>([])
  const [isLoadingProxies, setIsLoadingProxies] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  useEffect(() => {
    if (!user?.id) {
      return
    }

    let isMounted = true
    setIsProfileLoading(true)

    getUserProfile(user.id)
      .then((data) => {
        if (!isMounted) {
          return
        }
        setProfile(data)
        setProfileError(null)
      })
      .catch((error: any) => {
        if (!isMounted) {
          return
        }
        const message = typeof error?.message === "string" && error.message.trim().length > 0
          ? error.message
          : "Unable to load profile information"
        setProfileError(message)
      })
      .finally(() => {
        if (isMounted) {
          setIsProfileLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [user?.id])

  // Load bookmarked plants
  useEffect(() => {
    const loadBookmarkedPlants = async () => {
      setIsLoadingBookmarks(true)
      try {
        const stored = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY)
        if (stored) {
          const bookmarkedIds = JSON.parse(stored) as number[]
          if (bookmarkedIds.length > 0) {
            // Fetch plant details for each bookmarked ID
            const plantPromises = bookmarkedIds.map((id) =>
              fetchPlantSpeciesDetails(id).catch((err) => {
                console.error(`Failed to fetch plant ${id}:`, err)
                return null
              })
            )
            const plants = await Promise.all(plantPromises)
            const validPlants = plants.filter((plant): plant is PlantSpecies => plant !== null)
            setBookmarkedPlants(validPlants)
          } else {
            setBookmarkedPlants([])
          }
        } else {
          setBookmarkedPlants([])
        }
      } catch (error) {
        console.error("Failed to load bookmarked plants:", error)
        setBookmarkedPlants([])
      } finally {
        setIsLoadingBookmarks(false)
      }
    }

    loadBookmarkedPlants()
  }, [])

  // Load proxy gardeners
  useEffect(() => {
    const loadProxies = async () => {
      setIsLoadingProxies(true)
      try {
        const data = await getProxies()
        setProxies(data ?? [])
      } catch (err: any) {
        console.error("Failed to load proxies:", err)
        if (typeof err?.message === "string" && err.message.toLowerCase().includes("notfound")) {
          setProxies([])
        }
      } finally {
        setIsLoadingProxies(false)
      }
    }

    loadProxies()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Reload both bookmarks and proxies
      const [stored] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY),
        getProxies().then((data) => {
          setProxies(data ?? [])
        }).catch(() => {}),
      ])

      if (stored) {
        const bookmarkedIds = JSON.parse(stored) as number[]
        if (bookmarkedIds.length > 0) {
          const plantPromises = bookmarkedIds.map((id) =>
            fetchPlantSpeciesDetails(id).catch(() => null)
          )
          const plants = await Promise.all(plantPromises)
          const validPlants = plants.filter((plant): plant is PlantSpecies => plant !== null)
          setBookmarkedPlants(validPlants)
        } else {
          setBookmarkedPlants([])
        }
      } else {
        setBookmarkedPlants([])
      }
    } catch (error) {
      console.error("Failed to refresh:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout()
              router.replace("/login")
            } catch (error) {
              Alert.alert("Error", "Failed to logout")
            }
          }
        }
      ]
    )
  }


  const profileImageSource = useMemo<ImageSourcePropType>(() => {
    if (profile?.profilePicture) {
      return profile.profilePicture as ImageSourcePropType
    }
    return require("../../assets/images/profile_pic.png") as ImageSourcePropType
  }, [profile?.profilePicture])

  const displayName = useMemo(() => {
    return (
      profile?.username ??
      user?.username ??
      profile?.email ??
      user?.email ??
      "User"
    )
  }, [profile?.username, profile?.email, user?.username, user?.email])

  const displayEmail = useMemo(() => {
    return profile?.email ?? user?.email ?? null
  }, [profile?.email, user?.email])

  const displayRoleLabel = useMemo(() => {
    const role = profile?.role ?? user?.role ?? null
    return role ? formatLabel(role) : null
  }, [profile?.role, user?.role])

  const displayPhone = useMemo(() => {
    return profile?.phoneNumber ?? user?.phoneNumber ?? null
  }, [profile?.phoneNumber, user?.phoneNumber])

  const joinedLabel = useMemo(() => {
    return profile?.createdAt ? formatDateDisplay(profile.createdAt) : null
  }, [profile?.createdAt])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={profileImageSource}
              style={styles.profileImage}
            />
            {isProfileLoading && (
              <View style={styles.profileImageOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.usernameContainer}>
          <Text style={styles.username}>{displayName}</Text>
{/* 
          {displayRoleLabel ? <Text style={styles.roleLabel}>{displayRoleLabel == 'gardener' ? <MaterialCommunityIcons  name="leaf" size={ms(15)} color="#fff" /> : <MaterialCommunityIcons name="person" size={ms(15)} color="#fff" />}</Text> : null} */}

          </View>
          {displayEmail ? <Text style={styles.email}>{displayEmail}</Text> : null}
          {/* {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null} */}
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push("/settings")}
        >
          <MaterialCommunityIcons name="menu" size={28} color="#1a1a1a" />
        </TouchableOpacity>
      </View>


      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
        }
      >
        {/* Bookmarks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bookmarks</Text>
            <MaterialCommunityIcons name="bookmark" size={20} color="#4CAF50" />
          </View>
          
          {isLoadingBookmarks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading bookmarks...</Text>
            </View>
          ) : bookmarkedPlants.length === 0 ? (
            <View style={styles.emptySection}>
              <MaterialCommunityIcons name="bookmark-outline" size={32} color="#999" />
              <Text style={styles.emptyText}>No bookmarks yet</Text>
              <Text style={styles.emptySubtext}>Bookmark plants from PlantPedia to see them here</Text>
            </View>
          ) : (
            <View style={styles.bookmarksContainer}>
              {bookmarkedPlants.map((item) => {
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
                    style={styles.bookmarkCard}
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
                    <Image source={imageSource} style={styles.bookmarkImage} />
                    <View style={styles.bookmarkDetails}>
                      <Text style={styles.bookmarkName}>{displayName}</Text>
                      {scientificName ? <Text style={styles.bookmarkScientificName}>{scientificName}</Text> : null}
                      <View style={styles.bookmarkTagsContainer}>
                        {tagCandidates.length > 0 ? (
                          tagCandidates.slice(0, 2).map((tag, index) => (
                            <View key={`${item.id}-tag-${index}`} style={styles.bookmarkTag}>
                              <Text style={styles.bookmarkTagText}>{tag}</Text>
                            </View>
                          ))
                        ) : null}
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>

        {/* Proxy Gardeners Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Proxy Gardeners</Text>
            <TouchableOpacity
              onPress={() => router.push("/proxyGardener/add")}
              style={styles.addButton}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {isLoadingProxies ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading proxies...</Text>
            </View>
          ) : proxies.length === 0 ? (
            <View style={styles.emptySection}>
              <MaterialCommunityIcons name="account-group" size={32} color="#999" />
              <Text style={styles.emptyText}>No proxy gardeners yet</Text>
              <Text style={styles.emptySubtext}>
                Add a trusted contact to care for your plants while you're away
              </Text>
              <TouchableOpacity
                style={styles.addProxyButton}
                onPress={() => router.push("/proxyGardener/add")}
              >
                <Text style={styles.addProxyButtonText}>Add Proxy Gardener</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.proxiesContainer}>
              {proxies.map((proxy) => {
                const dateRange = formatProxyDateRange(proxy.startDate, proxy.endDate)
                return (
                  <TouchableOpacity
                    key={proxy.id}
                    style={styles.proxyCard}
                    onPress={() => {
                      router.push({
                        pathname: "/proxyGardener/[id]",
                        params: {
                          id: proxy.id,
                        },
                      })
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.proxyInfo}>
                      <Text style={styles.proxyName}>{proxy.name}</Text>
                      {proxy.phoneNumber ? (
                        <Text style={styles.proxyContact}>{proxy.phoneNumber}</Text>
                      ) : null}
                      {dateRange ? <Text style={styles.proxySchedule}>{dateRange}</Text> : null}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  usernameContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
  },
  roleLabel:{
    fontSize: ms(12),
    backgroundColor: "#4e9c63",
    marginTop: vs(4),
    paddingHorizontal: ms(10),
    color:'white',
    borderRadius: ms(100),
    paddingVertical: vs(4),
    fontWeight:'bold',
    marginLeft: hs(10),
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: vs(50),
    paddingBottom: vs(30),
    position: "relative",
    minHeight: vs(160), // 👈 ensures enough space for the profile image + name
  },
  
  menuButton: {
    position: "absolute",
    top: vs(20),
    right: hs(20),
    padding: ms(8),
    zIndex: 10,
  },
  
  profileSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageWrapper: {
    position: "relative",
    width: hs(80),
    height: hs(80),
    marginBottom: vs(12),
  },
  profileImage: {
    width: hs(80),
    height: hs(80),
    borderRadius: ms(40),
    marginBottom: 0,
    resizeMode: "cover",
  },
  profileImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ms(40),
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  email: {
    fontSize: ms(14),
    color: "#666",
    marginTop: vs(4),
  },
  metaText: {
    fontSize: ms(12),
    color: "#777",
    marginTop: vs(4),
  },
  errorText: {
    fontSize: ms(12),
    color: "#D32F2F",
    marginTop: vs(8),
    textAlign: "center",
    paddingHorizontal: hs(20),
  },
  scrollContent: {
    paddingBottom: vs(100),
    paddingHorizontal: hs(20),
  },
  section: {
    marginBottom: vs(24),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vs(12),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  addButton: {
    padding: ms(4),
  },
  loadingContainer: {
    paddingVertical: vs(20),
    alignItems: "center",
    gap: vs(8),
  },
  loadingText: {
    fontSize: ms(14),
    color: "#999",
  },
  emptySection: {
    backgroundColor: "#F5F5F5",
    borderRadius: ms(12),
    padding: vs(24),
    alignItems: "center",
    gap: vs(8),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: ms(16),
    color: "#999",
    marginTop: vs(12),
  },
  emptySubtext: {
    fontSize: ms(14),
    color: "#999",
    marginTop: vs(8),
    textAlign: "center",
    paddingHorizontal: hs(40),
  },
  bookmarksContainer: {
    gap: vs(12),
  },
  proxiesContainer: {
    gap: vs(12),
  },
  proxyCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: hs(12),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  proxyInfo: {
    flex: 1,
    gap: vs(4),
  },
  proxyName: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  proxyContact: {
    fontSize: ms(13),
    color: "#4CAF50",
    fontWeight: "600",
  },
  proxySchedule: {
    fontSize: ms(12),
    color: "#666",
  },
  addProxyButton: {
    marginTop: vs(12),
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
    backgroundColor: "#4CAF50",
    borderRadius: ms(8),
  },
  addProxyButtonText: {
    color: "#fff",
    fontSize: ms(14),
    fontWeight: "600",
  },
  bookmarkCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: vs(12),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: hs(12),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookmarkImage: {
    width: hs(80),
    height: vs(80),
    borderRadius: ms(12),
    marginRight: hs(12),
    resizeMode: "cover",
  },
  bookmarkDetails: {
    flex: 1,
    marginRight: hs(8),
  },
  bookmarkName: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  bookmarkScientificName: {
    fontSize: ms(12),
    color: "#777",
    marginBottom: vs(6),
    fontStyle: "italic",
  },
  bookmarkTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: hs(6),
  },
  bookmarkTag: {
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    backgroundColor: "#F5F5F5",
    borderRadius: ms(4),
  },
  bookmarkTagText: {
    fontSize: ms(10),
    fontWeight: "500",
    color: "#666",
  },
})

function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatLabel(value: string): string {
  return value
    .toString()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
