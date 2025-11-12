"use client"

import Template from "@/components/Template"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function AddProxyGardener() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [contact, setContact] = useState("")

  const handleSubmit = () => {
    if (!name || !startDate || !endDate || !contact) {
      Alert.alert("Missing details", "Please fill in all proxy gardener details.")
      return
    }
    Alert.alert("Proxy added", `${name} will be notified about plant reminders.`, [
      { text: "Back to list", onPress: () => router.back() },
    ])
  }

  return (
    <Template title="Add Proxy Gardener" onPressBack={() => router.back()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrapper}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proxy details</Text>
            <Text style={styles.sectionSubtitle}>
              Share reminders with a trusted person while you’re away.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Helper"
                style={styles.input}
                placeholderTextColor="#A7A7A7"
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>Start date</Text>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="22/12/2025"
                  style={styles.input}
                  placeholderTextColor="#A7A7A7"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>End date</Text>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="26/12/2025"
                  style={styles.input}
                  placeholderTextColor="#A7A7A7"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact number</Text>
              <TextInput
                value={contact}
                onChangeText={setContact}
                placeholder="81234567"
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#A7A7A7"
              />
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} activeOpacity={0.9}>
          <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Add proxy</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Template>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: hs(20),
    paddingBottom: vs(24),
  },
  contentContainer: {
    paddingBottom: vs(140),
    gap: vs(24),
  },
  section: {
    gap: vs(6),
    marginTop: vs(4),
  },
  sectionTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionSubtitle: {
    fontSize: ms(14),
    color: "#6F6F6F",
    lineHeight: ms(20),
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: ms(18),
    paddingHorizontal: hs(18),
    paddingVertical: vs(18),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.05)",
    gap: vs(18),
  },
  inputGroup: {
    gap: vs(8),
  },
  inputLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  input: {
    backgroundColor: "#F6F8F9",
    borderRadius: ms(14),
    paddingHorizontal: hs(16),
    paddingVertical: vs(14),
    fontSize: ms(15),
    color: "#1A1A1A",
  },
  rowInputs: {
    flexDirection: "row",
    gap: hs(12),
  },
  halfInput: {
    flex: 1,
  },
  primaryButton: {
    marginTop: vs(12),
    backgroundColor: "#4CAF50",
    borderRadius: ms(16),
    paddingVertical: vs(16),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: hs(8),
    shadowColor: "#4CAF50",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#fff",
  },
})

