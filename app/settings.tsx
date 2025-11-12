"use client"

import { useAuth } from "@/contexts/AuthContext"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function Settings() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout()
            router.replace("/login")
          } catch {
            Alert.alert("Error", "Failed to logout")
          }
        }
      }
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // TODO: Add your account deletion logic here
            Alert.alert("Deleted", "Your account has been deleted.")
            router.replace("/login")
          } catch {
            Alert.alert("Error", "Failed to delete account")
          }
        }
      }
    ])
  }

  return (
    <View style={styles.container}>


      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={() => router.push("/proxyGardener")}        >
          <Text style={styles.optionText}>Proxy Gardener</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option, styles.dangerOption]} onPress={handleDeleteAccount}>
          <Text style={[styles.optionText, { color: "#E53935" }]}>Delete Account</Text>
          <MaterialCommunityIcons name="delete" size={22} color="#E53935" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={styles.optionText}>Logout</Text>
          <MaterialCommunityIcons name="logout" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: hs(20),
    paddingTop: vs(60),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vs(20),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  optionsContainer: {
    marginTop: vs(10),
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: ms(16),
    color: "#1a1a1a",
    fontWeight: "500",
  },
  dangerOption: {
    borderBottomColor: "#fdd",
  },
})
