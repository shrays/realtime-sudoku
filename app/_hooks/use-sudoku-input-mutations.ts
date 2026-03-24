"use client"

import { LiveList, LiveObject } from "@liveblocks/client"
import { useMutation } from "@liveblocks/react/suspense"
import { useContext } from "react"
import { NotesContext } from "@/app/_context/notes-context"
import { TableCellContext } from "@/app/_context/table-cell-context"

type SelectNumProps = {
  numPad: number | null
  index: number | null
}

export function useSudokuInputMutations() {
  const { onClickTableCell } = useContext(TableCellContext)

  const erase = useMutation(({ storage }, index: number) => {
    if (index === null) return

    const sudoku = storage.get("sudoku")
    const undoHistory = storage.get("undoHistory")

    if (sudoku.get(index)?.get("immutable") === true) return

    let currentValue = sudoku?.get(index)?.get("value")
    if (currentValue === undefined) return

    if (typeof currentValue === "object" && currentValue !== null) {
      currentValue = currentValue.clone()
    }

    const history = new LiveObject<HistoryStack>({
      index,
      valueBefore: currentValue,
      valueAfter: 0,
      mode: "erase"
    })
    undoHistory.push(history)

    sudoku.get(index)?.update({
      value: 0,
      valid: false
    })
  }, [])

  const selectNum = useMutation(
    ({ storage }, { numPad, index }: SelectNumProps) => {
      if (index === null || numPad === null) return
      const sudoku = storage?.get("sudoku")

      if (sudoku.get(index)?.get("immutable") === true) {
        return
      }
      onClickTableCell({ value: numPad, index })

      let currentValue = sudoku?.get(index)?.get("value")

      if (currentValue === undefined || currentValue === null) return

      if (currentValue === numPad) {
        sudoku.get(index)?.set("value", 0)
        return
      }

      const redoHistory = storage.get("redoHistory")
      const undoHistory = storage.get("undoHistory")

      if (redoHistory.length > 0) {
        redoHistory.clear()
      }

      const cell = sudoku.get(index!)
      const valid = cell?.get("key") === numPad

      if (!valid) {
        storage.set("mistakeCount", storage.get("mistakeCount") + 1)
      }

      cell?.update({ value: numPad, valid })

      const isGameSolved = sudoku.every((cell) => cell.get("valid") === true)

      if (isGameSolved) {
        storage.update({ isSolved: true, isRunning: false })
      }

      if (typeof currentValue === "object") {
        currentValue = currentValue.clone()
      }

      const history = new LiveObject<HistoryStack>({
        index,
        valueBefore: currentValue,
        valueAfter: numPad,
        mode: "default"
      })

      undoHistory.push(history)
    },
    []
  )

  const addNotes = useMutation(
    ({ storage }, { index, numPad }: { index: number; numPad: number }) => {
      if (index === null) return

      const sudoku = storage.get("sudoku")
      if (sudoku.get(index)?.get("immutable") === true) {
        return
      }

      const undoHistory = storage.get("undoHistory")

      const cell = sudoku.get(index)

      if (cell?.get("valid") === true) {
        cell.set("valid", false)
      }

      const value = cell?.get("value")
      if (value === undefined) return

      if (typeof value === "object" && value !== null) {
        const after = [...value?.toImmutable()]

        const currentValue = value?.get(numPad - 1)
        if (currentValue === undefined) return

        after[numPad - 1] = currentValue > 0 ? 0 : numPad
        const history = new LiveObject<HistoryStack>({
          index,
          valueBefore: value?.clone(),
          valueAfter: new LiveList(after),
          mode: "notes"
        })
        undoHistory.push(history)
        value.set(numPad - 1, currentValue > 0 ? 0 : numPad)
        return
      }

      const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0]
      arr[numPad - 1] = numPad
      cell?.set("value", new LiveList(arr))

      const history = new LiveObject<HistoryStack>({
        index,
        valueBefore: value,
        valueAfter: new LiveList(arr),
        mode: "notes"
      })

      undoHistory.push(history)
    },
    []
  )

  return { erase, selectNum, addNotes }
}
