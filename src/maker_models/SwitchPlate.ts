import makerjs from "makerjs";
import * as kle from "../KLESerial";
import KeyCutouts from "./KeyCutouts";
import PlateParameters from "../PlateParameters";

class SwitchPlate implements makerjs.IModel {
  public origin: makerjs.IPoint;
  public units = makerjs.unitType.Millimeter;
  public models: makerjs.IModelMap = {};
  public keyboard: kle.Keyboard = new kle.Keyboard();

  constructor(plateParameters: PlateParameters) {
    this.origin = [0, 0];
    let models: makerjs.IModelMap = {};
    console.log(`Parameters: ${JSON.stringify(plateParameters)}`);

    if (typeof plateParameters.kleData === "string") {
      this.keyboard = kle.parse(plateParameters.kleData);
    } else if (typeof plateParameters.kleData === "object") {
      this.keyboard = kle.deserialize(plateParameters.kleData);
    } else {
      return;
    }
    // acceptable x and y range between 0 and 36 for KLE so we use those as min and max
    let minX: number = Number.POSITIVE_INFINITY
    let minY: number = Number.POSITIVE_INFINITY
    let maxX: number = Number.NEGATIVE_INFINITY
    let maxY: number = Number.NEGATIVE_INFINITY
    
    let i = 1;
    for (let key of this.keyboard.keys) {
      models["switch" + i] = new KeyCutouts(key, plateParameters);

      let tMinX = (key.x)*plateParameters.horizontalKeySpacing
      let tMaxX = (key.x+key.width)*plateParameters.horizontalKeySpacing
      let tMinY = (key.y)*plateParameters.verticalKeySpacing
      let tMaxY = (key.y+key.height)*plateParameters.verticalKeySpacing
      if (tMinX<minX) minX=to3dp(tMinX);
      if (tMaxX>maxX) maxX=to3dp(tMaxX);
      if (tMinY<minY) minY=to3dp(tMinY);
      if (tMaxY>maxY) maxY=to3dp(tMaxY);

      i++;  
    }


    // Draw outer boundaries
    let upperLeft =  [minX, maxY*-1]
    let upperRight = [maxX, maxY*-1]
    let lowerLeft =  [minX, minY*-1]
    let lowerRight = [maxX, minY*-1]
    var boundingBox = {
        paths: {
            lineTop: new makerjs.paths.Line(upperLeft, upperRight),
            lineBottom: new makerjs.paths.Line(lowerLeft, lowerRight),
            lineLeft: new makerjs.paths.Line(upperLeft, lowerLeft),
            lineRight: new makerjs.paths.Line(upperRight, lowerRight)
        }
    }

    models["BoundingBox0"] = boundingBox
  
    if (plateParameters.combineOverlaps) {
      let combinedModel = makerjs.cloneObject(models["switch1"]);
      for (let i = 2; i <= this.keyboard.keys.length; i++) {
        console.log(`Combining models: Switch ${i}`);
        combinedModel = makerjs.model.combineUnion(
          combinedModel,
          models["switch" + i],
        );
      }
      this.models = {
        plate: combinedModel,
        outline: boundingBox
      };
    } else {
      this.models = models;
    }
  }
}

export default SwitchPlate;

let to3dp = (n: number) => {
  return Math.round(n * 1000)/1000 
}