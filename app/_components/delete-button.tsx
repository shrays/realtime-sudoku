"use client"

import { Button, ButtonProps } from "@/shadcn/button"
import { ReactNode, useContext } from "react"
import { TableCellContext } from "../_context/table-cell-context"
import { useSudokuInputMutations } from "../_hooks/use-sudoku-input-mutations"

interface DeleteButtonProps extends ButtonProps {
  children: ReactNode
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  children,
  ...props
}) => {
  const { tableCell } = useContext(TableCellContext)

  const { erase } = useSudokuInputMutations()

  return (
    <Button {...props} onClick={() => erase(tableCell.index!)}>
      {children}
    </Button>
  )
}
