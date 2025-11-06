"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { useState, useEffect } from "react"
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, type ImageSourcePropType } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import ImageViewing from "react-native-image-viewing"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

type JournalTabProps = {
  showNewEntry?: boolean
  setShowNewEntry?: (show: boolean) => void
}

export default function JournalTab({ showNewEntry: propShowNewEntry, setShowNewEntry: propSetShowNewEntry }: JournalTabProps = {}) {
  const [entries, setEntries] = useState([
    {
      id: "1",
      date: "31 Oct",
      height: "55cm",
      notes: "every few days need to harvest and water, and then should be okay alr",
      images: [
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
      ],
    },
    {
      id: "2",
      date: "28 Oct",
      height: "55cm",
      notes: "every few days need to harvest and water, and then should be okay alr",
      images: [
        require("../../assets/images/dummy/chilli_padi.jpg"),
        require("../../assets/images/dummy/chilli_padi.jpg"),
      ],
    },
    {
      id: "3",
      date: "25 Oct",
      height: "50cm",
      notes: "Single photo entry",
      images: [
        require("../../assets/images/dummy/chilli_padi.jpg"),
      ],
    },
  ])

  const [internalShowNewEntry, setInternalShowNewEntry] = useState(false)
  const showNewEntry = propShowNewEntry !== undefined ? propShowNewEntry : internalShowNewEntry
  const setShowNewEntry = propSetShowNewEntry || setInternalShowNewEntry
  const [newEntry, setNewEntry] = useState("")
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [currentEntryImages, setCurrentEntryImages] = useState<ImageSourcePropType[]>([])

  const openImageViewer = (images: ImageSourcePropType[], startIndex: number) => {
    setCurrentEntryImages(images)
    setImageViewerIndex(startIndex)
    setImageViewerVisible(true)
  }

  // Hide status bar when image viewer is open
  useEffect(() => {
    if (imageViewerVisible) {
      StatusBar.setHidden(true, 'fade')
    } else {
      StatusBar.setHidden(false, 'fade')
    }
    return () => {
      StatusBar.setHidden(false, 'fade')
    }
  }, [imageViewerVisible])

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {entries.map((entry) => {
          const imageCount = entry.images.length
          const mainImage = entry.images[0]
          const secondImage = entry.images[1]
          const thumbnails = entry.images.slice(1, 3)
          const remainingImages = entry.images.length > 3 ? entry.images.length - 3 : 0
          
          // Calculate dimensions
          const cardPadding = hs(0) * 2 // left + right margins
          const cardInnerPadding = ms(40) * 2 // left + right padding
          const availableWidth = SCREEN_WIDTH - cardPadding - cardInnerPadding
          const spacing = hs(8)
          
          // Layout based on number of images
          let imageLayout
          if (imageCount === 1) {
            // Single image: full width
            const imageWidth = availableWidth
            const imageHeight = imageWidth // Square aspect ratio
            imageLayout = (
              <TouchableOpacity 
                style={[styles.singleImageContainer, { width: imageWidth, height: imageHeight }]}
                onPress={() => openImageViewer(entry.images, 0)}
                activeOpacity={0.9}
              >
                <Image source={mainImage} style={styles.image} resizeMode="cover" />
              </TouchableOpacity>
            )
          } else if (imageCount === 2) {
            // Two images: 50/50 split
            const imageWidth = (availableWidth - spacing) / 2
            const imageHeight = imageWidth // Square aspect ratio
            imageLayout = (
              <View style={styles.twoImagesContainer}>
                <TouchableOpacity 
                  style={[styles.halfImageContainer, { width: imageWidth, height: imageHeight, marginRight: spacing }]}
                  onPress={() => openImageViewer(entry.images, 0)}
                  activeOpacity={0.9}
                >
                  <Image source={mainImage} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.halfImageContainer, { width: imageWidth, height: imageHeight }]}
                  onPress={() => openImageViewer(entry.images, 1)}
                  activeOpacity={0.9}
                >
                  <Image source={secondImage} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>
              </View>
            )
          } else {
            // Three or more images: main (2/3) + thumbnails (1/3 stacked)
            const mainImageWidth = (availableWidth - spacing) * (2 / 3)
            const thumbnailWidth = (availableWidth - spacing) * (1 / 3)
            const mainImageHeight = mainImageWidth // Square aspect ratio
            const thumbnailHeight = (mainImageHeight - spacing) / 2
            
            imageLayout = (
              <>
                {/* Main Image */}
                {mainImage && (
                  <TouchableOpacity 
                    style={[styles.mainImageContainer, { width: mainImageWidth, height: mainImageHeight }]}
                    onPress={() => openImageViewer(entry.images, 0)}
                    activeOpacity={0.9}
                  >
                    <Image source={mainImage} style={styles.image} resizeMode="cover" />
                  </TouchableOpacity>
                )}
                
                {/* Thumbnails Container */}
                <View style={styles.thumbnailsContainer}>
                  {thumbnails.map((img, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.thumbnailContainer, 
                        { 
                          width: thumbnailWidth, 
                          height: thumbnailHeight,
                          marginBottom: idx === 0 ? spacing : 0
                        }
                      ]}
                      onPress={() => openImageViewer(entry.images, idx + 1)}
                      activeOpacity={0.9}
                    >
                      <Image source={img} style={styles.image} resizeMode="cover" />
                      {/* Show +X overlay on bottom thumbnail if there are more images */}
                      {idx === 1 && remainingImages > 0 && (
                        <View style={styles.overlay}>
                          <View style={styles.overlayBackground} />
                          <Text style={styles.overlayText}>+{remainingImages}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  {/* Placeholder if less than 2 thumbnails */}
                  {thumbnails.length < 2 && (
                    <View 
                      style={[
                        styles.thumbnailContainer, 
                        styles.imagePlaceholder,
                        { 
                          width: thumbnailWidth, 
                          height: thumbnailHeight,
                          marginTop: thumbnails.length === 0 ? 0 : spacing
                        }
                      ]}
                    >
                      {thumbnails.length === 1 && remainingImages > 0 && (
                        <View style={styles.overlay}>
                          <View style={styles.overlayBackground} />
                          <Text style={styles.overlayText}>+{remainingImages}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </>
            )
          }
          
          return (
            <View key={entry.id} style={styles.entryCard}>
              {/* Images Section */}
              <View style={styles.imagesContainer}>
                {imageLayout}
              </View>

              {/* Text Content */}
              <View style={styles.textContent}>
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>{entry.date}</Text>
                  <Text style={styles.heightText}>{entry.height}</Text>
                </View>
                <Text style={styles.entryNotes}>{entry.notes}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>


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

      {/* New Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNewEntry}
        onRequestClose={() => setShowNewEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNewEntry(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Entry</Text>
              <TouchableOpacity>
                <Text style={styles.saveBtn}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <TouchableOpacity style={styles.imageUploadBox}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Add Photos</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.noteInput}
                placeholder="Write your journal entry..."
                multiline
                numberOfLines={5}
                value={newEntry}
                onChangeText={setNewEntry}
              />
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
    position: "relative",
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: ms(12),
    marginBottom: vs(20),
    marginHorizontal: hs(10),
    padding: ms(12),
  },
  imagesContainer: {
    flexDirection: "row",
    marginBottom: vs(12),
  },
  singleImageContainer: {
    borderRadius: ms(8),
    overflow: "hidden",
  },
  twoImagesContainer: {
    flexDirection: "row",
    width: "100%",
  },
  halfImageContainer: {
    borderRadius: ms(8),
    overflow: "hidden",
  },
  mainImageContainer: {
    borderRadius: ms(8),
    overflow: "hidden",
    marginRight: hs(8),
  },
  thumbnailsContainer: {
    flex: 1,
    flexDirection: "column",
  },
  thumbnailContainer: {
    borderRadius: ms(8),
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: ms(8),
  },
  imagePlaceholder: {
    backgroundColor: "#f0f0f0",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ms(8),
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: ms(8),
  },
  overlayText: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#fff",
    zIndex: 1,
  },
  textContent: {
    marginTop: vs(4),
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: vs(8),
  },
  dateText: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#1a1a1a",
    marginRight: hs(12),
  },
  heightText: {
    fontSize: ms(12),
    color: "#999",
  },
  entryNotes: {
    fontSize: ms(13),
    color: "#666",
    lineHeight: ms(18),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: vs(50),
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeBtn: {
    fontSize: ms(20),
    color: "#999",
  },
  modalTitle: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  saveBtn: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#4CAF50",
  },
  formContainer: {
    padding: hs(20),
  },
  imageUploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    borderRadius: ms(12),
    paddingVertical: vs(30),
    alignItems: "center",
    marginBottom: vs(20),
  },
  uploadIcon: {
    fontSize: ms(40),
    marginBottom: vs(8),
  },
  uploadText: {
    fontSize: ms(14),
    color: "#999",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: ms(8),
    padding: ms(12),
    fontSize: ms(14),
    textAlignVertical: "top",
  },
})
