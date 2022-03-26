import { SwitchCutoutType } from "../maker_models/KeyCutouts";
import PlateParameters from "../PlateParameters";
import * as kle from "../KLESerial"
import { type } from "os";

type PcbParameters = {
  Hotswap: boolean;
  RGB: boolean;
  ledType: ledtypes;
}

export enum ledtypes {
  sk6812_mini_e,
  dumb
}

type cordinate = {
  x: number;
  y: number;
  r?: number;
}

type led = {
  footprint: string
  1: cordinate
  2: cordinate
  3: cordinate
  4: cordinate
}

type diode = {
  footprint: string
  a: cordinate
  c: cordinate
}

type switchFootprint = {
  footprint: string;
  smdDiodePos: cordinate
  mx1: cordinate;
  mx2: cordinate;
  mirror: boolean;
}

type pcbKey = {
  switch: switchFootprint
  diode: diode
}

var MX_HOTSWAP: switchFootprint = {
  footprint: "MXHSPCB-",
  smdDiodePos: { x: 8.25, y: 6.65, r:270 },
  mx1: { x: -7.36, y: 2.54},
  mx2: { x:  6.09, y: 5.08},
  mirror: true
}

var MX: switchFootprint = {
  footprint: "MX-",
  smdDiodePos: { x: 8.34, y: 5.91, r:270 },
  mx1: { x: -3.81, y: 2.54 },
  mx2: { x:  2.54, y: 5.08 },
  mirror: false
}

var DIODE_SOD123: diode = {
  footprint: "D_SOD123@Passives",
  a: { x: -1.635 , y: 0},
  c: { x:  1.635 , y: 0}
}

var sk6812_mini_e: led = {
  footprint:"WS2812B-SK6812-MINI-E@Other-Parts",
  1: {x:-2.65, y: 0.75},
  2: {x:-2.65, y:-0.75},
  3: {x: 2.65, y:-0.75},
  4: {x: 2.65, y: 0.75}
}

export const getLed = (p: PlateParameters) => {
  var led: led;
  switch (p.ledType) {
    default:
      led = sk6812_mini_e
      break;
  }
  return led
}

export const getSwitch = (p: PlateParameters) => {
  var key: pcbKey = {
    switch: MX,
    diode: DIODE_SOD123
  }

  switch (p.switchCutoutType) {
    case SwitchCutoutType.MX:
        if (p.Hotswap) key.switch=MX_HOTSWAP
      break;
  
    default:
      key.switch = MX;
      break;
  }

  return key
}

export const getKeysize = (key: kle.Key) => {
  var keysize: string;

  switch (key.width) {
    case 1 || 1.25 || 1.5 || 1.75:
      keysize = "1U"
      break;
    case 2 || 2.25 || 2.5 || 2.75:
      keysize = "2U"
      break;
    case 3:
      keysize = "3U"
      break;
    case 6:
      keysize = "6U"
      break;
    case 6.25:
      keysize = "6.25U"
      break;
    case 7:
      keysize = "7U"
      break;
    case 10:
      keysize = "10U"
      break;

  
    default:
      keysize = "1U"
      break;
  }
  if (key.rs) keysize+="-FLIPPED"
  return keysize
}

export default PcbParameters;