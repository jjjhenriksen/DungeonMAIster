const ROLE_FLAVOR = {
  Commander: "You hold the tempo. Weigh the signal, the crew, and the cost of every order.",
  "Flight Engineer":
    "Your console catches the strain first. Keep fragile systems alive long enough for the plan to work.",
  "Science Officer":
    "Patterns hide inside the noise. Separate discovery from danger before curiosity outruns caution.",
  "Mission Specialist":
    "You operate where the risk becomes physical. Every tool choice is a bet against the environment.",
};

export default function RoleView({ activeCrew, roleView }) {
  return (
    <div
      style={{
        borderTop: "1px solid #1e3a5f",
        paddingTop: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#378ADD",
          letterSpacing: 2,
          marginBottom: 10,
        }}
      >
        {activeCrew.role.toUpperCase()} VIEW
      </div>

      <div
        style={{
          background: "#0d1219",
          border: "1px solid #1a304a",
          borderRadius: 10,
          padding: 12,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#e8f4ff",
            marginBottom: 4,
          }}
        >
          {activeCrew.name} console
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.6, color: "#7f9db9" }}>
          {ROLE_FLAVOR[activeCrew.role] ?? "Role-specific telemetry incoming."}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {roleView.map(({ key, val, warn }) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 10,
              alignItems: "start",
              background: warn ? "#251912" : "#0b1016",
              border: `1px solid ${warn ? "#5f3824" : "#16283d"}`,
              borderRadius: 8,
              padding: "9px 10px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#5a7a99",
                letterSpacing: 1.2,
              }}
            >
              {key}
            </div>
            <div
              style={{
                fontSize: 11,
                lineHeight: 1.55,
                color: warn ? "#F6B15A" : "#8fe2bb",
              }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
