import {createHash} from "crypto";

const md5 = v => {
  const hash = createHash("md5");
  hash.update(v);
  return hash.digest("hex");
};

export default report => {
  const title = `${report.stats.failures} test(s) failed`;
  const fails = report.failures.map(failure => `
- ${failure.fullTitle} (\`${md5(failure.fullTitle)}\`)

\`\`\`
${failure.err.stack}
\`\`\`
`.trimEnd())
  
  const body = `
${report.stats.failures} test(s) failed. (success: ${report.stats.passes}/${report.stats.tests}, ${
  Math.floor(report.stats.passes / report.stats.tests * 100)
}%)

<details><summary>List of failed tests</summary>
${fails.join("\n")}
</details>

*Unittest by [meow](https://github.com/ScratchAddons/meow). [Trigger rerun](https://github.com/ScratchAddons/ScratchAddons/actions?query=workflow%3AUnittest)*
`.trim();
  return {title, body};
}