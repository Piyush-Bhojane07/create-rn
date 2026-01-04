const { execa } = require("execa");
const path = require("path");
const fs = require("fs-extra");

// ---- READ --name ARG ----
function getProjectName() {
  const index = process.argv.indexOf("--name");
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return "myApp";
}

module.exports = async function ({ lang, platform }) {
  try {
    // ---- OS GUARD FOR iOS ----
    if (platform === "ios" && process.platform !== "darwin") {
      console.error("❌ iOS projects require macOS with Xcode installed");
      process.exit(1);
    }

    const projectName = getProjectName();

    // ---- VALIDATE PROJECT NAME ----
    if (!/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(projectName)) {
      console.error("❌ Invalid project name");
      process.exit(1);
    }

    const projectPath = path.join(process.cwd(), projectName);

    // ---- PREVENT OVERWRITE ----
    if (fs.existsSync(projectPath)) {
      console.error(`❌ Folder '${projectName}' already exists`);
      process.exit(1);
    }

    // ---- BUILD INIT COMMAND ----
    const args = ["react-native", "init", projectName];

    if (lang === "ts") {
      args.push("--template", "react-native-template-typescript");
    }

    if (platform === "ios") {
      args.push("--platforms", "ios");
    }

    // ---- CREATE PROJECT ----
    await execa("npx", args, { stdio: "inherit" });

    // ---- COPY TEMPLATE ----
    const templatePath = path.join(
      __dirname,
      `../templates/cli/${platform || "default"}/${lang}`
    );

    await fs.copy(templatePath, projectPath, { overwrite: true });

    // ---- INSTALL DEPENDENCIES ----
    await execa("npm", ["install"], {
      cwd: projectPath,
      stdio: "inherit"
    });

    console.log(`
✅ React Native CLI project ready

Next steps:
  cd ${projectName}
  npx react-native run-${platform || "android"}
`);
  } catch (error) {
    console.error("❌ Failed to create React Native CLI project");
    console.error(error.message);
    process.exit(1);
  }
};
