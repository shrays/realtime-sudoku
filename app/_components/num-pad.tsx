"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/shadcn/button"
import { useStorage } from "@liveblocks/react/suspense"
import confetti from "canvas-confetti"
import { Delete } from "lucide-react"
import { useContext } from "react"
import { NotesContext } from "../_context/notes-context"
import { TableCellContext } from "../_context/table-cell-context"
import { useSudokuInputMutations } from "../_hooks/use-sudoku-input-mutations"
import { DeleteButton } from "./delete-button"

export const Numpad = () => {
  const { tableCell, onClickTableCell } = useContext(TableCellContext)
  const { notesMode } = useContext(NotesContext)

  const isRunning = useStorage((root) => root.isRunning)
  const isSolved = useStorage((root) => root.isSolved)

  const { erase, selectNum, addNotes } = useSudokuInputMutations()

  if (isSolved) {
    const end = Date.now() + 3 * 1000 // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]

    const frame = () => {
      if (Date.now() > end) return

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors
      })

      requestAnimationFrame(frame)
    }
    frame()
  }

  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((numPad, index) => (
        <Button
          disabled={!isRunning || isSolved}
          variant="secondary"
          key={index}
          className="aspect-square size-full rounded p-2 text-center sm:font-medium md:size-14 md:text-lg"
          onClick={() => {
            if (notesMode) {
              addNotes({ numPad, index: tableCell.index! })
              return
            }
            selectNum({ numPad, index: tableCell.index })
          }}
        >
          <p
            className={cn("transition-all duration-200 ease-in-out", {
              "md:text-xs ": notesMode
            })}
          >
            {numPad}
          </p>
        </Button>
      ))}
      <DeleteButton
        disabled={!isRunning || isSolved}
        variant="secondary"
        className="hidden aspect-square size-14 rounded p-2 text-center sm:flex"
      >
        <Delete onClick={() => erase(tableCell.index!)} />
      </DeleteButton>
    </>
  )
}
