import React, { useRef, useState } from 'react';
import '@/styles/battleship.css'

/* ################################# Types ################################## */

type CellStatus = "empty" | "ship" | "hit" | "miss" | keyof ShipMap

type ShipMap = {
  carrier?: [number, number, number, number, number];
  battleship?: [number, number, number, number];
  destroyer?: [number, number, number];
  submarine?: [number, number, number];
  patrol?: [number, number];
  enemy?: [number, number];
};

type CellProps = {
  key: string;
  val: CellStatus;
  onCellClick: () => void;
};

type BoardProps = {
  isPlaying: boolean;
  boardState: CellStatus[];
  shipsRef: React.RefObject<ShipMap>;
  boardSetter: React.Dispatch<React.SetStateAction<CellStatus[]>>;
  turnSwitch: (() => void);
  hpSetter: ((sd: boolean) => void)
};

type HealthProps = {
  hp: number;
};

/* ################################# Utils ################################## */

const createBoard = (ships: ShipMap) => {
  let board = Array<CellStatus>(100).fill("empty");
  for (const ship of Object.values(ships)) {
    for (const index of ship) {
      board[index] = "ship";
    }
  }
  return board;
}

const toTup = (n: number) => [n / 10, n % 10];
const toInd = (i: number, j: number) => i * 10 + j;

/* ###################### Battleship board components ####################### */

const Board = ({isPlaying, boardState, shipsRef, boardSetter, hpSetter, turnSwitch}: BoardProps) => {
  function handleClick(index: number) {
    const nextCells = boardState.map(val => val)
    if (nextCells[index] === "ship") {
      nextCells[index] = "hit";
      sinkCheck: for (const [ship, coords] of Object.entries(shipsRef.current)) {
        if (!coords.includes(index)) {continue}
        for (const shipInd of coords)
          if (nextCells[shipInd] !== "hit") {break sinkCheck}
        for (const shipInd of coords)
          nextCells[shipInd] = ship as keyof ShipMap;
        delete shipsRef.current[ship as keyof ShipMap];
        hpSetter(ship === "enemy");
        break;
      }
    }
    else nextCells[index] = "miss";

    boardSetter(nextCells);
    turnSwitch();
  };

  let boardComponents: React.JSX.Element[] = [];
  for (let i = 0; i < 10; i++) {
    const row: CellStatus[] = boardState.slice(toInd(i,0), toInd(i+1,0));
    const rowComponents = row.map((value, j) => (
      <Cell
        key={"cell-" + i + j}
        val={value}
        onCellClick={ () => handleClick(toInd(i, j)) }
      />))
    boardComponents.push(<div key={"row-" + i} className='board-row'>{rowComponents}</div>);
  }

  return <fieldset disabled={isPlaying}>{boardComponents}</fieldset>
}

const Cell = ({val, onCellClick}: CellProps) => {
  let mark: string = "X";
  let color = "bg-blue-600";
  if (val === "empty" || val == "ship")
    mark = "";
  else if (val === "miss")
    mark = "~";
  else
    mark = "X";

  switch (val) {
    case 'empty':
    case 'ship':
      mark = "";
      break;
    case 'miss':
      mark = "~";
      break;
    case 'carrier':
    case 'battleship':
    case 'destroyer':
    case 'submarine':
    case 'patrol':
      color = "bg-green-600";
      break;
    case 'enemy':
      color = "bg-red-600";
  }
  const isDisabled = mark !== "";
  return (
    <div className='board-cell'>
      <button
        className={"board-button disabled:opacity-85 hover:enabled:bg-amber-300 " + color}
        onClick={onCellClick}
        disabled={isDisabled}
      >{mark}</button>
    </div>
  );
}

const Health = ({hp}: HealthProps) => {
  let segments: React.JSX.Element[] = [];
  for (let i=0; i < hp; i++)
    segments.push(<div key={'hp-' + i} className='inline'>❤️</div>)
  for (let i=hp; i < 5; i++)
    segments.push(<div key={'hp-' + i} className='inline'>🖤</div>)
  return (
    <div className='text-center'>
      {segments}
    </div>
  )
}

const Battleship = () => {
  let shipsA = useRef<ShipMap>({
    carrier: [0, 1, 2, 3, 4],
    battleship: [62, 72, 82, 92],
    destroyer: [53, 54, 55],
    submarine: [21, 31, 41],
    patrol: [89, 99],
    enemy: [20, 30]
  });
  let shipsB = useRef<ShipMap>({
    carrier: [55, 56, 57, 58, 59],
    battleship: [1, 11, 21, 31],
    destroyer: [76, 77, 78],
    submarine: [50, 51, 52],
    patrol: [88, 89],
    enemy: [65, 66]
  });

  const [turnA, setTurnA] = useState(true);
  const [cellsA, setCellsA] = useState<CellStatus[]>(createBoard(shipsA.current));
  const [cellsB, setCellsB] = useState<CellStatus[]>(createBoard(shipsB.current));
  const [hp, setHp] = useState<[number,number]>([5,5]);

  const decreaseHP = (player: "A" | "B", sd: boolean) => {
    let [hpA, hpB] = hp;
    if ((player === "A" && !sd) || (player === "B" && sd))
      hpB--;
    else
      hpA--;
    setHp([hpA, hpB]);
  }

  const changeTurn = () => setTurnA(!turnA);
  
  return (
    <div className="battleship-local">
      <div style={{gridArea:'hd'}}></div>
      <div style={{gridArea:'ls'}}>
        <h2></h2>
      </div>
      <div style={{gridArea:'b1'}}>
        <h3 className="text-emerald-500 text-center">[USER]</h3>
        <Health hp={hp[0]}/>
        <Board
          isPlaying={!turnA}
          boardState={cellsA}
          shipsRef={shipsA}
          boardSetter={setCellsA}
          hpSetter={(sd: boolean) => decreaseHP("A", sd)}
          turnSwitch={changeTurn}
        />
      </div>
      <div style={{gridArea:'md'}}></div>
      <div style={{gridArea:'b2'}}>
        <h3 className="text-emerald-500 text-center">Guest</h3>
        <Health hp={hp[1]}/>
        <Board
          isPlaying={turnA}
          boardState={cellsB}
          shipsRef={shipsB}
          boardSetter={setCellsB}
          hpSetter={(sd: boolean) => decreaseHP("B", sd)}
          turnSwitch={changeTurn}
        />
      </div>
      <div style={{gridArea:'rs'}}></div>
    </div>
  )
}

export default Battleship;