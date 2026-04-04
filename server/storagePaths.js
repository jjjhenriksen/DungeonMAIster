import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, "..");
export const vaultRoot = path.join(projectRoot, "vault");
export const staticVaultRoot = path.join(vaultRoot, "static");

const persistentBaseRoot =
  (process.env.DATA_DIR && path.resolve(process.env.DATA_DIR)) ||
  (process.env.RENDER_DISK_ROOT && path.join(process.env.RENDER_DISK_ROOT, "dungeonmaister")) ||
  projectRoot;

export const dynamicVaultRoot =
  persistentBaseRoot === projectRoot
    ? path.join(vaultRoot, "dynamic")
    : path.join(persistentBaseRoot, "vault", "dynamic");

export const usingPersistentDataRoot = persistentBaseRoot !== projectRoot;
export const storageMode = usingPersistentDataRoot ? "persistent-disk" : "local-filesystem";
