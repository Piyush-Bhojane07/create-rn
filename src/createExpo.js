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

module.exports = async function ({ lang }) {
  try {
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
    const args =
      lang === "ts"
        ? [
            "create-expo-app",
            projectName,
            "--template",
            "expo-template-blank-typescript"
          ]
        : ["create-expo-app", projectName];

    // ---- CREATE PROJECT ----
    await execa("npx", args, { stdio: "inherit" });

    // ---- COPY TEMPLATE ----
    const templatePath = path.join(
      __dirname,
      `../templates/expo/${lang}`
    );

    await fs.copy(templatePath, projectPath, { overwrite: true });

    // ---- INSTALL DEPENDENCIES ----
    await execa("npm", ["install"], {
      cwd: projectPath,
      stdio: "inherit"
    });

    console.log(`
✅ Expo project ready

Next steps:
  cd ${projectName}
  npm start
`);
  } catch (error) {
    console.error("❌ Failed to create Expo project");
    console.error(error.message);
    process.exit(1);
  }
};
