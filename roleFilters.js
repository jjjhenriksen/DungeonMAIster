const { ROLE_DEFINITIONS, getRoleDefinition } = require("./worldState");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isVisibleToRole(visibility, roleKey) {
  if (visibility === undefined || visibility === null || visibility === "all") {
    return true;
  }

  if (visibility === "hidden") {
    return false;
  }

  if (typeof visibility === "string") {
    return visibility === roleKey;
  }

  if (Array.isArray(visibility)) {
    return visibility.includes(roleKey) || visibility.includes("all");
  }

  return false;
}

function filterVisibleNotes(notes, roleKey) {
  return (notes || [])
    .filter((note) => isVisibleToRole(note.visibility, roleKey))
    .map((note) => note.text || note);
}

function filterObjectives(objectives, roleKey) {
  return (objectives || [])
    .filter((objective) => isVisibleToRole(objective.visibility, roleKey))
    .map((objective) => {
      const nextObjective = clone(objective);
      delete nextObjective.visibility;
      return nextObjective;
    });
}

function filterClocks(clocks, roleKey) {
  return (clocks || [])
    .filter((clock) => isVisibleToRole(clock.visibility, roleKey))
    .map((clock) => {
      const nextClock = clone(clock);
      delete nextClock.visibility;
      return nextClock;
    });
}

function filterSecrets(secrets, roleKey) {
  return (secrets || [])
    .filter((secret) => isVisibleToRole(secret.visibility, roleKey))
    .map((secret) => secret.text);
}

function filterCrew(ws, roleKey) {
  return {
    players: clone(ws.crew.players),
    npcs: (ws.crew.npcs || []).map((npc) => ({
      id: npc.id,
      displayName: npc.displayName,
      role: npc.role,
      locationId: npc.locationId,
      disposition: npc.disposition,
      trust: npc.trust,
      publicSummary: npc.publicSummary,
      privateNotes: filterVisibleNotes(npc.privateNotes, roleKey),
    })),
    relationships: (ws.crew.relationships || [])
      .filter((relationship) => isVisibleToRole(relationship.visibility, roleKey))
      .map((relationship) => {
        const nextRelationship = clone(relationship);
        delete nextRelationship.visibility;
        return nextRelationship;
      }),
  };
}

function filterSystems(ws, roleKey) {
  const entries = Object.entries(ws.systems || {}).map(([systemKey, systemValue]) => {
    const nextSystem = clone(systemValue);
    nextSystem.alerts = (systemValue.alerts || [])
      .filter((alert) => isVisibleToRole(alert.visibility, roleKey))
      .map((alert) => {
        const nextAlert = clone(alert);
        delete nextAlert.visibility;
        return nextAlert;
      });
    return [systemKey, nextSystem];
  });

  return Object.fromEntries(entries);
}

function filterEnvironment(ws, roleKey) {
  return {
    currentLocationId: ws.environment.currentLocationId,
    dangerLevel: ws.environment.dangerLevel,
    conditions: clone(ws.environment.conditions || []),
    ship: clone(ws.environment.ship),
    locations: (ws.environment.locations || []).map((location) => ({
      id: location.id,
      name: location.name,
      tags: clone(location.tags || []),
      publicSummary: location.publicSummary,
      hiddenDetails: filterVisibleNotes(location.hiddenDetails, roleKey),
    })),
    anomalies: (ws.environment.anomalies || [])
      .filter((anomaly) => isVisibleToRole(anomaly.visibility, roleKey))
      .map((anomaly) => {
        const nextAnomaly = clone(anomaly);
        delete nextAnomaly.visibility;
        return nextAnomaly;
      }),
  };
}

function filterEventLog(ws, roleKey) {
  return (ws.eventLog || [])
    .filter((entry) => isVisibleToRole(entry.visibility, roleKey))
    .map((entry) => {
      const nextEntry = clone(entry);
      delete nextEntry.visibility;
      return nextEntry;
    });
}

function getViewForRole(ws, roleIndex) {
  const role = getRoleDefinition(roleIndex);

  if (!role) {
    throw new Error(
      `Unknown role index "${roleIndex}". Valid indexes: ${ROLE_DEFINITIONS.map((item) => item.index).join(", ")}`
    );
  }

  return {
    role: clone(role),
    meta: clone(ws.meta),
    crew: filterCrew(ws, role.key),
    systems: filterSystems(ws, role.key),
    mission: {
      title: ws.mission.title,
      publicBrief: ws.mission.publicBrief,
      objectives: filterObjectives(ws.mission.objectives, role.key),
      clocks: filterClocks(ws.mission.clocks, role.key),
      secrets: filterSecrets(ws.mission.secrets, role.key),
    },
    environment: filterEnvironment(ws, role.key),
    eventLog: filterEventLog(ws, role.key),
  };
}

module.exports = {
  getViewForRole,
  isVisibleToRole,
};
