const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextjs = require("next/jest");

const createJestConfig = nextjs({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
});

module.exports = jestConfig;
