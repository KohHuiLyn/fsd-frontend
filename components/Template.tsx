import { horizontalScale as hs, scaleFont, verticalScale as vs } from "@/utils/scale"
import { Ionicons } from "@expo/vector-icons"
import React, { useRef } from "react"
import { Animated, Image, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type TemplateProps = {
	title?: string
	image?: ImageSourcePropType
	imageHeader?: boolean
	onPressBack?: () => void
	onPressSettings?: () => void
	children?: React.ReactNode
}

export default function Template({ title, image, imageHeader, onPressBack, onPressSettings, children }: TemplateProps) {
  const insets = useSafeAreaInsets()

  if (imageHeader) {
    const HEADER_EXPANDED_HEIGHT = vs(280)
    const HEADER_COLLAPSED_HEIGHT = vs(56) + insets.top
    const scrollY = useRef(new Animated.Value(0)).current

    const headerHeight = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
      extrapolate: "clamp",
    })

    const titleOpacity = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT - 24, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [0, 0, 1],
      extrapolate: "clamp",
    })

    const imageOpacity = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT - 24, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [1, 0.4, 0],
      extrapolate: "clamp",
    })

    // animated values for icon color/background transitions
    const iconBgOpacity = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [1, 0],
      extrapolate: "clamp",
    })

    const whiteIconOpacity = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT - 12, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [1, 0.2, 0],
      extrapolate: "clamp",
    })

    const blackIconOpacity = scrollY.interpolate({
      inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT - 12, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    })

    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}> 
          {image ? (
            <Animated.Image source={image} resizeMode="cover" style={[styles.headerImageAbsolute, { opacity: imageOpacity }]} />
          ) : null}
          <View style={[styles.topControls, { paddingTop: insets.top + vs(8) }]}>
            <View style={styles.iconContainer}>
              <Animated.View style={[styles.iconButton, { opacity: iconBgOpacity }]} />
              <View style={styles.iconSlot}>
                <Animated.View style={[styles.iconOverlay, { opacity: whiteIconOpacity }]}>
                  <Ionicons name="chevron-back" size={24} color="#fff" onPress={onPressBack} />
                </Animated.View>
                <Animated.View style={[styles.iconOverlay, { opacity: blackIconOpacity }]}>
                  <Ionicons name="chevron-back" size={24} color="#000" onPress={onPressBack} />
                </Animated.View>
              </View>
            </View>

            <View style={styles.iconContainer}>
              <Animated.View style={[styles.iconButton, { opacity: iconBgOpacity }]} />
              <View style={styles.iconSlot}>
                <Animated.View style={[styles.iconOverlay, { opacity: whiteIconOpacity }]}>
                  <Ionicons name="settings-outline" size={24} color="#fff" onPress={onPressSettings} />
                </Animated.View>
                <Animated.View style={[styles.iconOverlay, { opacity: blackIconOpacity }]}>
                  <Ionicons name="settings-outline" size={24} color="#000" onPress={onPressSettings} />
                </Animated.View>
              </View>
            </View>
          </View>
          <Animated.View style={[styles.compactTitleBar, { opacity: titleOpacity }]}> 
            {title ? <Text style={styles.compactTitle}>{title}</Text> : null}
          </Animated.View>
        </Animated.View>
        <Animated.ScrollView
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: HEADER_EXPANDED_HEIGHT, paddingBottom: vs(24) }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
        </Animated.ScrollView>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        {image ? (
          <Image source={image} style={styles.headerImage} resizeMode="cover" />
        ) : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFont(24),
    fontWeight: "700",
    alignSelf:'center',
    margin:'auto',
    
  },
  headerContainer: {
    backgroundColor: "#fff",
    marginBottom: 12,
    alignContent:'center',
  },
  headerImage: {
    width: "100%",
    height: vs(220),
  },
  // Animated header styles
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    backgroundColor: "#fff",
    zIndex: 2,
  },
  headerImageAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(16),
  },
  iconContainer: {
    position: "relative",
    width: hs(40),
    height: hs(40),
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: scaleFont(20),
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: 16,
  },
  iconSlot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  iconOverlay: {
    position: "absolute",
  },
  compactTitleBar: {
    position: "absolute",
    left: hs(16),
    right: hs(16),
    bottom: vs(12),
    alignSelf:'center',
    alignContent:'center',
    margin:'auto'
  },
  compactTitle: {
    fontSize: scaleFont(22),
    fontWeight: "700",
    color: "black",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    alignSelf:'center'
  },
  content: {
    padding: hs(20),
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: hs(20),
    borderRadius: hs(20),
  },
  
})
