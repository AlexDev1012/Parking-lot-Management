import { useState, useEffect } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../../newLogo.png";
import { LprSessionType } from "../../types";
import { formatTimestamp } from "../../utils";

const rowsPerPage = 33;

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    padding: 24,
  },
  text: {
    textAlign: "center",
  },
  dateText: {
    marginTop: "8px",
    fontSize: "8px",
    wordSpacing: ".1rem",
  },
  logoContainer: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "65%",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    margin: 10,
    borderWidth: 1,
    borderColor: "#000",
    width: "95%",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  cell: {
    flex: 1,
    padding: 5,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 6,
  },
  headerCell: {
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
  },
  lastCell: {
    borderRightWidth: 0, // Remove the right border for the last cell
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  normalCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 8,
    textAlign: "center",
  },
  noCell: {
    flex: 0.5,
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 8,
    textAlign: "center",
  },
  cameraCell: {
    flex: 1.5,
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 8,
    textAlign: "center",
  },
  timeCell: {
    flex: 1.5,
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    fontSize: 8,
    textAlign: "center",
  },
});

const TableHeader = () => {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.noCell}>No</Text>
      <Text style={styles.normalCell}>Lot</Text>
      <Text style={styles.normalCell}>Plate</Text>
      <Text style={styles.timeCell}>Entry Time</Text>
      <Text style={styles.timeCell}>Exit Time</Text>
    </View>
  );
};

const TableRow = ({ item, index }: { item: LprSessionType; index: number }) => (
  <View style={styles.row}>
    <Text style={styles.noCell}>{index + 1}</Text>
    <Text style={styles.normalCell}>{item.lot?.siteCode}</Text>
    <Text style={styles.normalCell}>{item.plateNumber}</Text>
    <Text style={styles.timeCell}>
      {item.entryTime && formatTimestamp(item.entryTime)}
    </Text>
    <Text style={styles.timeCell}>
      {item.exitTime && formatTimestamp(item.exitTime)}
    </Text>
  </View>
);

const ErrorReport = ({ data }: { data: LprSessionType[] }) => {
  const [chunks, setChunks] = useState<LprSessionType[][]>([]);

  useEffect(() => {
    const newChunks = [];
    for (let i = 0; i < data.length; i += rowsPerPage) {
      newChunks.push(data.slice(i, i + rowsPerPage));
    }
    setChunks(newChunks);
  }, [data]);

  return (
    <Document>
      {chunks.map((chunk, pageIndex) => (
        <Page size="A4" key={pageIndex} style={styles.page}>
          {pageIndex === 0 && (
            <View style={styles.logoContainer}>
              <Image style={styles.image} src={logo} />
              <Text style={styles.text}>Error Report</Text>
            </View>
          )}

          <View style={styles.table}>
            <TableHeader />
            {chunk.map((item, index) => (
              <TableRow
                key={index}
                item={item}
                index={index + pageIndex * rowsPerPage}
              />
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default ErrorReport;
