import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from "react-native"

const { width } = Dimensions.get("window")
const imageSize = (width - 50) / 3

export default function GalleryTab() {
  const images = [
    require("../../assets/images/dummy/chilli_padi.jpg"),
    require("../../assets/images/dummy/lime.jpeg"),
    require("../../assets/images/dummy/pandan.jpg"),
    require("../../assets/images/dummy/chilli_padi.jpg"),
    require("../../assets/images/dummy/lime.jpeg"),
    require("../../assets/images/dummy/pandan.jpg"),
  ]

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.gallery}>
          {images.map((image, idx) => (
            <TouchableOpacity key={idx} style={styles.imageContainer}>
              <Image source={image} style={styles.image} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
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
    borderRadius: 8,
  },
})
