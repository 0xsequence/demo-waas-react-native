import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  demoItemContainer: {
    backgroundColor: "#1A1A1A",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  demoItemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  demoItemTitleSecondary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    opacity: 0.5,
  },
  demoItemText: {
    color: "#fff",
    fontSize: 14,
  },
  demoItemTextSecondary: {
    color: "#fff",
    opacity: 0.5,
  },
  emailAuthContainer: {
    position: "absolute",
    zIndex: 100,
    top: -100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
