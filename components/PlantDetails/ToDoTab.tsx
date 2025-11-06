"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function ToDoTab() {
  const [tasks, setTasks] = useState({
    Anytime: [
      {
        id: "1",
        label: "Fertilise",
        completed: false,
        status: "Overdue by 2 days",
        hasReminder: true,
        isSnoozed: true,
      },
    ],
    Morning: [{ 
      id: "2", 
      label: "Water", 
      completed: true, 
      status: null, 
      hasReminder: true,
      isSnoozed: false,
    }],
    Night: [{ 
      id: "3", 
      label: "Water", 
      completed: true, 
      status: null, 
      hasReminder: true,
      isSnoozed: false,
    }],
  })

  const toggleTask = (section: keyof typeof tasks, taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task: any) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    }))
  }

  const toggleSnooze = (section: keyof typeof tasks, taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task: any) => (task.id === taskId ? { ...task, isSnoozed: !task.isSnoozed } : task)),
    }))
  }

  const getTaskIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "water":
        return "water"
      case "fertilise":
      case "fertilize":
        return "flower"
      case "mist":
        return "water"
      default:
        return "leaf"
    }
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
                {/* Task Icon in Black Circle */}
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons 
                    name={getTaskIcon(task.label) as any} 
                    size={ms(20)} 
                    color="#fff" 
                  />
                </View>

                {/* Task Info */}
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskLabel, task.completed && styles.taskLabelCompleted]}>
                    {task.label}
                  </Text>
                  {task.status && <Text style={styles.taskStatus}>{task.status}</Text>}
                </View>

                {/* Notification Bell */}
                {task.hasReminder && (
                  <TouchableOpacity 
                    onPress={() => toggleSnooze(section as keyof typeof tasks, task.id)}
                    style={styles.bellContainer}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name="bell" 
                      size={ms(20)} 
                      color="#1a1a1a" 
                    />
                    {task.isSnoozed && (
                      <View style={styles.snoozeOverlay}>
                        <Text style={styles.snoozeText}>Zz</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}

                {/* Completion Checkbox */}
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => toggleTask(section as keyof typeof tasks, task.id)}
                  activeOpacity={0.7}
                >
                  {task.completed ? (
                    <View style={styles.checkboxChecked}>
                      <MaterialCommunityIcons name="check" size={ms(16)} color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.checkboxEmpty} />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {/* Historical dates */}
        <Text style={[styles.todayLabel, { marginTop: vs(25) }]}>29 Oct</Text>
        <View style={styles.section}>
          <View style={styles.taskCard}>
            {/* Task Icon in Black Circle */}
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons 
                name="flower" 
                size={ms(20)} 
                color="#fff" 
              />
            </View>

            {/* Task Info */}
            <View style={styles.taskInfo}>
              <Text style={styles.taskLabel}>Fertilise</Text>
              <Text style={styles.taskStatusMissed}>Missed</Text>
            </View>

            {/* Completion Checkbox */}
            <TouchableOpacity style={styles.checkbox}>
              <View style={styles.checkboxEmpty} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: vs(20),
  },
  todayLabel: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(12),
  },
  section: {
    marginBottom: vs(20),
    backgroundColor: "#faf8f3",
    borderRadius: ms(8),
    padding: ms(12),
  },
  sectionTitle: {
    fontSize: ms(12),
    fontWeight: "600",
    color: "#c9a583",
    marginBottom: vs(12),
    textTransform: "uppercase",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vs(12),
    paddingHorizontal: hs(8),
    marginBottom: vs(8),
    backgroundColor: "#fff",
    borderRadius: ms(8),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.05,
    shadowRadius: ms(2),
  },
  taskCompleted: {
    opacity: 0.6,
  },
  iconCircle: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(22),
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: hs(12),
  },
  taskInfo: {
    flex: 1,
  },
  taskLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(3),
  },
  taskLabelCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskStatus: {
    fontSize: ms(11),
    color: "#d32f2f",
    fontWeight: "500",
  },
  taskStatusMissed: {
    fontSize: ms(11),
    color: "#d32f2f",
    fontWeight: "500",
  },
  bellContainer: {
    position: "relative",
    marginRight: hs(12),
    padding: ms(4),
  },
  snoozeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: ms(4),
    justifyContent: "center",
    alignItems: "center",
  },
  snoozeText: {
    fontSize: ms(8),
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  checkbox: {
    width: hs(20),
    height: hs(20),
    borderRadius: ms(120),
    borderWidth: 1,
    borderColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxEmpty: {
    width: hs(20),
    height: hs(20),
    borderRadius: ms(10),
    borderWidth: 2,
    borderColor: "#8C8C8C",
  },
  checkboxChecked: {
    width: hs(20),
    height: hs(20),
    borderRadius: ms(12),
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
  },
})
