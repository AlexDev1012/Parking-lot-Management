import { useState, useEffect } from "react";
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

const rowsPerPage = 37;

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
});

const TableHeader = () => {
  return (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.headerCell]}>No</Text>
      <Text style={[styles.cell, styles.headerCell]}>Plate</Text>
      <Text style={[styles.cell, styles.headerCell]}>Lot</Text>
      <Text style={[styles.cell, styles.headerCell]}>Purchased Date</Text>
      <Text style={[styles.cell, styles.headerCell]}>Total Amount</Text>
      <Text style={[styles.cell, styles.headerCell]}>Processing Fee</Text>
      <Text style={[styles.cell, styles.headerCell, styles.lastCell]}>
        Net Amount
      </Text>
    </View>
  );
};

const PaymentReport = ({ data }: { data: PaymentSessionType[] }) => {
  const [chunks, setChunks] = useState<PaymentSessionType[][]>([]);
  const [totalPurchasedAmount, setTotalPurchasedAmount] = useState<number>(0);
  const [totalProcessingFee, setTotalProcessingFee] = useState<number>(0);

  useEffect(() => {
    const newChunks = [];
    for (let i = 0; i < data.length; i += rowsPerPage) {
      newChunks.push(data.slice(i, i + rowsPerPage));
    }
    setChunks(newChunks);

    let totalPurchasedAmount = 0;
    let totalProcessingFee = 0;
    data.forEach((item) => {
      totalPurchasedAmount += item.chargedAmount;
      totalProcessingFee += item.lot?.payingFee ?? 0;
      setTotalPurchasedAmount(totalPurchasedAmount);
      setTotalProcessingFee(totalProcessingFee);
    });
  }, [data, rowsPerPage]);

  return (
    <Document>
      {chunks.map((chunk, pageIndex) => (
        <Page size="A4" key={pageIndex} style={styles.page}>
          {/* Render the logo only on the first page */}
          {pageIndex === 0 && (
            <View style={styles.logoContainer}>
              <Image style={styles.image} src={logo} />
              <Text style={styles.text}>Payment Report</Text>
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
                <Text style={styles.cell}>
                  {item.purchasedDate && formatTimestamp(item.purchasedDate)}
                </Text>
                <Text style={styles.cell}>${item.chargedAmount}</Text>
                <Text style={styles.cell}>${item.lot?.payingFee}</Text>

                <Text style={styles.cell}>
                  ${item.chargedAmount - (item.lot?.payingFee ?? 0)}
                </Text>
              </View>
            ))}
            {pageIndex === chunks.length - 1 && (
              <View style={styles.row}>
                <Text style={styles.cell}>Total </Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}>
                  ${totalPurchasedAmount.toFixed(2)}
                </Text>
                <Text style={styles.cell}>${totalProcessingFee}</Text>
                <Text style={styles.cell}>
                  ${(totalPurchasedAmount - totalProcessingFee).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default PaymentReport;
