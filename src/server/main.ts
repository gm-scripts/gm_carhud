import fs from "fs";
import { error, config } from "./utils";
import { script } from "../config";
let path = false;

if (!fs.existsSync(`./${config["path"]}gm_carhud`)) {
  error(
    `cant find "gm_carhud" in ${config["path"]}, please use your resource path in config`,
    "config",
  );
  emitNet(`gm_${script}:error`, {});
} else {
  path = true;
}

onNet(`gm_${script}:getMileage`, data => {
  let km = 0;
  let found = false;
  if (path) {
    const db = JSON.parse(fs.readFileSync(`./${config["path"]}gm_carhud/data/mileages.json`).toString())
    for (let i = 0; i < db.length; i++) {
      if (db[i].plate == data.plate) {
        km = db[i].mileage;
        found = true;
      }
    }
    if (!found) {
      db.push({"plate": data.plate, "mileage": 0})
      fs.writeFileSync(`./${config["path"]}gm_carhud/data/mileages.json`, JSON.stringify(db, null, 2))
    }
  }
  emitNet(`gm_${script}:callback`, source, km, data.CallbackID);
});

onNet(`gm_${script}:addMileage`, (plate: string, km: number) => {
  if (path) {
    const db = JSON.parse(fs.readFileSync(`./${config["path"]}gm_carhud/data/mileages.json`).toString())
    for (let i = 0; i < db.length; i++) {
      if (db[i].plate == plate) {
        db[i].mileage = km;
      }
    }
    fs.writeFileSync(`./${config["path"]}gm_carhud/data/mileages.json`, JSON.stringify(db, null, 2))
  }
});