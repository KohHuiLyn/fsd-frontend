"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"

export default function ToDoTab() {
  const [tasks, setTasks] = useState({
    Anytime: [
      {
        id: "1",
        label: "Fertilise",
        completed: false,
        status: "Overdue by 2 days",
        hasReminder: true,
      },
    ],
    Morning: [{ id: "2", label: "Water", completed: true, status: null, hasReminder: true }],
    Night: [{ id: "3", label: "Water", completed: true, status: null, hasReminder: true }],
  })

  const toggleTask = (section, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    }))
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.todayLabel}>Today</Text>

        {Object.entries(tasks).map(([section, sectionTasks]) => (
          <View key={section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section}</Text>

            {sectionTasks.map((task) => (
              <View key={task.id} style={[styles.taskCard, task.completed && styles.taskCompleted]}>
                <TouchableOpacity style={styles.checkbox} onPress={() => toggleTask(section, task.id)}>
                  {task.completed ? (
                    <Text style={styles.checkboxChecked}>✓</Text>
                  ) : (
                    <View style={styles.checkboxEmpty} />
                  )}
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text style={[styles.taskLabel, task.completed && styles.taskLabelCompleted]}>{task.label}</Text>
                  {task.status && <Text style={styles.taskStatus}>{task.status}</Text>}
                </View>

                {task.hasReminder && <Text style={styles.reminderIcon}>🔔</Text>}
              </View>
            ))}
          </View>
        ))}

        {/* Historical dates */}
        <Text style={[styles.todayLabel, { marginTop: 25 }]}>29 Oct</Text>
        <View style={styles.section}>
          <View style={styles.taskCard}>
            <TouchableOpacity style={styles.checkbox}>
              <View style={styles.checkboxEmpty} />
            </TouchableOpacity>
            <View style={styles.taskInfo}>
              <Text style={styles.taskLabel}>Fertilise</Text>
              <Text style={styles.taskStatusMissed}>Missed</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  todayLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#faf8f3",
    borderRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#c9a583",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  checkboxChecked: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  taskInfo: {
    flex: 1,
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  taskLabelCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskStatus: {
    fontSize: 11,
    color: "#d32f2f",
    fontWeight: "500",
  },
  taskStatusMissed: {
    fontSize: 11,
    color: "#d32f2f",
    fontWeight: "500",
  },
  reminderIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
})
