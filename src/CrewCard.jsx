function StatBar({ label, value }) {
  const color = value > 70 ? "#1D9E75" : value > 40 ? "#EF9F27" : "#E24B4A";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10,
        color: "#5a7a99",
        marginBottom: 3,
      }}
    >
      <span style={{ width: 28, flexShrink: 0 }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: 3,
          background: "#1e3a5f",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}

export default function CrewCard({ member, isActive }) {
  return (
    <div
      style={{
        background: isActive ? "#0d1825" : "#0d1219",
        border: `1px solid ${isActive ? "#378ADD" : "#1e3a5f"}`,
        borderRadius: 6,
        padding: 10,
        transition: "all 0.2s",
      }}
    >
      {isActive ? (
        <div
          style={{
            display: "inline-block",
            fontSize: 9,
            background: "#378ADD22",
            color: "#378ADD",
            border: "1px solid #378ADD55",
            borderRadius: 3,
            padding: "1px 6px",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          ACTIVE TURN
        </div>
      ) : null}

      <div
        style={{
          fontSize: 12,
          color: "#e8f4ff",
          fontWeight: 500,
          marginBottom: 2,
        }}
      >
        {member.name}
      </div>
      <div
        style={{
          fontSize: 10,
          color: isActive ? "#378ADD" : "#3a5a7a",
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        {member.role.toUpperCase()}
      </div>

      <StatBar label="HLTH" value={member.health} />
      <StatBar
        label={member.extra.label.slice(0, 4).toUpperCase()}
        value={member.extra.value}
      />
    </div>
  );
}
