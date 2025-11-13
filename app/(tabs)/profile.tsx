"use client"

import JournalCard, { type JournalEntry } from "@/components/JournalCard"
import { useAuth } from "@/contexts/AuthContext"
import { getUserProfile, type UserProfile } from "@/services/userService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native"
import ImageViewing from "react-native-image-viewing"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Profile() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"journal" | "bookmarks" | "gallery">("journal")
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [currentEntryImages, setCurrentEntryImages] = useState<ImageSourcePropType[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false)
  const [profileError, setProfileError] = useState<string | null>(null)

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

  // Mock data - all journal entries from all plants
  const allJournalEntries: JournalEntry[] = [
    {
      id: "1",
      plantName: "Chili Padi",
      date: "31 Oct",
      height: "55cm",
      notes: "every few days need to harvest and water, and then should be okay alr",
      images: [
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
      ],
    },
    {
      id: "2",
      plantName: "Lime",
      date: "28 Oct",
      height: "45cm",
      notes: "Looking healthy, added some fertilizer today",
      images: [
        require("../../assets/images/dummy/lime.jpeg"),
        require("../../assets/images/dummy/lime.jpeg"),
      ],
    },
    {
      id: "3",
      plantName: "Pandan",
      date: "25 Oct",
      height: "30cm",
      notes: "New growth spotted! Very excited about this one.",
      images: [
        require("../../assets/images/dummy/pandan.jpg"),
      ],
    },
    {
      id: "4",
      plantName: "Chili Padi",
      date: "20 Oct",
      height: "52cm",
      notes: "Harvested first batch of chilies today",
      images: [
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
      ],
    },
  ]

  const openImageViewer = (images: ImageSourcePropType[], startIndex: number) => {
    setCurrentEntryImages(images)
    setImageViewerIndex(startIndex)
    setImageViewerVisible(true)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "journal":
        return (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {allJournalEntries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onImagePress={openImageViewer}
                showPlantName={true}
              />
            ))}
          </ScrollView>
        )
      case "bookmarks":
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookmarks yet</Text>
          </View>
        )
      case "gallery":
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Gallery coming soon</Text>
          </View>
        )
      default:
        return null
    }
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


      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "journal" && styles.tabActive]}
            onPress={() => setActiveTab("journal")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, activeTab === "journal" && styles.tabLabelActive]}>
              Journal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "bookmarks" && styles.tabActive]}
            onPress={() => setActiveTab("bookmarks")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, activeTab === "bookmarks" && styles.tabLabelActive]}>
              Bookmarks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "gallery" && styles.tabActive]}
            onPress={() => setActiveTab("gallery")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, activeTab === "gallery" && styles.tabLabelActive]}>
              Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      {/* Image Viewer */}
      <ImageViewing
        images={currentEntryImages.map(img => {
          if (typeof img === 'number') {
            const resolved = Image.resolveAssetSource(img)
            return { uri: resolved.uri }
          }
          return { uri: (img as any).uri || '' }
        })}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        presentationStyle="overFullScreen"
        animationType="fade"
      />
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
  tabsWrapper: {
    marginHorizontal: -hs(20),
    paddingBottom: vs(10),
    marginBottom: 0,
    backgroundColor: "#F5F5F5",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: hs(20),
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: vs(12),
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabLabel: {
    fontSize: ms(14),
    fontWeight: "500",
    color: "#999",
  },
  tabLabelActive: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
    marginHorizontal: -hs(20),
    backgroundColor: "#F5F5F5",
    paddingHorizontal: hs(20),
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: ms(16),
    color: "#999",
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
