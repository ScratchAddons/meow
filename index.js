import fs from "fs/promises";
import {exec} from "child_process";
import {promisify} from "util";

import generateFancyReport from "./gen.js";

if (!process.env.GITHUB_WORKSPACE) {
  await fs.access("./clone").catch(e => {
    if (e.code !== "ENOENT") throw e;
    return promisify(exec)("git clone --depth 1 --branch master https://github.com/ScratchAddons/ScratchAddons.git clone");
  });
}
await promisify(exec)("npx tap --no-esm --no-coverage -R json ./test/*.js > ./taptest.json").catch(e => e);
const parsedResult = JSON.parse(await fs.readFile("./taptest.json", "utf8"));
if (parsedResult.stats.failures === 0) {
  console.log("Test passed successfully.");
  process.exit(0);
}

process.exitCode = 1;
const report = generateFancyReport(parsedResult);
if (process.env.CI || process.env.HOT_RUN) {
  const {Octokit} = await import("@octokit/rest");
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN,
    userAgent: "unittest for ScratchAddons (via octokit)"
  });
  octokit.issues.create({
    ...report,
    owner: "ScratchAddons",
    repo: "ScratchAddons",
    labels: ["status: needs triage", "type: test failure"]
  });
  console.error("Test failed; created issue");
} else {
  console.log(report.title);
  console.log("\n\n");
  console.log(report.body);
}