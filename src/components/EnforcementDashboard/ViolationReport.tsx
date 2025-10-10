import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../../../src/newLogo.png";
import { PaymentSessionType } from "../../types";
import { formatTimestamp } from "../../utils";

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
  title: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  dateRange: {
    marginTop: 5,
    fontSize: 12,
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    textAlign: "center",
  },
});

const TableHeader = () => {
  return (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.headerCell]}>No</Text>
      <Text style={[styles.cell, styles.headerCell]}>Plate</Text>
      <Text style={[styles.cell, styles.headerCell]}>Lot</Text>
      <Text style={[styles.cell, styles.headerCell]}>Notice Number</Text>
      <Text style={[styles.cell, styles.headerCell]}>Violation Time</Text>
      <Text style={[styles.cell, styles.headerCell]}>Purchased Date</Text>
      <Text style={[styles.cell, styles.headerCell, styles.lastCell]}>
        Revenue
      </Text>
    </View>
  );
};

interface ViolationReportProps {
  data: PaymentSessionType[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

const ViolationReport: React.FC<ViolationReportProps> = ({
  data,
  dateRange,
}) => {
  // Early return with a "No Data" message if data is empty
  if (!data || data.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.logoContainer}>
            <Image style={styles.image} src={logo} />
          </View>
          <Text style={styles.title}>Payment Report</Text>
          {dateRange && (
            <Text style={styles.dateRange}>
              {formatTimestamp(dateRange.startDate.toISOString())} ~{" "}
              {formatTimestamp(dateRange.endDate.toISOString())}
            </Text>
          )}
          <View
            style={[styles.table, { minHeight: 100, justifyContent: "center" }]}
          >
            <Text style={{ textAlign: "center", fontSize: 12, color: "#666" }}>
              No violation data found for the selected period
            </Text>
          </View>

          <Text style={styles.footer}>
            Generated on {formatTimestamp(new Date().toISOString())}
          </Text>
        </Page>
      </Document>
    );
  }

  const rowsPerPage = 37;
  const chunks = [];
  for (let i = 0; i < data.length; i += rowsPerPage) {
    chunks.push(data.slice(i, i + rowsPerPage));
  }

  let totalOwnerCut = 0;

  data.forEach((item) => {
    totalOwnerCut = totalOwnerCut + Math.round(item.chargedAmount);
  });

  return (
    <Document>
      {chunks.map((chunk, pageIndex) => (
        <Page size="A4" key={pageIndex} style={styles.page}>
          {/* Render the logo only on the first page */}
          {pageIndex === 0 && (
            <View style={styles.logoContainer}>
              <Image style={styles.image} src={logo} />
              <Text style={styles.text}>Payment Report</Text>
              {/* <Text style={styles.dateText}>{dates[0].format('YYYY-MM-DD')} ~ {dates[1].format('YYYY-MM-DD')}</Text> */}
            </View>
          )}

          <View style={styles.table}>
            {/* Render the table header on each page */}

            <TableHeader />

            {/* Render rows for the current chunk */}
            {chunk.map((item, index) => (
              <View style={styles.row} key={index}>
                <Text style={styles.cell}>
                  {index + 1 + pageIndex * rowsPerPage}
                </Text>
                <Text style={styles.cell}>{item.plateNumber}</Text>
                <Text style={styles.cell}>{item.lot?.siteCode}</Text>
                <Text style={styles.cell}>{item.lprSession?.noticeNumber}</Text>
                <Text style={styles.cell}>
                  {item.lprSession?.exitTime &&
                    formatTimestamp(item.lprSession?.exitTime)}
                </Text>
                <Text style={styles.cell}>
                  {formatTimestamp(item.purchasedDate)}
                </Text>
                <Text style={styles.cell}>
                  {Math.round(item.chargedAmount)}
                </Text>
              </View>
            ))}
            {pageIndex === chunks.length - 1 && (
              <View style={styles.row}>
                <Text style={styles.cell}>Total: </Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}>{Math.round(totalOwnerCut)}</Text>
              </View>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default ViolationReport;
