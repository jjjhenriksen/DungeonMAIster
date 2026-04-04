export default function TurnIndicator({ activeCrew, waiting }) {
  return (
    <div style={{ fontSize: 11, color: "#5DCAA5", marginBottom: 8 }}>
      {waiting
        ? "Waiting for DM response…"
        : `${activeCrew.name} (${activeCrew.role.toUpperCase()}) — your move`}
    </div>
  );
}
