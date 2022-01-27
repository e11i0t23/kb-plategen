import React, { useState } from 'react'
import Blueprint from 'react-blueprint-svg'
import makerjs from 'makerjs'
import FileSaver from 'file-saver'
import { KeyLike } from 'crypto'
import * as kle from "../KLESerial";
import LineTo, {Line} from 'react-lineto';
import { type } from 'os'
import { act } from 'react-dom/test-utils'
import { pcbGen } from '../pcb-gen/pcbGen'
import SwitchPlate from '../maker_models/SwitchPlate'
import PlateParameters from '../PlateParameters'



interface Props {
  switchPlate: SwitchPlate
  plateParameters: PlateParameters
}

const PcbViewer = ({ switchPlate, plateParameters }: Props) => {
  const keyboard = switchPlate.keyboard
  const [activeKey, setActive] = useState(0);
  const [currentCol, setCol] = useState(0);
  const [currentRow, setRow] = useState(0);

  const handleColChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    keyboard.keys[activeKey].col=parseInt(event.target.value)
    setCol(parseInt(event.target.value))
  }
  const handleRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    keyboard.keys[activeKey].row=parseInt(event.target.value)
    setRow(parseInt(event.target.value))
  }
  
  const handleActive = (key: kle.Key) => {
    setActive(key.id)
    setCol(key.col)
    setRow(key.row)
  }

  return(
  <div className="pcb-viewer">
    
    {keyboard.keys.map((key) => {
      return <div>
                <div className="key" id={`${key.id}`} style={{
                              "width": key.width*50, 
                              "height":key.height*50, 
                              "top": (key.pcb_y*50),
                              "left": (key.pcb_x*50),
                              "borderColor": activeKey==key.id ? "black" : "white",
                              "transform": `rotate(${key.rotation_angle}deg)`
                            }}
                      onClick={() => handleActive(key)}>
                </div>
                <div className={`dot-${key.id}`} style={{
                              "height": 10,
                              "width":10,
                              "position": "absolute",
                              "backgroundColor": "black",
                              "borderRadius": "50%",
                              "zIndex": 10,
                              "top": ((key.pcb_y*50)+(key.height*50/2)),
                              "left": ((key.pcb_x*50)+(key.width*50/2))
                          }}
                          onClick={() => handleActive(key)}>
                </div>
              </div>
    })}
    <div className='container'>
    {/* {toPoints(keyboard).map((line) => {
      return <Line x0={line.x0} y0={line.y0} x1={line.x1} y1={line.y1} within={'pcb-viewer'} delay={100}/>
    })} */}
    </div>

    {toPoints(keyboard).map((line) => {
      return <LineTo  from={`dot-${line.id1}`} to={`dot-${line.id2}`} 
                      within={'pcb-viewer'} 
                      delay={1} 
                      borderColor={line.row ? 'red' : 'green'}
                      borderWidth={line.id1== activeKey || line.id2==activeKey ? 3:1 }/>
    })}
    <button className="ui primary button" onClick={(e) => pcbGen(plateParameters, switchPlate)}>
      <i className="download icon" />
      Download SCHEM
    </button>
  <div className='row'>
    <h4>Key:</h4>
    <input
      type="number"
      step="1"
      name="keyID"
      value={activeKey}
    />
    <h4>Row:</h4>
    <input
      type="number"
      step="1"
      name="row"
      value={currentRow}
      onChange={(e)=>{handleRowChange(e)}}
    />
    <h4>Col:</h4>
    <input
      type="number"
      step="1"
      name="col"
      value={currentCol}
      onChange={(e)=>{handleColChange(e)}}
    />
  </div>


  </div>
)}
// type points = {
//   x0: number;
//   y0: number;
//   x1: number;
//   y1: number;
// }

type points = {
  id1: number;
  id2: number;
  row: boolean;
}

function toPoints(kb: kle.Keyboard): points[]{
  kb.keys.forEach((key) => console.log(key.id, key.col, key.row))
  let lines: points[] = []
  var rows = [...new Set(kb.keys.map(key => key.row))].sort();
  var rowKeys = rows.map(row => kb.keys.filter(key => {return key.row === row}))
  //rows.forEach(row => rowKeys.push(kb.keys.filter(key => {return key.row === row})))
  console.log(rowKeys)
  for(let row of rows){
    var keys = kb.keys.filter(key => {
      return key.row === row
    })
    if (keys.length>1){
      for (let i = 0; i < keys.length-1; i++) {
        let keya = keys[i];
        let keyb = keys[i+1];
        //console.log(keya)
        //console.log(keyb)
//        lines.push({x0:((keya.x*50)+(keya.width*50/2)), y0:((keya.y*50)+(keya.height*50/2)), x1:((keyb.x*50)+(keyb.width*50/2)), y1:((keyb.y*50)+(keyb.height*50/2))})
          lines.push({id1: keya.id, id2: keyb.id, row:true})
      }
    }
  }
  var cols = [...new Set(kb.keys.map(key => key.col))];
  for(let col of cols){
    var keys = kb.keys.filter(key => {
      return key.col === col
    })
    if (keys.length>1){
      for (let i = 0; i < keys.length-1; i++) {
        let keya = keys[i];
        let keyb = keys[i+1];
        //console.log(keya)
        //console.log(keyb)
//        lines.push({x0:((keya.x*50)+(keya.width*50/2)), y0:((keya.y*50)+(keya.height*50/2)), x1:((keyb.x*50)+(keyb.width*50/2)), y1:((keyb.y*50)+(keyb.height*50/2))})
          lines.push({id1: keya.id, id2: keyb.id, row:false})
      }
    }
  }
  console.log(lines)
  return lines;
}

export default PcbViewer
