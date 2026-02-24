import fs from "fs/promises";

const LAST_EXECUTION_FILE = "lastExecution.txt";

/**
 * Retrieves the last execution time from the storage file.
 * @returns {Promise<Date>} A promise that resolves to the last execution Date, or Date(0) if not found or on error.
 */
export async function getLastExecutionTime(): Promise<Date> {
  try {
    const lastExecution = await fs.readFile(LAST_EXECUTION_FILE, "utf8");
    return new Date(lastExecution);
  } catch (error) {
    return new Date(0);
  }
}

/**
 * Sets the last execution time to the current time and saves it to the storage file.
 * @returns {Promise<void>} A promise that resolves when the file is written.
 */
export async function setLastExecutionTime(): Promise<void> {
  await fs.writeFile(LAST_EXECUTION_FILE, new Date().toISOString());
}
