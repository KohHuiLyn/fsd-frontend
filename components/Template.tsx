import React from "react"
import { View, Text, Image, StyleSheet } from "react-native"
import { DetailsHeaderScrollView, TabbedHeaderPager } from "react-native-sticky-parallax-header"
export default function Template({ title, image, children }) {
  return (
    <TabbedHeaderPager
      headerType="AvatarHeader" // or "TabbedHeader" if you want tabs
      title={title}
      image={image}
      parallaxHeight={280}
      backgroundColor="#fff"
      titleStyle={styles.title}
      hasBorderRadius={true}
      leftTopIcon={{ name: "arrow-back", color: "#fff", type: "ionicon" }}
      rightTopIcon={{ name: "settings-outline", color: "#fff", type: "ionicon" }}
      contentContainerStyle={{ backgroundColor: "#fff" }}
    >
      <View style={styles.content}>
        {children}
      </View>
    </TabbedHeaderPager>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  content: {
    padding: 20,
  },
})
