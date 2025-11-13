import { horizontalScale as hs, scaleFont, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, type ImageSourcePropType } from "react-native"
import ImageViewing from "react-native-image-viewing"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

type TemplateProps = {
	title?: string
	image?: ImageSourcePropType
	images?: ImageSourcePropType[]
	imageHeader?: boolean
	onPressBack?: () => void
	onPressSettings?: () => void
	children?: React.ReactNode
	backgroundColor?: string
}

export default function Template({ title, image, images, imageHeader, onPressBack, onPressSettings, children, backgroundColor }: TemplateProps) {
  const insets = useSafeAreaInsets()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const imageScrollRef = useRef<ScrollView>(null)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)

  const resolvedBackground = backgroundColor ?? "#fff"

  // Use images array if provided, otherwise fall back to single image
  const imageList = images || (image ? [image] : [])
  const hasMultipleImages = imageList.length > 1

  const openImageViewer = () => {
    setImageViewerVisible(true)
  }

  const handleImageViewerClose = () => {
    setImageViewerVisible(false)
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

  const handleImageScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / SCREEN_WIDTH)
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index)
    }
  }

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
      <View style={{ flex: 1, backgroundColor: resolvedBackground }}>
        <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}> 
          {imageList.length > 0 && (
            hasMultipleImages ? (
              <View style={{ flex: 1 }}>
                <ScrollView
                  ref={imageScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleImageScroll}
                  scrollEventThrottle={16}
                  style={styles.imageScrollView}
                  contentContainerStyle={styles.imageScrollContent}
                >
                  {imageList.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={1}
                      onPress={openImageViewer}
                      style={{ width: SCREEN_WIDTH, height: "100%" }}
                    >
                      <Animated.Image 
                        source={img} 
                        resizeMode="cover" 
                        style={[styles.headerImagePage, { opacity: imageOpacity }]} 
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <TouchableOpacity 
                activeOpacity={1}
                onPress={openImageViewer}
                style={{ flex: 1 }}
              >
                <Animated.Image 
                  source={imageList[0]} 
                  resizeMode="cover" 
                  style={[styles.headerImageAbsolute, { opacity: imageOpacity }]} 
                />
              </TouchableOpacity>
            )
          )}
          
          {/* Floating Controls on Top of Image */}
          <View style={[styles.topControls, { paddingTop: insets.top + vs(8) }]}>
            <View style={styles.iconContainer}>
              <Animated.View style={[styles.iconButton, { opacity: iconBgOpacity }]} />
              <View style={styles.iconSlot}>
                <Animated.View style={[styles.iconOverlay, { opacity: whiteIconOpacity }]}>
                  <TouchableOpacity onPress={onPressBack}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.iconOverlay, { opacity: blackIconOpacity }]}>
                  <TouchableOpacity onPress={onPressBack}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#000" />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            {onPressSettings && (
              <View style={styles.iconContainer}>
                <Animated.View style={[styles.iconButton, { opacity: iconBgOpacity }]} />
                <View style={styles.iconSlot}>
                  <Animated.View style={[styles.iconOverlay, { opacity: whiteIconOpacity }]}>
                    <TouchableOpacity onPress={onPressSettings}>
                      <MaterialCommunityIcons name="cog" size={24} color="#fff" />
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View style={[styles.iconOverlay, { opacity: blackIconOpacity }]}>
                    <TouchableOpacity onPress={onPressSettings}>
                      <MaterialCommunityIcons name="cog" size={24} color="#000" />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            )}
          </View>
          <Animated.View style={[styles.compactTitleBar, { opacity: titleOpacity }]}> 
            {title ? <Text style={styles.compactTitle}>{title}</Text> : null}
          </Animated.View>
          
          {/* Image Carousel Indicators */}
          {hasMultipleImages && (
            <View style={styles.carouselIndicators}>
              {imageList.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setCurrentImageIndex(index)
                    imageScrollRef.current?.scrollTo({
                      x: index * SCREEN_WIDTH,
                      animated: true,
                    })
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.indicator,
                      currentImageIndex === index && styles.indicatorActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
          <Animated.ScrollView
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: HEADER_EXPANDED_HEIGHT, paddingBottom: vs(24) }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
        </Animated.ScrollView>
        
        {/* Image Viewer */}
        <ImageViewing
          images={imageList.map(img => {
            if (typeof img === 'number') {
              const resolved = Image.resolveAssetSource(img)
              return { uri: resolved.uri }
            }
            return { uri: (img as any).uri || '' }
          })}
          imageIndex={currentImageIndex}
          visible={imageViewerVisible}
          onRequestClose={handleImageViewerClose}
          presentationStyle="overFullScreen"
          animationType="fade"
        />
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: resolvedBackground }}
      contentContainerStyle={{
        paddingBottom: vs(24),
        paddingTop: insets.top + vs(0), // 👈 adds safe-area top padding
      }}
      showsVerticalScrollIndicator={false}
    >
      
      <View style={[styles.headerContainer, { paddingTop: insets.top + vs(4) }]}>
  <View style={styles.headerRow}>
    {onPressBack ? (
      <TouchableOpacity onPress={onPressBack} style={styles.backButton}>
        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
      </TouchableOpacity>
    ) : (
      <View style={styles.backButtonPlaceholder} />
    )}

    {title ? <Text style={styles.title}>{title}</Text> : null}

    {onPressSettings ? (
      <TouchableOpacity onPress={onPressSettings} style={styles.settingsButton}>
        <MaterialCommunityIcons name="cog" size={24} color="#000" />
      </TouchableOpacity>
    ) : (
      <View style={styles.backButtonPlaceholder} />
    )}
  </View>
</View>

      <View style={styles.content}>{children}</View>
    </ScrollView>
  )
  
}

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFont(20),
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
  imageScrollView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  imageScrollContent: {
    flexDirection: "row",
  },
  headerImagePage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hs(16),
    zIndex: 10,
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
    fontSize: scaleFont(18),
    fontWeight: "700",
    color: "black",
    alignSelf:'center'
  },
  content: {
    padding: hs(0),
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: hs(20),
    borderRadius: hs(20),
  },
  carouselIndicators: {
    position: "absolute",
    bottom: vs(20),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  indicatorActive: {
    backgroundColor: "#fff",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: hs(16),
    marginBottom: vs(8),
  },
  
  backButton: {
    padding: hs(6),
  },
  
  settingsButton: {
    padding: hs(6),
  },
  
  backButtonPlaceholder: {
    width: hs(28), // keeps title centered if button absent
  },
  
})
