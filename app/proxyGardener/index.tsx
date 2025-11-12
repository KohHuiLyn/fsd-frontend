"use client"

import Template from "@/components/Template"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type ProxyGardener = {
  id: string
  name: string
  startDate: string
  endDate: string
  contact: string
}

const SAMPLE_PROXIES: ProxyGardener[] = [
  {
    id: "1",
    name: "Helper",
    startDate: "5/12/2025",
    endDate: "13/12/2025",
    contact: "81234567",
  },
  {
    id: "2",
    name: "Helper",
    startDate: "1/1/2026",
    endDate: "5/1/2026",
    contact: "81234567",
  },
  {
    id: "3",
    name: "Wife",
    startDate: "2/2/2026",
    endDate: "13/2/2026",
    contact: "82345678",
  },
]

export default function ProxyGardener() {
  const router = useRouter()

  const proxies = useMemo(() => SAMPLE_PROXIES, [])

  return (
    <Template title="Proxy Gardener" onPressBack={() => router.back()}>
      <View style={styles.wrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>My Proxies</Text>
            <Text style={styles.introDescription}>
              Going away for a while? Add a Proxy Gardener that will be caring for your plants. Plant
              reminders will be sent to them during the selected period.
            </Text>
          </View>

          <View style={styles.listContainer}>
            {proxies.map((proxy) => (
              <TouchableOpacity
                key={proxy.id}
                style={styles.proxyCard}
                onPress={() =>
                  router.push({
                    pathname: "/proxyGardener/[id]",
                    params: {
                      id: proxy.id,
                      name: proxy.name,
                      startDate: proxy.startDate,
                      endDate: proxy.endDate,
                      contact: proxy.contact,
                    },
                  })
                }
              >
                <View style={styles.proxyInfo}>
                  <Text style={styles.proxyName}>{proxy.name}</Text>
                  <Text style={styles.proxyDuration}>
                    {proxy.startDate} – {proxy.endDate}
                  </Text>
                  <Text style={styles.proxyContact}>{proxy.contact}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#B0B0B0" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/proxyGardener/add")}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#fff" />
          <Text style={styles.fabLabel}>Add proxy</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: vs(120),
    gap: vs(16),
  },
  introCard: {
    backgroundColor: "#fff",
    borderRadius: ms(18),
    paddingHorizontal: hs(18),
    paddingVertical: vs(18),
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },
  introTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: vs(8),
  },
  introDescription: {
    fontSize: ms(14),
    lineHeight: ms(20),
    color: "#6F6F6F",
  },
  listContainer: {
    gap: vs(12),
  },
  proxyCard: {
    backgroundColor: "#fff",
    borderRadius: ms(16),
    paddingHorizontal: hs(18),
    paddingVertical: vs(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.05)",
  },
  proxyInfo: {
    gap: vs(4),
  },
  proxyName: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  proxyDuration: {
    fontSize: ms(13),
    color: "#707070",
  },
  proxyContact: {
    fontSize: ms(13),
    color: "#4CAF50",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: vs(24),
    right: hs(20),
    backgroundColor: "#4CAF50",
    borderRadius: ms(30),
    paddingHorizontal: hs(22),
    paddingVertical: vs(14),
    flexDirection: "row",
    alignItems: "center",
    gap: hs(10),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabLabel: {
    fontSize: ms(15),
    fontWeight: "700",
    color: "#fff",
  },
})

