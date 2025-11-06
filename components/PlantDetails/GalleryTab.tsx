import { moderateScale } from "@/utils/scale"
import { useEffect, useState } from "react"
import { Dimensions, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, type ImageSourcePropType } from "react-native"
import ImageViewing from "react-native-image-viewing"

const { width } = Dimensions.get("window")
const imageSize = (width - 50) / 3

export default function GalleryTab() {
  const images: ImageSourcePropType[] = [
    require("../../assets/images/dummy/chilli_padi.jpg"),
    require("../../assets/images/dummy/lime.jpeg"),
    require("../../assets/images/dummy/pandan.jpg"),
    require("../../assets/images/dummy/chilli_padi.jpg"),
    require("../../assets/images/dummy/lime.jpeg"),
    require("../../assets/images/dummy/pandan.jpg"),
  ]

  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)

  const openImageViewer = (index: number) => {
    setImageViewerIndex(index)
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
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.gallery}>
            {images.map((image, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.imageContainer}
                onPress={() => openImageViewer(idx)}
                activeOpacity={0.9}
              >
                <Image source={image} style={styles.image} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Image Viewer */}
      <ImageViewing
        images={images.map(img => {
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
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    // paddingVertical: 10,
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageContainer: {
    marginBottom: 10,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: moderateScale(8),
  },
})
