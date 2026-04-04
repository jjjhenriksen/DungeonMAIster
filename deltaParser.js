function extractStateDeltaBlock(dmResponse) {
  if (!dmResponse || typeof dmResponse !== "string") {
    return null;
  }

  const fencedMatch = dmResponse.match(/```STATE_DELTA\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const tagMatch = dmResponse.match(/<STATE_DELTA>([\s\S]*?)<\/STATE_DELTA>/i);
  if (tagMatch) {
    return tagMatch[1].trim();
  }

  return null;
}

function parseStateDelta(dmResponse) {
  const rawDelta = extractStateDeltaBlock(dmResponse);
  if (!rawDelta) {
    return null;
  }

  try {
    return JSON.parse(rawDelta);
  } catch (error) {
    throw new Error(`Unable to parse STATE_DELTA JSON: ${error.message}`);
  }
}

function applyStateDelta(worldState, delta) {
  if (!delta) {
    return clone(worldState);
  }

  const nextState = clone(worldState);

  if (delta.replace) {
    return clone(delta.replace);
  }

  if (delta.merge) {
    deepMerge(nextState, delta.merge);
  }

  if (delta.set) {
    for (const [path, value] of Object.entries(delta.set)) {
      setByPath(nextState, path, value);
    }
  }

  if (delta.append) {
    for (const [path, items] of Object.entries(delta.append)) {
      const target = getByPath(nextState, path);
      if (!Array.isArray(target)) {
        throw new Error(`Cannot append to non-array path "${path}".`);
      }
      target.push(...clone(items));
    }
  }

  if (delta.upsertById) {
    for (const [path, items] of Object.entries(delta.upsertById)) {
      const target = getByPath(nextState, path);
      if (!Array.isArray(target)) {
        throw new Error(`Cannot upsert into non-array path "${path}".`);
      }
      upsertArrayById(target, items);
    }
  }

  if (delta.remove) {
    for (const path of delta.remove) {
      removeByPath(nextState, path);
    }
  }

  return nextState;
}

function mergeDeltaFromResponse(worldState, dmResponse) {
  const delta = parseStateDelta(dmResponse);
  return applyStateDelta(worldState, delta);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value) && isObject(target[key])) {
      deepMerge(target[key], value);
      continue;
    }

    target[key] = clone(value);
  }

  return target;
}

function upsertArrayById(target, incomingItems) {
  for (const item of incomingItems) {
    if (!item || item.id === undefined) {
      throw new Error("upsertById items must include an id field.");
    }

    const existingIndex = target.findIndex((entry) => entry && entry.id === item.id);
    if (existingIndex === -1) {
      target.push(clone(item));
      continue;
    }

    if (isObject(target[existingIndex]) && isObject(item)) {
      deepMerge(target[existingIndex], item);
    } else {
      target[existingIndex] = clone(item);
    }
  }
}

function getByPath(root, path) {
  return splitPath(path).reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }
    return current[key];
  }, root);
}

function setByPath(root, path, value) {
  const parts = splitPath(path);
  if (!parts.length) {
    throw new Error("Path cannot be empty.");
  }

  let current = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    const nextKey = parts[index + 1];

    if (current[key] === undefined) {
      current[key] = typeof nextKey === "number" ? [] : {};
    }

    current = current[key];
  }

  current[parts[parts.length - 1]] = clone(value);
}

function removeByPath(root, path) {
  const parts = splitPath(path);
  if (!parts.length) {
    return;
  }

  const leaf = parts[parts.length - 1];
  const parent = getByPath(root, joinPath(parts.slice(0, -1)));
  if (parent === undefined || parent === null) {
    return;
  }

  if (Array.isArray(parent) && typeof leaf === "number") {
    parent.splice(leaf, 1);
    return;
  }

  delete parent[leaf];
}

function splitPath(path) {
  if (typeof path !== "string" || !path.trim()) {
    return [];
  }

  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .map((part) => {
      const maybeIndex = Number(part);
      return Number.isInteger(maybeIndex) && part === String(maybeIndex) ? maybeIndex : part;
    });
}

function joinPath(parts) {
  return parts
    .map((part) => (typeof part === "number" ? `[${part}]` : part))
    .join(".")
    .replace(".[", "[");
}

module.exports = {
  extractStateDeltaBlock,
  parseStateDelta,
  applyStateDelta,
  mergeDeltaFromResponse,
};
