import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const candidateEnvPaths = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), ".env"),
];

const envPath = candidateEnvPaths.find((candidatePath) => fs.existsSync(candidatePath));

dotenv.config(envPath ? { path: envPath } : undefined);

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    const expectedPath = path.resolve(__dirname, "../../.env");
    throw new Error(`${name} is not set. Add it to ${expectedPath} before starting the server.`);
  }

  return value;
}
