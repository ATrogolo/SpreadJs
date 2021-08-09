import { PaperProps } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import React from 'react'
import Draggable from 'react-draggable'

export function DraggableComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  )
}
