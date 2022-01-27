import FileSaver from "file-saver";
import { Key } from "../KLESerial";
import SwitchPlate from "../maker_models/SwitchPlate";
import PlateParameters from "../PlateParameters";
import { getKeysize, getSwitch } from "./Switches";

type pcbScript = {
  schem: string[]
  brd: string[]
}

var keysizes = {
  1: "1U",
  1.25: "1U",
  1.5: "1U",
  1.75: "1U",
  2: "2U",
  2.25: "2U",
  2.5: "2U",
  2.75: "2U",
  6.25: "6.25U",
  7: "7U",
}

export const pcbGen = (p: PlateParameters, s: SwitchPlate) => {

  var keys = s.keyboard.keys

  var pcbScript: pcbScript = {
    schem: ['GRID ON;', 'GRID INCH 1 10;', 'GRID ALT INCH .1;', 'SET WIRE_BEND 2;'],
    brd: ['GRID ON;', 'GRID MM 1 10;', 'GRID ALT MM .1;', 'LAYER 16;']
  }

  var rows = [...new Set(keys.map(key => key.row))].sort();
  var rowKeys = rows.map(row => keys.filter(key => {return key.row === row}))
  
  var cols = [...new Set(keys.map(key => key.col))].sort();
  var colKeys = cols.map(col => keys.filter(key => {return key.col === col}))

  var ks = getSwitch(p)
  keys.forEach((k) => {
    
    //schematic control
    pcbScript.schem.push(`ADD ${ks.switch.footprint+getKeysize(k)}@Keyswitch KEY${k.id} (${k.col} ${-k.row*1.5});\n`);
    pcbScript.schem.push(`ADD ${ks.diode.footprint} D${k.id} R90 (${k.col+0.1} ${-k.row*1.5+0.6});\n`);


    let [key_x, key_y] = [(k.width/2+k.pcb_x)*p.horizontalKeySpacing, -(k.height/2+k.pcb_y)*p.verticalKeySpacing]
    console.log(k.pcb_x, key_x)
    pcbScript.brd.push(`MOVE KEY${k.id} (${key_x} ${key_y});\nROTATE R${-k.rotation_angle} KEY${k.id};`)
    if (ks.switch.mirror) pcbScript.brd.push(`MIRROR KEY${k.id};`)
    let [d_x, d_y] = [(key_x+ks.switch.smdDiodePos.x), (key_y+ks.switch.smdDiodePos.y)]
    pcbScript.brd.push(`MOVE D${k.id} (${d_x} ${d_y});\nROTATE R${ks.switch.smdDiodePos.r ? -k.rotation_angle+ks.switch.smdDiodePos.r : -k.rotation_angle} D${k.id};\nMIRROR D${k.id};\n`);
    pcbScript.brd.push(`WIRE 'N$${k.id+1}' 0.3 (${d_x+ks.diode.a.y} ${d_y+ks.diode.a.x}) (${key_x+ks.switch.mx2.x} ${key_y+ks.switch.mx2.y});\n`);
  })

  rowKeys.forEach((row) => {
    if ((row.length)>1){
      for (let i = 0; i < row.length-1; i++) {
        let keya = row[i];
        let keyb = row[i+1];
        let [keya_x, keya_y] = [(keya.width/2+keya.pcb_x)*p.horizontalKeySpacing, -(keya.height/2+keya.pcb_y)*p.verticalKeySpacing]
        let [da_x, da_y] = [(keya_x+ks.switch.smdDiodePos.x+ks.diode.c.y), (keya_y+ks.switch.smdDiodePos.y+ks.diode.c.x)]
        let [keyb_x, keyb_y] = [(keyb.width/2+keyb.pcb_x)*p.horizontalKeySpacing, -(keyb.height/2+keyb.pcb_y)*p.verticalKeySpacing]
        let [db_x, db_y] = [(keyb_x+ks.switch.smdDiodePos.x+ks.diode.c.y), (keyb_y+ks.switch.smdDiodePos.y+ks.diode.c.x)]
        pcbScript.schem.push(`NET 'ROW${keya.row}' (${keya.col+0.1} ${-keya.row*1.5+0.8}) (${keyb.col+0.1} ${-keyb.row*1.5+0.8});\nJUNCTION (${keyb.col+0.1} ${-keyb.row*1.5+0.8});\n`);
        pcbScript.brd.push(`LAYER 16;\nWIRE 'ROW${keya.row}' 0.3 (${da_x} ${da_y}) (${db_x} ${db_y});\n`);
      }
    }
  })
  colKeys.forEach((col) => {
    if ((col.length)>1){
      for (let i = 0; i < col.length-1; i++) {
        let keya = col[i];
        let keyb = col[i+1];
        let [keya_x, keya_y] = [(keya.width/2+keya.pcb_x)*p.horizontalKeySpacing+ks.switch.mx1.x, -(keya.height/2+keya.pcb_y)*p.verticalKeySpacing+ks.switch.mx1.y]
        let [keyb_x, keyb_y] = [(keyb.width/2+keyb.pcb_x)*p.horizontalKeySpacing+ks.switch.mx1.x, -(keyb.height/2+keyb.pcb_y)*p.verticalKeySpacing+ks.switch.mx1.y]
        pcbScript.schem.push(`NET 'COL${keya.col}' (${keya.col-0.4} ${-keya.row*1.5+0.1}) (${keyb.col-0.4} ${-keyb.row*1.5+0.1});\nJUNCTION (${keyb.col-0.4} ${-keyb.row*1.5+0.1});\n`);
        pcbScript.brd.push(`LAYER 1;\nWIRE 'COL${keya.col}' 0.3 (${keya_x} ${keya_y}) (${keyb_x} ${keyb_y});\n`);
      }
    }
  })








  const schemBlob = new Blob(pcbScript.schem, { type: 'text/plain;charset=utf-8' })
  FileSaver.saveAs(schemBlob, 'schematic.scr')
  const pcbBlob = new Blob(pcbScript.brd, { type: 'text/plain;charset=utf-8' })
  FileSaver.saveAs(pcbBlob, 'board.scr')

  return pcbScript
}