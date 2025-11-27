
import { getBossOfTheMonth } from "./src/lib/bossLogic";

// Mock the date to ensure we are testing Nov 2025
// We can't easily mock Date in a simple script without a library, 
// but we can rely on the system time being 2025-11-27 as per metadata.

const boss = getBossOfTheMonth();
console.log("Current Date:", new Date().toISOString());
console.log("Calculated Boss:", boss.name);

if (boss.name === "Alejandro") {
    console.log("TEST PASSED: Boss is Alejandro");
} else {
    console.log("TEST FAILED: Boss is " + boss.name);
}
