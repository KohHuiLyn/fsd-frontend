"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import JournalCard, { type JournalEntry } from "@/components/JournalCard"
import ImageViewing from "react-native-image-viewing"
import { type ImageSourcePropType } from "react-native"
import { useAuth } from "@/contexts/AuthContext"

export default function Profile() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"journal" | "bookmarks" | "gallery">("journal")
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [currentEntryImages, setCurrentEntryImages] = useState<ImageSourcePropType[]>([])

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image 
            source={require("../../assets/call-duck-royalty-free-image-1732105274.jpg")} 
            style={styles.profileImage}
          />
          <Text style={styles.username}>{user?.username || user?.name || user?.email || "User"}</Text>
          {user?.email && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#1a1a1a" />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(20),
    paddingVertical: vs(20),
  },
  profileSection: {
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: hs(80),
    height: vs(80),
    borderRadius: ms(40),
    marginBottom: vs(12),
    resizeMode: "cover",
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
  menuButton: {
    padding: ms(4),
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
    paddingTop: vs(20),
    paddingHorizontal: hs(20),
    paddingBottom: vs(20),
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
