import React, { useEffect, useState } from 'react';
import '@/styles/battleship.css'

/* ################################# Types ################################## */

type CellStatus = "empty" | "ship" | "hit" | "miss"

type CellProps = {
  key: string;
  val: CellStatus;
  onCellClick: () => void;
};

type AwareCellProps = {
  
}

type BoardProps = {
  cellArr: CellStatus[][];
};

/* ###################### Battleship board components ####################### */

const Board = ({cellArr}: BoardProps) => {
  const [cells, setCells] = useState(cellArr);

  function handleClick(i: number, j: number) {
    const nextCells = cells.map((row) => row.map((cell) => cell));
    if (nextCells[i][j] === "ship") {
      // TODO: handle sunk ship detection
      nextCells[i][j] = "hit";
    }
    else nextCells[i][j] = "miss";

    setCells(nextCells);
  };

  let boardComponents: React.JSX.Element[] = [];
  for (let i = 0; i < 10; i++) {
    const row: CellStatus[] = cells[i];
    const rowComponents = row.map((value, j) => (<Cell
        key={"cell-" + i + j}
        val={value}
        onCellClick={ () => handleClick(i, j) }
      />))
    boardComponents.push(<div key={"row-" + i} className='board-row'>{rowComponents}</div>);
  }

  return <fieldset>{boardComponents}</fieldset>
}

const AwareCell = ({i, j, val, onCellClick}: AwareCellProps) => {

}

const Cell = ({val, onCellClick}: CellProps) => {
  // const buttonId = "cell-" + player + i + j;
  let mark: string = "";
  if (val === "hit")
    mark = "X";
  else if (val === "miss")
    mark = "~";

  const isDisabled = mark !== "";
  return (
    <div className='board-cell'>
      <button
        // id={buttonId}
        className="board-button"
        onClick={onCellClick}
        disabled={isDisabled}
      >{mark}</button>
    </div>
  );
}

const Battleship = () => {
  const init: CellStatus[][] = [
    ["ship", "ship", "ship", "ship", "empty", "ship", "ship", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "ship", "empty", "empty", "ship", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "ship", "empty", "empty", "ship", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "ship", "empty", "empty", "ship", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"]
  ];
  return (
    <div className="battleship-local">
      <div style={{gridArea:'hd'}}></div>
      <div style={{gridArea:'ls'}}>
        <h2></h2>
      </div>
      <div style={{gridArea:'b1'}}>
        <h3 className="text-emerald-500 text-center">BOARD A</h3>
        <Board cellArr={init} />
      </div>
      <div style={{gridArea:'md'}}></div>
      <div style={{gridArea:'b2'}}>
        <h3 className="text-emerald-500 text-center">BOARD B</h3>
        <Board cellArr={init} />
      </div>
      <div style={{gridArea:'rs'}}></div>
    </div>
  )
}

export default Battleship;