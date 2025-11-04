import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import logo from "../../assets/images/logo.png"
import chilliPadi from "../../assets/images/dummy/chilli_padi.jpg"
import lime from "../../assets/images/dummy/lime.jpeg"
import pandan from "../../assets/images/dummy/pandan.jpg"
import plantDoctor from "../../assets/images/plant_doctor.png"
import monsterra from "../../assets/images/monsterra.png"
import snakeplant from "../../assets/images/snakeplant.png"
import { useRouter } from "expo-router"

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
      contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
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
            <TouchableOpacity key={plant.id} style={styles.popularCard} activeOpacity={0.9}>
              <Image source={plant.image} style={styles.popularImage} />
              <Text style={styles.popularName}>{plant.name}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 25,
  },
  logoImage: {
    width: 140,
    height: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  viewAll: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  popularScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  popularCard: {
    width: 160,
    height: 200,
    marginRight: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularImage: {
    width: 100,
    height: 120,
    resizeMode: "contain",
    marginBottom: 8,
  },
  popularName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  doctorWrapper: {
    marginBottom: 30,
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
    height: 150,
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
    padding: 16,
  },
  doctorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  doctorDesc: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    marginBottom: 12,
  },
  diagnosisBtn: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  myPlantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  myPlantImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  myPlantDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  myPlantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  reminderImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  reminderDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
})
