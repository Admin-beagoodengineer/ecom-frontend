import { CSSProperties } from "react";

const MaintenancePage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>The site is under maintenance.</h1>
        <p style={styles.message}>
          Please contact the administrator for more information.
        </p>
        <p style={styles.button}>Contact No: 8169893578</p>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f7f7f7",
    margin: 0,
  },
  card: {
    maxWidth: "400px",
    width: "100%",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    color: "#e63946",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  message: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "24px",
  },
};

export default MaintenancePage;
