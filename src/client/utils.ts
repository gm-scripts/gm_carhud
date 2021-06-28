import ts from "typescript";
import { VrpProxy, VrpTunnel } from "@vrpjs/client";
import { script } from "../config";
import { configLoaded } from "./main";
import { checkConf } from "./check";
const RegisterNetEvent = (data: string) => {
  ts.transpile(`RegisterNetEvent(${data})`);
};

let vRPTunnel: unknown;
let vRP: unknown;
let ESX: unknown;

// let lang: unknown = {};
let conf: unknown = {};

// let langLoaded = false;

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

let callbacks: unknown;
callbacks = 0;
callbacks = {};
RegisterNetEvent(`gm_${script}:callbackUtils`);
onNet(`gm_${script}:callbackUtils`, (result: unknown, id: number) => {
  callbacks[id](result);
  delete callbacks[id];
});
const serverCallback = (name: string, data: unknown, cb: unknown): void => {
  let id: number;
  id = 0;
  id = Object.keys(callbacks).length++;
  callbacks[id] = cb;
  data["CallbackID"] = id;
  emitNet(name, data);
};

// serverCallback(`gm_${script}:getLocales`, {}, (locales: unknown) => {
//   loadLocales(locales);
// });

serverCallback(`gm_${script}:getConfig`, {}, (config: unknown) => {
  loadConfig(config);
  if (config["framework"] === "esx") {
    emit("esx:getSharedObject", obj => (ESX = obj));
  } else if (config["framework"] === "vrp") {
    vRP = VrpProxy.getInterface("vRP");
    vRPTunnel = VrpTunnel.getInterface("vRP");
  }
});

// const loadLocales = (locales: unknown) => {
//   lang = locales;
//   langLoaded = true;
// };

const loadConfig = (config: unknown) => {
  conf = config;
  configLoaded();
  checkConf();
};

const helpText = (text: string): void => {
  SetTextComponentFormat("STRING");
  AddTextComponentString(text);
  DisplayHelpTextFromStringLabel(0, false, true, -1);
};

const missionText = (msg: string, time: number): void => {
  ClearPrints();
  BeginTextCommandPrint("STRING");
  AddTextComponentSubstringPlayerName(msg);
  EndTextCommandPrint(time, true);
};

const notifyText = (msg: string): void => {
  SetNotificationTextEntry("STRING");
  AddTextComponentString(msg);
  DrawNotification(true, false);
};

const error = (msg: string, type: string): void => {
  if (type === "config") {
    console.log(`^1ERROR(gmconfig/${script}.json): ${msg}`);
  } else if (type === "lang") {
    console.log(`^1ERROR(gmlocales/${script}/${conf["lang"]}.json): ${msg}`);
  } else if (type === "none") {
    console.log(`^1ERROR: ${msg}`);
  } else {
    console.log(`^1ERROR(${type}): ${msg}`);
  }
};

export { wait, helpText, missionText, notifyText, conf, vRP, vRPTunnel, ESX, error };
