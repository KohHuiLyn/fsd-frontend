"use client"

import Template from "@/components/Template"
import { useAuth } from "@/contexts/AuthContext"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
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
        },
      },
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
            // TODO: implement account deletion
            Alert.alert("Deleted", "Your account has been deleted.")
            router.replace("/login")
          } catch {
            Alert.alert("Error", "Failed to delete account")
          }
        },
      },
    ])
  }

  return (
    <Template
      title="Settings"
      onPressBack={() => router.back()}
    >
      <View style={styles.wrapper}>

        {/* ⚙️ Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Proxy</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => router.push("/proxyGardener")}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="account-group" size={22} color="#1a1a1a" />
              <View>
                <Text style={styles.optionText}>Proxy Gardener</Text>
                <Text style={styles.optionSub}>Manage your delegated garden helpers</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#ccc" />
          </TouchableOpacity>


          <Text style={[styles.sectionLabel, { marginTop: vs(10) }]}>Account</Text>
          {/* <TouchableOpacity
            style={styles.option}
            onPress={handleDeleteAccount}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="delete-outline" size={22} color="#E53935" />
              <Text style={[styles.optionText, { color: "#E53935" }]}>Delete Account</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#E53935" />
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons name="logout" size={22} color="#1a1a1a" />
              <Text style={styles.optionText}>Logout</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>
    </Template>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: hs(16),
    paddingTop: vs(8),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: hs(12),
    paddingVertical: vs(10),
    marginVertical: vs(10),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(15),
    color: "#333",
    marginLeft: hs(8),
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: vs(6),
    paddingHorizontal: hs(6),
    marginBottom: vs(16),
  },
  sectionLabel: {
    fontSize: ms(13),
    fontWeight: "600",
    color: "#666",
    marginBottom: vs(6),
    paddingHorizontal: hs(6),
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionText: {
    fontSize: ms(16),
    fontWeight: "500",
    color: "#1a1a1a",
  },
  optionSub: {
    fontSize: ms(12),
    color: "#888",
  },
})
