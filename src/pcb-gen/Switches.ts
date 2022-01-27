import { SwitchCutoutType } from "../maker_models/KeyCutouts";
import PlateParameters from "../PlateParameters";
import * as kle from "../KLESerial"

type PcbParameters = {
  Hotswap: boolean;
  RGB: boolean;
}

type cordinate = {
  x: number;
  y: number;
  r?: number;
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
  smdDiodePos: { x: 8.25, y: 6.65, r:90 },
  mx1: { x: -7.36, y: 2.54},
  mx2: { x:  6.09, y: 5.08},
  mirror: true
}

var MX: switchFootprint = {
  footprint: "MX-",
  smdDiodePos: { x: 8.34, y: 5.91, r:90 },
  mx1: { x: -3.81, y: 2.54 },
  mx2: { x:  2.54, y: 5.08 },
  mirror: false
}

var DIODE_SOD123: diode = {
  footprint: "D_SOD123@Passives",
  a: { x: -1.635000032 , y: 0},
  c: { x:  1.635000032 , y: 0}
}


// class SwitchFootprint {
//   public footprint: pcbKey

//   constructor(plateParameters: PlateParameters){

//   }
// }

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