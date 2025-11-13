"use client"

import Template from "@/components/Template"
import { getProxies, type ProxyContact } from "@/services/proxyService"
import { horizontalScale as hs, moderateScale as ms, verticalScale as vs } from "@/utils/scale"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

function parseProxyDate(value?: string | null): Date | null {
  if (!value) {
    return null
  }
  const normalized = value.replace(" ", "T")
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatProxyDateRange(start?: string | null, end?: string | null): string | null {
  const startDate = parseProxyDate(start)
  const endDate = parseProxyDate(end)

  if (!startDate && !endDate) {
    return null
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  const format = (date: Date | null) => {
    if (!date) {
      return ""
    }
    return `${dateFormatter.format(date)} • ${timeFormatter.format(date)}`
  }

  if (startDate && endDate) {
    return `${format(startDate)} → ${format(endDate)}`
  }

  if (startDate) {
    return `Starts ${format(startDate)}`
  }

  return `Ends ${format(endDate)}`
}

export default function ProxyGardener() {
  const router = useRouter()
  const [proxies, setProxies] = useState<ProxyContact[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const sortedProxies = useMemo(() => {
    return [...proxies].sort((a, b) => a.name.localeCompare(b.name))
  }, [proxies])

  const loadProxies = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (options?.refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const data = await getProxies()
        setProxies(data ?? [])
        setError(null)
      } catch (err: any) {
        console.error("Failed to load proxies:", err)
        if (typeof err?.message === "string" && err.message.toLowerCase().includes("notfound")) {
          setProxies([])
          setError(null)
        } else {
          setError(err?.message ?? "Unable to load proxies")
        }
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    []
  )

  useFocusEffect(
    useCallback(() => {
      loadProxies()
    }, [loadProxies])
  )

  return (
    <Template title="Proxy Gardener" backgroundColor="whitesmoke" onPressBack={() => router.back()}>
      <View style={styles.wrapper}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadProxies({ refresh: true })}
              tintColor="#4CAF50"
            />
          }
        >
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>My Proxies</Text>
            <Text style={styles.introDescription}>
              Going away for a while? Add a Proxy Gardener that will be caring for your plants. Plant
              reminders will be sent to them during the selected period.
            </Text>
          </View>

          {isLoading && proxies.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : null}

          {!isLoading && sortedProxies.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={40} color="#B0B0B0" />
              <Text style={styles.emptyStateTitle}>No proxies yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add a trusted contact so we can send them plant reminders while you’re away.
              </Text>
            </View>
          ) : null}

          <View style={styles.listContainer}>
            {sortedProxies.map((proxy) => {
              const dateRange = formatProxyDateRange(proxy.startDate, proxy.endDate)

              return (
                <TouchableOpacity
                  key={proxy.id}
                  style={styles.proxyCard}
                  onPress={() =>
                    router.push({
                      pathname: "/proxyGardener/[id]",
                      params: {
                        id: proxy.id,
                      },
                    })
                  }
                >
                  <View style={styles.proxyInfo}>
                    <Text style={styles.proxyName}>{proxy.name}</Text>
                    {proxy.phoneNumber ? <Text style={styles.proxyContact}>{proxy.phoneNumber}</Text> : null}
                    {dateRange ? <Text style={styles.proxySchedule}>{dateRange}</Text> : null}
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#B0B0B0" />
                </TouchableOpacity>
              )
            })}
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
    backgroundColor: "whitesmoke",
  },
  contentContainer: {

       flexGrow: 1,         // 👈 ensures it fills the whole screen
       paddingBottom: vs(120),
       gap: vs(16),
       justifyContent: "flex-start", // optional, to align items at top
  },
  introCard: {
    backgroundColor: "#fff",
    borderRadius: ms(18),
    paddingHorizontal: hs(18),
    paddingVertical: vs(18),
    marginVertical: vs(10)
  },
  introTitle: {
    fontSize: ms(16),
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
    flex: 1,
    paddingRight: hs(12),
  },
  proxyName: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  proxyContact: {
    fontSize: ms(13),
    color: "#4CAF50",
    fontWeight: "600",
  },
  proxySchedule: {
    fontSize: ms(12),
    color: "#6F6F6F",
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
  loadingContainer: {
    paddingVertical: vs(60),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: ms(18),
    paddingHorizontal: hs(18),
    paddingVertical: vs(30),
    alignItems: "center",
    gap: vs(10),
  },
  emptyStateTitle: {
    fontSize: ms(16),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  emptyStateSubtitle: {
    fontSize: ms(13),
    color: "#6F6F6F",
    textAlign: "center",
  },
  errorText: {
    marginTop: vs(10),
    paddingHorizontal: hs(20),
    fontSize: ms(12),
    color: "#D32F2F",
  },
})

