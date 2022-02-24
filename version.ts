const fs = require("fs");
interface IPackageJson {
    version?: string;
}
type IVersion = [string, string, string];

class VersionManager {
    public getPackageJson(packageJsonPath: string) {
        return JSON.parse(fs.readFileSync(packageJsonPath, { encoding: "utf-8" })) as IPackageJson;
    }
    public getVersion(packagejson: IPackageJson) {
        packagejson.version = packagejson.version || "0.0.0";
        const vers = packagejson.version.split(".") as IVersion;
        [0, 1, 2].forEach(index => vers[index] = vers[index] || "0");
        return vers;
    }
    public incrementVersion(vers: IVersion) {
        const retVal = vers.map(num => num);
        retVal[2] = ((Number(retVal[2]) || 0) + 1).toString();
        return retVal;
    }
    public savePackageJson(packagejson: IPackageJson, packageJsonPath: string) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packagejson, undefined, 2));
    }
    public appendVersionToFile(versionFilePath: string, version: string) {
        const envFile = fs.readFileSync(versionFilePath, { encoding: "utf-8" }) as string;
        const startString = "export const version =", endString = ";";
        const startIndex = envFile.indexOf(startString), endIndex = envFile.indexOf(endString, startIndex);
        if (startIndex == -1 || endIndex == -1) { throw new Error("Environment.ts should have a line -> export const version = \"...\";") }
        const newEnvFile = envFile.substring(0, startIndex + startString.length) + ` "${version}"` + envFile.substring(endIndex);
        fs.writeFileSync(versionFilePath, newEnvFile, { encoding: "utf-8" });
        console.log("appended version file");
    }
}

const vm = new VersionManager();
const packJsons = [
    "./package.json",
    "./packages/bridgets/package.json",
    "./packages/plateau-comm/package.json",
    "./packages/qui/package.json",
    "./packages/websdk/package.json",
    "./common/dory/package.json",
    "./common/nemo/package.json",
    "./common/qshell/package.json",
    "./common/shrimp/package.json",
    "./apps/qeditor/package.json",
];
packJsons.forEach(packJsonPath => {
    console.log(`reading: ${packJsonPath}`);

    const packageJson = vm.getPackageJson(packJsonPath);
    const version = vm.getVersion(packageJson);
    console.log("found version: " + version);

    packageJson.version = vm.incrementVersion(version).join(".");
    console.log("new version: " + packageJson.version);

    vm.savePackageJson(packageJson, packJsonPath);
    console.log(`wrote: ${packJsonPath}`);
});