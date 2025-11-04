import { horizontalScale as hs, scaleFont, verticalScale as vs } from "@/utils/scale"
import { useRouter } from "expo-router"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import chilliPadi from "../../assets/images/dummy/chilli_padi.jpg"
import lime from "../../assets/images/dummy/lime.jpeg"
import pandan from "../../assets/images/dummy/pandan.jpg"
import logo from "../../assets/images/logo.png"
import monsterra from "../../assets/images/monsterra.png"
import plantDoctor from "../../assets/images/plant_doctor.png"
import snakeplant from "../../assets/images/snakeplant.png"

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const popularPlants = [
    {
      id: "1",
      name: "Peperomia Houseplant",
      image: monsterra,
    },
    {
      id: "2",
      name: "Asplenium Houseplant",
      image: snakeplant,
    },
  ]

  const myPlants = [
    {
      id: "1",
      name: "Chili Padi",
      date: "23/05/25",
      image: chilliPadi,
    },
    {
      id: "2",
      name: "Pandan Plant",
      date: "23/05/25",
      image: pandan,
    },
    {
      id: "3",
      name: "Lime Plant",
      date: "23/05/25",
      image: lime,
    },
  ]

  const reminders = [
    {
      id: "1",
      title: "Water your Cactus today",
      desc: "It's 2 weeks old, you have to water it twice a week.",
      image: "https://cdn-icons-png.flaticon.com/512/7641/7641727.png",
    },
    {
      id: "2",
      title: "Prune the dead branches of Bamboo",
      desc: "It's been 2–3 weeks since you last pruned it.",
      image: "https://cdn-icons-png.flaticon.com/512/9906/9906372.png",
    },
  ]

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + vs(50) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Popular Plants Section - Enhanced with card styling */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular plants</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
          {popularPlants.map((plant) => (
            <TouchableOpacity key={plant.id} style={styles.popularItem} activeOpacity={0.9}>
              {/* Image floats above the card */}
              <Image source={plant.image} style={styles.popularImage} />
              {/* Card */}
              <View style={styles.popularCard}>
                <Text style={styles.popularName}>{plant.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Plant Doctor */}
      <View style={styles.doctorWrapper}>
        <View style={styles.doctorCard}>
          <View style={styles.doctorImageWrapper}>
            <Image source={plantDoctor} style={styles.doctorImage} resizeMode="contain" />
          </View>
          <View style={styles.doctorContent}>
            <Text style={styles.doctorTitle}>Plant Doctor</Text>
            <Text style={styles.doctorDesc}>
              Upload a photo of your plant and get an AI-powered diagnosis of your plant in seconds!
            </Text>
            <TouchableOpacity>
              <Text style={styles.diagnosisBtn}>Start Diagnosis →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* My Plants */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Plants</Text>
          <TouchableOpacity onPress={() => router.push("/myPlants")}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {myPlants.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.myPlantRow}
            onPress={() => router.push("/plantDetails", { plant: p })}
          >
            <Image source={p.image} style={styles.myPlantImage} />
            <View>
              <Text style={styles.myPlantDate}>Added on {p.date}</Text>
              <Text style={styles.myPlantName}>{p.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reminders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reminders for today</Text>
        </View>

        {reminders.map((r) => (
          <TouchableOpacity key={r.id} style={styles.reminderCard}>
            <Image source={{ uri: r.image }} style={styles.reminderImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>{r.title}</Text>
              <Text style={styles.reminderDesc}>{r.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: hs(20),
    paddingTop: vs(20),
  },
  header: {
    marginVertical: 10,
  },
  logoImage: {
    width: hs(140),
    height: vs(42),
    marginHorizontal:hs(-25)
  },
  section: {
    marginBottom: vs(30),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: "#1a1a1a",
    
    marginBottom: vs(2),
  },
  viewAll: {
    fontSize: scaleFont(14),
    color: "#4CAF50",
    fontWeight: "500",
  },
  popularScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  popularItem: {
    width: hs(160),
    marginRight: hs(16),
    position: "relative",
    paddingTop: vs(50), // space for image that peeks out
  },
  popularCard: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    overflow: "hidden",
    paddingTop: vs(60),
    paddingHorizontal: hs(12),
    paddingBottom: vs(18),
  },
  popularImage: {
    position: "absolute",
    top: vs(12), // peeks from container, not clipped by card radius

    right: -30,
    marginLeft: "auto",
    marginRight: "auto",
    width: hs(145),
    height: hs(145),
    resizeMode: "contain",
    zIndex: 2,
  },
  popularName: {
    fontSize: scaleFont(14),
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "left",
    paddingRight: hs(10),
  },
  doctorWrapper: {
    marginBottom: vs(30),
  },
  doctorCard: {
    backgroundColor: "#1abc9c",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  doctorImageWrapper: {
    height: vs(150),
    justifyContent: "center",
    alignItems: "center",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  doctorContent: {
    backgroundColor: "#e0f7f4",
    padding: hs(16),
  },
  doctorTitle: {
    fontSize: scaleFont(16),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  doctorDesc: {
    fontSize: scaleFont(13),
    color: "#333",
    lineHeight: vs(18),
    marginBottom: 12,
  },
  diagnosisBtn: {
    fontSize: scaleFont(14),
    fontWeight: "700",
    color: "#000",
  },
  myPlantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vs(15),
    paddingBottom: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  myPlantImage: {
    width: hs(60),
    height: hs(60),
    borderRadius: hs(12),
    marginRight: hs(15),
  },
  myPlantDate: {
    fontSize: scaleFont(12),
    color: "#999",
    marginBottom: 4,
  },
  myPlantName: {
    fontSize: scaleFont(15),
    fontWeight: "600",
    color: "#1a1a1a",
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: hs(12),
    borderRadius: 12,
    marginBottom: vs(12),
  },
  reminderImage: {
    width: hs(50),
    height: hs(50),
    borderRadius: hs(10),
    marginRight: hs(12),
  },
  reminderTitle: {
    fontSize: scaleFont(14),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  reminderDesc: {
    fontSize: scaleFont(12),
    color: "#666",
    lineHeight: vs(16),
  },
})
