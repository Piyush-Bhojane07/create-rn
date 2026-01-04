#!/usr/bin/env node
const prompts = require("prompts");
const { createExpo } = require("../src/createExpo");
const { createCLI } = require("../src/createCLI");

(async () => {
  const res = await prompts({
    type: "select",
    name: "type",
    message: "Choose setup",
    choices: [
      { title: "Expo", value: "expo" },
      { title: "React Native CLI", value: "cli" }
    ]
  });

  if (res.type === "expo") await createExpo();
  if (res.type === "cli") await createCLI();
})();
