"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { useState, useEffect } from "react"
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, type ImageSourcePropType } from "react-native"
import ImageViewing from "react-native-image-viewing"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export type JournalEntry = {
  id: string
  plantName?: string
  date: string
  height?: string
  notes: string
  images: ImageSourcePropType[]
}

type JournalCardProps = {
  entry: JournalEntry
  onImagePress?: (images: ImageSourcePropType[], startIndex: number) => void
  showPlantName?: boolean
}

export default function JournalCard({ entry, onImagePress, showPlantName = false }: JournalCardProps) {
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [currentEntryImages, setCurrentEntryImages] = useState<ImageSourcePropType[]>([])

  const openImageViewer = (images: ImageSourcePropType[], startIndex: number) => {
    if (onImagePress) {
      onImagePress(images, startIndex)
    } else {
      setCurrentEntryImages(images)
      setImageViewerIndex(startIndex)
      setImageViewerVisible(true)
    }
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
    <>
      <View style={styles.entryCard}>
        {/* Plant Name (optional) */}
        {showPlantName && entry.plantName && (
          <Text style={styles.plantName}>{entry.plantName}</Text>
        )}

        {/* Images Section */}
        <View style={styles.imagesContainer}>
          {imageLayout}
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{entry.date}</Text>
            {entry.height && <Text style={styles.heightText}>{entry.height}</Text>}
          </View>
          <Text style={styles.entryNotes}>{entry.notes}</Text>
        </View>
      </View>

      {/* Image Viewer (only if onImagePress is not provided) */}
      {!onImagePress && (
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
      )}
    </>
  )
}

const styles = StyleSheet.create({
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: ms(12),
    marginBottom: vs(20),
    marginHorizontal: hs(10),
    padding: ms(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
    elevation: 3,
  },
  plantName: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(12),
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
})





