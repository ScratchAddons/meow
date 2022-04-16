import fs from "fs/promises";
import path from "path";
import tap from "tap";
import intlMessageFormat from "intl-messageformat";
import {default as glob} from "tiny-glob";

const {IntlMessageFormat} = intlMessageFormat;

const getTranslation = (value) => value.string || value;

tap.test("addons-l10n", async t => {
  const files = await glob(path.resolve(process.env.GITHUB_WORKSPACE || "./clone", "./addons-l10n/*/*.json"), {
    absolute: true
  });
  await Promise.all(files.map(async file => {
    const rps = file.split(path.sep).slice(-2);
    const rp = rps.join("/");
    const obj = JSON.parse(await fs.readFile(file, "utf8"));
    return Object.keys(obj).map(key => t.test(`translation validation: file \`${rp}\`, key \`${key}\``, (t2) => {
      new IntlMessageFormat(getTranslation(obj[key]), rps[0]);
      t2.end();
    }));
  }));
  t.end();
});