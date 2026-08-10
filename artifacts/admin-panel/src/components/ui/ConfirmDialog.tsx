import * as React from "react"
import { Modal } from "./Modal"

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, description: string, confirmText?: string, cancelText?: string, isDanger?: boolean }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-4">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
          {cancelText}
        </button>
        <button type="button" onClick={() => { onConfirm(); onClose(); }} className={`px-4 py-2 rounded-md text-sm font-medium text-white ${isDanger ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}>
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
