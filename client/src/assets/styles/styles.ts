import React from "react";

export const theme = {
  blueDark: "#0E6BD8",
  blue: "#1674E0",
  blueLight: "#8FC4FB",
  navy: "#0B2537",
  yellow: "#F2C335",
  border: "#aeccf3ff",
  white: "#eeeeeeee",
  grayRow: "#c5c7caff",
  panel: "#F5F7FB",
  textPrimary: "#0B2537",   
  textSecondary: "#4B6172", 
};

export const styles: Record<string, React.CSSProperties> = {
appShell: {
  position: "fixed",
  inset: 0,                  
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: `linear-gradient(180deg, ${theme.blueDark} 0%, ${theme.blue} 30%, ${theme.blueLight} 60%, ${theme.white} 100%)`,
  overflow: "hidden",        
},


  title: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: 800,
    textAlign: "center",
    marginBottom: 8,
  },

  centerCard: {
    width: "100%",
    maxWidth: 460,
    background: theme.white,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(14,107,216,0.10)",
    transform: "translateY(-18px)", 
  },

  formRow: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },

  label: { color: theme.textSecondary, fontSize: 14, fontWeight: 600 },

  input: {
    background: theme.white,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: "12px 14px",
    color: theme.textPrimary,
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  },

  primaryBtn: {
    width: "100%",
    marginTop: 20,
    padding: "12px 16px",
    background: theme.yellow,
    color: theme.navy,
    border: 0,
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    letterSpacing: 0.2,
    boxShadow: "0 6px 16px rgba(242,195,53,0.35)",
  },

  // ===== Statuses screen =====
  dashboardWrap: {
    width: "100%",
    maxWidth: 980,
    background: theme.panel,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(14,107,216,0.10)",
    minHeight: 520,
     transform: "translateY(-18px)", 
  },

  sectionTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 800,
  },

  select: {
    background: theme.white,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    color: theme.textPrimary,
    padding: "10px 12px",
  },

  filtersRow: {
    marginTop: 12,
    marginBottom: 16,
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-end",
    justifyContent: "space-between", 
  },

  search: {
    flex: "0 1 260px",
    background: theme.white,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    color: theme.textPrimary,
    padding: "10px 12px",
  },

  // Search with icon
  searchGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  searchIcon: {
    display: "inline-flex",
    width: 18,
    height: 18,
    opacity: 0.7,
    color: theme.textSecondary,
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },

  tableScroll: {
    height: 420,
    overflowY: "auto",
    overflowX: "auto",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.white,
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    marginTop: 0,
  },

  th: {
    textAlign: "left",
    padding: "12px 14px",
    color: theme.textSecondary,
    fontWeight: 800,
    borderBottom: `2px solid ${theme.blue}`,
    position: "sticky",
    top: 0,
    background: theme.white,
  },

  td: {
    padding: "12px 14px",
    color: theme.textPrimary,
    borderBottom: `1px solid ${theme.border}`,
  },

  vacationRow: {
    background: theme.grayRow,
  },
  vacationCell: {
    color: theme.textPrimary,
    fontStyle: "italic",
    fontWeight: 600,
  },
};
