export default function RoleView({ activeCrew, roleView }) {
  return (
    <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: 10 }}>
      <div
        style={{
          fontSize: 10,
          color: "#378ADD",
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        {activeCrew.role.toUpperCase()} VIEW
      </div>
      {roleView.map(({ key, val, warn }) => (
        <div key={key} style={{ fontSize: 11, lineHeight: 1.8 }}>
          <span style={{ color: "#5a7a99" }}>{key.padEnd(11, "\u00a0")}</span>
          <span style={{ color: warn ? "#EF9F27" : "#5DCAA5" }}>{val}</span>
        </div>
      ))}
    </div>
  );
}
