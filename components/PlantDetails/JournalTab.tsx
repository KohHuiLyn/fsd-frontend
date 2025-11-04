"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput } from "react-native"

export default function JournalTab() {
  const [entries, setEntries] = useState([
    {
      id: "1",
      date: "31 Oct",
      height: "55cm",
      notes: "every few days need to harvest and water , and then should be okay air",
      images: [require("../../assets/images/dummy/chilli_padi.jpg")],
    },
    {
      id: "2",
      date: "28 Oct",
      height: "55cm",
      notes: "every few days need to harvest and water , and then should be okay air",
      images: [require("../../assets/images/dummy/chilli_padi.jpg")],
    },
  ])

  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newEntry, setNewEntry] = useState("")

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryDate}>
              <Text style={styles.dateText}>{entry.date}</Text>
              <Text style={styles.heightText}>{entry.height}</Text>
            </View>

            <View style={styles.entryImages}>
              {entry.images.map((img, idx) => (
                <Image key={idx} source={img} style={styles.entryImage} />
              ))}
              {entry.images.length < 2 && <View style={[styles.entryImage, styles.imagePlaceholder]} />}
            </View>

            <Text style={styles.entryNotes}>{entry.notes}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowNewEntry(true)}>
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>

      {/* New Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNewEntry}
        onRequestClose={() => setShowNewEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNewEntry(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Entry</Text>
              <TouchableOpacity>
                <Text style={styles.saveBtn}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <TouchableOpacity style={styles.imageUploadBox}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Add Photos</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.noteInput}
                placeholder="Write your journal entry..."
                multiline
                numberOfLines={5}
                value={newEntry}
                onChangeText={setNewEntry}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  entryCard: {
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  entryDate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  heightText: {
    fontSize: 12,
    color: "#999",
  },
  entryImages: {
    flexDirection: "row",
    marginBottom: 12,
  },
  entryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  imagePlaceholder: {
    backgroundColor: "#f0f0f0",
  },
  entryNotes: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fabIcon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeBtn: {
    fontSize: 20,
    color: "#999",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  saveBtn: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  formContainer: {
    padding: 20,
  },
  imageUploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: "#999",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
})
