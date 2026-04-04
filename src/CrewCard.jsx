function getStatColor(value) {
  if (value > 70) return "#1D9E75";
  if (value > 40) return "#EF9F27";
  return "#E24B4A";
}

function StatBar({ label, value, tone }) {
  const color = tone ?? getStatColor(value);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr 34px",
        alignItems: "center",
        gap: 8,
        fontSize: 10,
        color: "#7f9db9",
        marginBottom: 6,
      }}
    >
      <span style={{ letterSpacing: 1 }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: 5,
          background: "#14263b",
          borderRadius: 999,
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px #1e3a5f",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
            transition: "width 0.5s",
          }}
        />
      </div>
      <span style={{ textAlign: "right", color: "#c8d6e5" }}>{value}%</span>
    </div>
  );
}

export default function CrewCard({ member, isActive }) {
  const accent = isActive ? "#6fd3ff" : "#378ADD";
  const extraLabel = member.extra.label.toUpperCase();

  return (
    <div
      style={{
        background: isActive
          ? "linear-gradient(180deg, #11243a 0%, #0d1825 100%)"
          : "linear-gradient(180deg, #0f1722 0%, #0b1016 100%)",
        border: `1px solid ${isActive ? "#378ADD" : "#1e3a5f"}`,
        borderRadius: 10,
        padding: 12,
        transition: "all 0.2s",
        boxShadow: isActive ? "0 0 0 1px #378ADD22, 0 10px 24px #00000033" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              color: "#e8f4ff",
              fontWeight: 500,
              marginBottom: 3,
            }}
          >
            {member.name}
          </div>
          <div
            style={{
              fontSize: 10,
              color: accent,
              letterSpacing: 1.4,
            }}
          >
            {member.role.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            fontSize: 9,
            background: isActive ? "#6fd3ff22" : "#14263b",
            color: isActive ? "#9fe7ff" : "#5a7a99",
            border: `1px solid ${isActive ? "#6fd3ff44" : "#234260"}`,
            borderRadius: 999,
            padding: "3px 7px",
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}
        >
          {isActive ? "ACTIVE TURN" : "STANDBY"}
        </div>
      </div>

      <div
        style={{
          fontSize: 10,
          lineHeight: 1.5,
          color: "#8ea8c0",
          background: "#0a1018",
          border: "1px solid #16283d",
          borderRadius: 8,
          padding: "8px 9px",
          marginBottom: 10,
        }}
      >
        {isActive
          ? "Crew channel open. Awaiting command priority and field action."
          : "Monitoring systems and holding for assignment handoff."}
      </div>

      <StatBar label="HEALTH" value={member.health} />
      <StatBar label="MORALE" value={member.morale} tone="#9D8CFF" />
      <StatBar label={extraLabel.slice(0, 6)} value={member.extra.value} tone={accent} />
    </div>
  );
}
