import makerjs from "makerjs";
import CenteredRoundRectangle from "./CenteredRoundRectangle";
import * as kle from "./KLESerial";

class Point {
  constructor(public x: number, public y: number) {}
}

enum SwitchCutoutType {
  MX,
  Alps,
  MX_Alps,
  MX_Opening,
}

class Switch implements makerjs.IModel {
  public origin: makerjs.IPoint;
  public models: makerjs.IModelMap = {};
  public paths: makerjs.IPathMap = {};
  private xSpacing: number = 19.05;
  private ySpacing: number = 19.05;

  constructor(key: kle.Key) {
    this.origin = this.absoluteCenter(key);
    let switchCutoutModel = this.switchCutout(SwitchCutoutType.MX);
    let switchOutlineModel = this.switchOutline(key);
    if (key.rotation_angle !== 0) {
      makerjs.model.rotate(switchCutoutModel, -key.rotation_angle);
      makerjs.model.rotate(switchOutlineModel, -key.rotation_angle);
    }

    this.models = {
      switchCutout: switchCutoutModel,
      outline: switchOutlineModel,
    };
    // TODO: Add stab and acoustic cutouts here
  }

  switchCutout(
    cutoutType: SwitchCutoutType,
    radius: number = 0.5,
  ): makerjs.IModel {
    switch (cutoutType) {
      case SwitchCutoutType.MX:
        return new CenteredRoundRectangle(14, 14, radius);
      case SwitchCutoutType.Alps:
        return new CenteredRoundRectangle(15.5, 12.8, radius);
      default:
        return new CenteredRoundRectangle(14, 14, radius);
    }
  }

  switchOutline(key: kle.Key): makerjs.IModel {
    return new CenteredRoundRectangle(
      this.xSpacing * key.width,
      this.ySpacing * key.height,
      2,
    );
  }

  center(key: kle.Key): Point {
    let centerX = key.x + key.width / 2;
    let centerY = key.y + key.height / 2;

    if (key.rotation_angle === 0) {
      return new Point(centerX, centerY);
    }

    let newCenter = makerjs.point.rotate(
      [centerX, centerY],
      key.rotation_angle,
      [key.rotation_x, key.rotation_y],
    );
    return new Point(newCenter[0], newCenter[1]);
  }

  absoluteCenter(key: kle.Key): makerjs.IPoint {
    let center = this.center(key);
    return [center.x * this.xSpacing, center.y * -this.ySpacing];
  }
}

export default Switch;
