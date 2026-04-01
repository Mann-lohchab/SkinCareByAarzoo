import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

let loadedEnvPath = null;

export function loadEnv() {
  if (loadedEnvPath) {
    return loadedEnvPath;
  }

  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const candidatePaths = [
    path.resolve(currentDir, "../../.env"),
    path.resolve(currentDir, "../.env"),
    path.resolve(process.cwd(), ".env"),
  ];

  for (const envPath of candidatePaths) {
    if (!fs.existsSync(envPath)) {
      continue;
    }

    dotenv.config({ path: envPath });
    loadedEnvPath = envPath;
    return loadedEnvPath;
  }

  dotenv.config();
  loadedEnvPath = path.resolve(process.cwd(), ".env");
  return loadedEnvPath;
}
