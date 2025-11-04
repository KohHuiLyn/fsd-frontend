import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"

export default function AnalyticsTab() {
  const data = {
    labels: ["Oct 1", "Oct 8", "Oct 15", "Oct 22", "Oct 29", "Nov 5"],
    datasets: [
      {
        data: [2, 3.5, 4, 5, 6.5, 7.2],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#4CAF50",
    },
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.metricLabel}>Height</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={data}
            width={Dimensions.get("window").width - 40}
            height={250}
            chartConfig={chartConfig}
            bezier
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current Height</Text>
            <Text style={styles.statValue}>7.2 cm</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Growth This Month</Text>
            <Text style={styles.statValue}>+2.5 cm</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Average Growth</Text>
            <Text style={styles.statValue}>+0.5 cm/week</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  chartContainer: {
    marginLeft: -20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
})
