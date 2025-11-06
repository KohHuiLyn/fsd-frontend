"use client"

import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type FilterType = "All" | "Water" | "Fertilise" | "Mist"

type Reminder = {
  id: string
  type: "Water" | "Fertilise" | "Mist"
  plantCount: number
  plants: string[]
  time: string
}

type DateItem = {
  date: Date
  isSelected: boolean
}

export default function Reminders() {
  const insets = useSafeAreaInsets()
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All")
  const [selectedDate, setSelectedDate] = useState<number>(2) // Index 2 = May 25
  const [expandedReminders, setExpandedReminders] = useState<Set<string>>(new Set())

  // Generate date items for the week (May 23-27)
  const today = new Date(2024, 4, 25) // May 25, 2024 (month is 0-indexed)
  const dates: DateItem[] = []
  for (let i = -2; i <= 2; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push({
      date,
      isSelected: i === 0,
    })
  }

  const reminders: Reminder[] = [
    {
      id: "1",
      type: "Water",
      plantCount: 10,
      plants: ["Chilli Padi", "Lime", "Pandan", "Mandarin Orange", "Banana", "Mango"],
      time: "10:00 AM",
    },
    {
      id: "2",
      type: "Fertilise",
      plantCount: 1,
      plants: ["Chilli Padi"],
      time: "12:00 PM",
    },
  ]

  const formatDate = (date: Date) => {
    const month = date.toLocaleString("default", { month: "short" })
    const day = date.getDate()
    const weekday = date.toLocaleString("default", { weekday: "short" })
    return { month, day, weekday }
  }

  const filteredReminders = reminders.filter(
    (reminder) => selectedFilter === "All" || reminder.type === selectedFilter
  )

  const getIconName = (type: string) => {
    switch (type) {
      case "Water":
        return "water"
      case "Fertilise":
        return "flower"
      case "Mist":
        return "water"
      default:
        return "leaf"
    }
  }

  const toggleExpand = (reminderId: string) => {
    setExpandedReminders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(reminderId)) {
        newSet.delete(reminderId)
      } else {
        newSet.add(reminderId)
      }
      return newSet
    })
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reminders</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSelector}
        >
        {dates.map((dateItem, index) => {
          const { month, day, weekday } = formatDate(dateItem.date)
          const isSelected = index === selectedDate
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => setSelectedDate(index)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                {month}
              </Text>
              <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                {day}
              </Text>
              <Text style={[styles.dateWeekday, isSelected && styles.dateTextSelected]}>
                {weekday}
              </Text>
            </TouchableOpacity>
          )
        })}
        </ScrollView>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(["All", "Water", "Fertilise", "Mist"] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonSelected,
            ]}
            onPress={() => setSelectedFilter(filter)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextSelected,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reminder List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.reminderList}
      >
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No Tasks found</Text>
          </View>
        ) : (
          filteredReminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <View style={styles.reminderContent}>
              <Text style={styles.plantCount}>
                {reminder.plantCount} {reminder.plantCount === 1 ? "plant" : "plants"}
              </Text>
  
              <Text style={styles.reminderType}>{reminder.type}</Text>
              <View style={styles.plantsList}>
                <View style={styles.plantsRow}>
                  <Text 
                    style={styles.plantsText} 
                    numberOfLines={expandedReminders.has(reminder.id) ? undefined : 1}
                  >
                    {reminder.plants.join(", ")}
                  </Text>
                  {reminder.plants.length > 3 && (
                    <TouchableOpacity onPress={() => toggleExpand(reminder.id)}>
                      <Text style={styles.seeMoreText}>
                        {expandedReminders.has(reminder.id) ? " See less" : " See more"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.timeRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
                <Text style={styles.timeText}>{reminder.time}</Text>
              </View>
            </View>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getIconName(reminder.type) as any}
                size={32}
                color="#4CAF50"
              />
            </View>
          </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(15),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: "#1a1a1a",
  },
  dateSelectorContainer: {
    height: vs(120),
    paddingVertical: vs(10),
  },
  dateSelector: {
    paddingHorizontal: hs(15),
    gap: hs(10),
  },
  dateCard: {
    width: hs(70),
    paddingVertical: vs(12),
    paddingHorizontal: hs(8),
    backgroundColor: "#fff",
    borderRadius: ms(12),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateCardSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dateMonth: {
    fontSize: ms(12),
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  dateDay: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(4),
  },
  dateWeekday: {
    fontSize: ms(11),
    fontWeight: "500",
    color: "#666",
  },
  dateTextSelected: {
    color: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
    gap: hs(10),
  },
  filterButton: {
    paddingHorizontal: hs(16),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#E8F5E9",
  },
  filterButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#4CAF50",
  },
  filterTextSelected: {
    color: "#fff",
  },
  reminderList: {
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
    paddingBottom: vs(100),
  },
  reminderCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.05,
    shadowRadius: ms(3),
    elevation: 2,
  },
  reminderContent: {
    flex: 1,
  },
  plantCount: {
    fontSize: ms(12),
    color: "#999",
    marginBottom: vs(4),
  },
  reminderType: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: vs(8),
  },
  plantsList: {
    marginBottom: vs(12),
  },
  plantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  plantsText: {
    fontSize: ms(13),
    color: "#999",
    flex: 1,
    flexShrink: 1,
  },
  seeMoreText: {
    fontSize: ms(13),
    color: "#4CAF50",
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: hs(6),
  },
  timeText: {
    fontSize: ms(12),
    color: "#999",
  },
  iconContainer: {
    position:'absolute',
    top: vs(15),
    right: hs(15),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(60),
  },
  emptyStateText: {
    fontSize: ms(16),
    color: "#999",
    fontWeight: "500",
  },
})
