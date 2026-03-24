"use client"

import { useStorage } from "@liveblocks/react/suspense"
import { useContext, useEffect } from "react"
import { NotesContext } from "@/app/_context/notes-context"
import { TableCellContext } from "@/app/_context/table-cell-context"
import { useSudokuInputMutations } from "@/app/_hooks/use-sudoku-input-mutations"

function isTextInputTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === "TEXTAREA" || tag === "SELECT") return true
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type
    if (
      type === "button" ||
      type === "checkbox" ||
      type === "radio" ||
      type === "submit" ||
      type === "reset" ||
      type === "file"
    ) {
      return false
    }
    return true
  }
  return false
}

export function SudokuKeyboard() {
  const { tableCell, onClickTableCell } = useContext(TableCellContext)
  const { notesMode } = useContext(NotesContext)
  const isRunning = useStorage((root) => root.isRunning)
  const isSolved = useStorage((root) => root.isSolved)
  const sudoku = useStorage((root) => root.sudoku)
  const { erase, selectNum, addNotes } = useSudokuInputMutations()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextInputTarget(e.target)) return

      if (e.key === "Escape") {
        if (tableCell.index !== null) {
          e.preventDefault()
          onClickTableCell({ value: null, index: null })
        }
        return
      }

      if (!isRunning || isSolved) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const index = tableCell.index

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        if (index === null) return
        e.preventDefault()
        const row = Math.floor(index / 9)
        const col = index % 9
        let newRow = row
        let newCol = col
        switch (e.key) {
          case "ArrowUp":
            if (row > 0) newRow--
            break
          case "ArrowDown":
            if (row < 8) newRow++
            break
          case "ArrowLeft":
            if (col > 0) newCol--
            break
          case "ArrowRight":
            if (col < 8) newCol++
            break
        }
        const newIndex = newRow * 9 + newCol
        if (newIndex === index) return
        const { value } = sudoku[newIndex]
        onClickTableCell({ value: value ?? null, index: newIndex })
        return
      }

      if (index === null) return

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault()
        erase(index)
        return
      }

      if (e.key.length !== 1 || e.key < "1" || e.key > "9") return

      const numPad = Number.parseInt(e.key, 10)
      e.preventDefault()
      if (notesMode) {
        addNotes({ numPad, index })
      } else {
        selectNum({ numPad, index })
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    isRunning,
    isSolved,
    tableCell,
    notesMode,
    sudoku,
    onClickTableCell,
    erase,
    selectNum,
    addNotes
  ])

  return null
}
