import { script } from "../config";

import { VrpProxy, VrpTunnel } from "@vrpjs/server";
import fs from "fs";

let vRPServer: unknown;
let vRPTunnelServer: unknown;
const error = (msg: string, type: string): void => {
  if (type === "config") {
    console.log(`^1ERROR(gmconfig/${script}.json): ${msg}`);
  } else if (type === "none") {
    console.log(`^1ERROR: ${msg}`);
  } else {
    console.log(`^1ERROR(${type}): ${msg}`);
  }
};

if (!fs.existsSync("./gmconfig/")) {
  error(`cant find folder "gmconfig" in ${process.cwd()}`, "none");
}
if (!fs.existsSync("./gmlocales/")) {
  error(`cant find folder "gmlocales" in ${process.cwd()}`, "none");
}
if (!fs.existsSync(`./gmconfig/${script}.json`)) {
  error(`cant find file "${script}.json" in ${process.cwd()}\\gmconfig`, "none");
}
if (!fs.existsSync(`./gmconfig/${script}.json`)) {
  error(`please read the installation instructions of our scripts`, "none");
}

const config = JSON.parse(fs.readFileSync(`./gmconfig/${script}.json`).toString());

// const locales = JSON.parse(fs.readFileSync(`./gmlocales/${script}/${config.lang}.json`).toString());

onNet(`gm_${script}:getConfig`, data => {
  emitNet(`gm_${script}:callbackUtils`, source, config, data.CallbackID);
  if (config.framework === "vrp") {
    vRPServer = VrpProxy.getInterface("vRP");
    vRPTunnelServer = VrpTunnel.getInterface("vRP");
  }
});

// onNet(`gm_${script}:getLocales`, data => {
//   emitNet(`gm_${script}:callbackUtils`, source, locales, data.CallbackID);
// });

export { vRPServer, vRPTunnelServer, error, config };
