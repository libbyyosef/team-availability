// PubPlus-inspired theme
export const theme = {
  blue:  "#0A66C2",  // primary blue
  yellow:"#FFC107",  // accent yellow
  ink:   "#162647ff",
  ink2:  "#0f172a",
  slate: "#1f2937",
  text:  "#eaf2ff",
  textDim:"#b8c7e6",
};

export const styles: Record<string, React.CSSProperties> = {
  appShell: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.ink2} 60%)`,
  },

  title: {
    color: theme.yellow,
    fontSize: 26,
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 8,
  },

  centerCard: {
    width: "100%",
    maxWidth: 460,
    background: theme.ink,
    border: `1px solid ${theme.slate}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },

  formRow: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },
  label: { color: theme.textDim, fontSize: 14 },

  input: {
    background: "#0a0f1a",
    border: `1px solid ${theme.blue}`,
    outline: `2px solid transparent`,
    borderRadius: 12,
    padding: "12px 14px",
    color: theme.text,
  },

  primaryBtn: {
    width: "100%",
    marginTop: 20,
    padding: "12px 16px",
    background: theme.yellow,
    color: "#1d1d1f",
    border: 0,
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  },

  // Statuses screen bits (kept but recolored)
  dashboardWrap: {
    width: "100%",
    maxWidth: 980,
    background: theme.ink,
    border: `1px solid ${theme.slate}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },
  sectionTitle: { color: theme.yellow, fontSize: 18, marginBottom: 12 },

  select: {
    background: "#0a0f1a",
    border: `1px solid ${theme.blue}`,
    borderRadius: 10,
    color: theme.text,
    padding: "10px 12px",
  },

  filtersRow: {
    marginTop: 12,
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },

  search: {
    flex: "0 1 260px",
    background: "#0a0f1a",
    border: `1px solid ${theme.blue}`,
    borderRadius: 10,
    color: theme.text,
    padding: "10px 12px",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    marginTop: 12,
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    color: theme.textDim,
    fontWeight: 700,
    borderBottom: `2px solid ${theme.blue}`,
    position: "sticky",
    top: 0,
    background: theme.ink,
  },
  td: {
    padding: "12px 14px",
    color: theme.text,
    borderBottom: `1px solid ${theme.slate}`,
  },
  vacationRow: { background: "#4b4e53ff" },
  vacationCell: { color: "#9ca3af", fontStyle: "italic" },
};
