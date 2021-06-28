import ts from "typescript";
import { script } from "../config";
let callbacks: unknown;
callbacks = 0;
callbacks = {};
const RegisterNetEvent = (data: string) => {
  ts.transpile(`RegisterNetEvent(${data})`);
};
RegisterNetEvent(`gm_${script}:callback`);
onNet(`gm_${script}:callback`, (result: unknown, id: number) => {
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

import { conf, error, wait } from "./utils";

RegisterNetEvent(`gm_${script}:error`);
onNet(`gm_${script}:error`, () => {
  error(
    `cant find "gm_carhud" in ${conf["path"]}, please change your resource path in the config`,
    "config",
  );
});

let seatbelt = false;
let distance = "";
let currSpeed = 0;
let cruiser = false;
let visible = false;
let signal = "off";
let lights = "off";
let speedStr = "";
let speedNum = 0;
let speed = 0;
let fuel = 0;
let gear = "";
let leftLight = false;
let rightLight = false;
const configLoaded = (): void => {
  SendNuiMessage(
    JSON.stringify({
      type: "config",
      scale: conf["appearance"].scale,
      bgGauge: conf["appearance"].speedBgColor,
      speedometerColor: conf["appearance"].speedColor,
      colorPrimary: conf["appearance"].primaryColor,
      lightOn: conf["appearance"].signalsOn,
      lightOff: conf["appearance"].signalsOff,
      on: conf["appearance"].onColor,
      off: conf["appearance"].offColor,
      fuelColor: conf["appearance"].fuelColor,
      frontlightOff: conf["appearance"].lightsOff,
    }),
  );
  setTick(() => {
    const player = PlayerPedId();
    const vehicle = GetVehiclePedIsUsing(player);
    const position = GetEntityCoords(player, false);
    const vehicleClass = GetVehicleClass(vehicle);
    // Get Values
    if (IsPedInAnyVehicle(player, false) && GetIsVehicleEngineRunning(vehicle)) {
      visible = true;
      // Vehicle Speed
      const speedSource = GetEntitySpeed(vehicle);
      if (conf["useKmh"]) {
        speed = Math.ceil(speedSource * 3.6);
        speedNum = speed / conf["maxSpeed"];
        speedStr = `${speed}km/h`;
      } else {
        speed = Math.ceil(speed * 2.237);
        speedNum = speed / conf["maxSpeed"];
        speedStr = `${speed}MPH`;
      }
      // Vehicle Fuel
      fuel = GetVehicleFuelLevel(vehicle) / 100;
      // Vehicle Gear
      gear = GetVehicleCurrentGear(vehicle).toString();
      if ((speed === 0 && gear === "0") || (speed === 0 && gear === "1")) {
        gear = "N";
      } else if (speed > 0 && gear === "0") {
        gear = "R";
      }
      // Vehicle Lights
      const lightsSource = GetVehicleLightsState(vehicle);
      if (
        (lightsSource[1] === 1 && lightsSource[2] === 0) ||
        (lightsSource[1] === 0 && lightsSource[2] === 1)
      ) {
        lights = "normal";
      } else if (
        (lightsSource[1] === 1 && lightsSource[2] === 1) ||
        (lightsSource[1] === 0 && lightsSource[2] === 1)
      ) {
        lights = "high";
      } else {
        lights = "off";
      }
      // Seatbelt
      SetPedConfigFlag(player, 32, true);
      let prevVelocity = [0.0, 0.0, 0.0];
      const beltEjectSpeed = 45.0;
      const beltEjectAcc = 100.0;
      const prevSpeed = currSpeed;
      currSpeed = speed;
      if (vehicleClass != 8) {
        if (!seatbelt) {
          const vehFwd = GetEntitySpeedVector(vehicle, true)[2] > 1.0;
          const vehAcc = (prevSpeed - currSpeed) / GetFrameTime();
          if (vehFwd && prevSpeed > beltEjectSpeed / 2.237 && vehAcc > beltEjectAcc * 9.81) {
            SetEntityCoords(
              player,
              position[0],
              position[1],
              position[2] - 0.47,
              true,
              true,
              true,
              false,
            );
            SetEntityVelocity(player, prevVelocity[0], prevVelocity[1], prevVelocity[2]);
            SetPedToRagdoll(player, 1000, 1000, 0, false, false, false);
          } else {
            prevVelocity = GetEntityVelocity(vehicle);
          }
        } else {
          DisableControlAction(0, 75, true);
        }
      }
      // Toggle Seatbelt
      if (IsPedInAnyVehicle(player, false)) {
        if (
          IsControlJustPressed(1, conf["keys"].seatbelt) &&
          vehicleClass != 8 &&
          vehicleClass != 13
        ) {
          seatbelt = !seatbelt;
        }
      }
      // Toggle Cruiser
      if (
        IsControlJustPressed(1, conf["keys"].cruiser) &&
        GetPedInVehicleSeat(vehicle, -1) === player &&
        vehicleClass != 13
      ) {
        const vehicleSpeed = GetEntitySpeed(vehicle);
        if (cruiser) {
          cruiser = false;
          SetEntityMaxSpeed(
            vehicle,
            GetVehicleHandlingFloat(vehicle, "CHandlingData", "fInitialDriveMaxFlatVel"),
          );
        } else {
          cruiser = true;
          SetEntityMaxSpeed(vehicle, vehicleSpeed);
        }
      }
      // Toggle Signals
      if (IsPedInAnyVehicle(player, false)) {
        if (IsControlJustPressed(0, conf["keys"].signalL)) {
          if (signal === "off") {
            signal = "left";
          } else {
            signal = "off";
          }
          setCarSignal(signal);
        }
        if (IsControlJustPressed(0, conf["keys"].signalR)) {
          if (signal === "off") {
            signal = "right";
          } else {
            signal = "off";
          }
          setCarSignal(signal);
        }
        if (IsControlJustPressed(0, conf["keys"].signalB)) {
          if (signal === "off") {
            signal = "both";
          } else {
            signal = "off";
          }
          setCarSignal(signal);
        }
      }
    } else {
      visible = false;
    }
    SendNuiMessage(
      JSON.stringify({
        type: "values",
        visible: visible,
        speedometerGaugeVal: speedNum,
        displaySpeed: speedStr,
        mileage: distance,
        seatBeltActive: seatbelt,
        blinkerLeft: leftLight,
        blinkerRight: rightLight,
        frontLightMode: lights,
        gearShift: gear,
        cruiser: cruiser,
        fuelValue: fuel,
      }),
    );
  });
  setTick(async () => {
    await wait(250);
    if (conf["mileage"]) {
      const player = PlayerPedId();
      const vehicle = GetVehiclePedIsUsing(player);
      const plate = GetVehicleNumberPlateText(vehicle);
      const oldPos = GetEntityCoords(player, false);
      await wait(1000);
      const curPos = GetEntityCoords(player, false);
      if (IsPedInAnyVehicle(player, false) && GetPedInVehicleSeat(vehicle, -1)) {
        serverCallback(`gm_${script}:getMileage`, { plate: plate }, (km: number) => {
          let dist = 0;
          const showKm = Math.floor(km * 1.33) / 1000;

          if (IsVehicleOnAllWheels(vehicle)) {
            dist = GetDistanceBetweenCoords(
              oldPos[0],
              oldPos[1],
              oldPos[2],
              curPos[0],
              curPos[1],
              curPos[2],
              true,
            );
          } else {
            dist = 0;
          }

          km = km + dist;

          emitNet(`gm_${script}:addMileage`, plate, km);
          sendDistance(showKm);
        });
      }
    }
  });
};

const setCarSignal = (status: string) => {
  const driver = GetVehiclePedIsIn(PlayerPedId(), false);
  if (status === "left") {
    leftLight = true;
    rightLight = false;
  } else if (status === "right") {
    rightLight = true;
    leftLight = false;
  } else if (status === "both") {
    leftLight = true;
    rightLight = true;
  } else {
    leftLight = false;
    rightLight = false;
  }
  SetVehicleIndicatorLights(driver, 1, leftLight);
  SetVehicleIndicatorLights(driver, 0, rightLight);
};

const sendDistance = (km: number) => {
  if (conf["useKilometers"]) {
    distance = `${Math.floor(km)}km`;
  } else {
    distance = `${Math.floor(km * 0.62137)}miles`;
  }
};

export { configLoaded };
