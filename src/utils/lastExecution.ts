import fs from "fs";

const LAST_EXECUTION_FILE = "lastExecution.txt";

export function getLastExecutionTime() {
    try {
        const lastExecution = fs.readFileSync(LAST_EXECUTION_FILE, "utf8");
        return new Date(lastExecution);
    } catch (error) {
        return new Date(0);
    }
}

export function setLastExecutionTime() {
    fs.writeFileSync(LAST_EXECUTION_FILE, new Date().toISOString());
}
