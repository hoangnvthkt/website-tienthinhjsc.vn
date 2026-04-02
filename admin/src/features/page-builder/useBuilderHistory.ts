import { useState, useCallback, useEffect, useRef } from 'react'

const MAX_HISTORY = 50

/**
 * Undo/Redo hook for Page Builder
 * 
 * Usage:
 *   const { state, setState, undo, redo, canUndo, canRedo } = useBuilderHistory(initialSections)
 *   
 * Keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z) are auto-registered.
 */
export function useBuilderHistory<T>(initialState: T) {
  const [state, setInternalState] = useState<T>(initialState)
  const undoStack = useRef<T[]>([])
  const redoStack = useRef<T[]>([])
  const isUndoRedo = useRef(false)
  const initialized = useRef(false)

  // Initialize with first state (only once)
  useEffect(() => {
    if (!initialized.current) {
      setInternalState(initialState)
      undoStack.current = []
      redoStack.current = []
      initialized.current = true
    }
  }, [initialState])

  // Push state change to history
  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false
      return
    }

    setInternalState(prev => {
      const next = typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState

      // Push current state to undo stack
      undoStack.current = [...undoStack.current.slice(-(MAX_HISTORY - 1)), prev]
      // Clear redo stack on new change
      redoStack.current = []

      return next
    })
  }, [])

  const canUndo = undoStack.current.length > 0
  const canRedo = redoStack.current.length > 0

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return

    const prev = undoStack.current[undoStack.current.length - 1]
    undoStack.current = undoStack.current.slice(0, -1)

    setInternalState(current => {
      redoStack.current = [...redoStack.current, current]
      return prev
    })
    
    isUndoRedo.current = true
  }, [])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return

    const next = redoStack.current[redoStack.current.length - 1]
    redoStack.current = redoStack.current.slice(0, -1)

    setInternalState(current => {
      undoStack.current = [...undoStack.current, current]
      return next
    })

    isUndoRedo.current = true
  }, [])

  // Reset history (e.g., after save)
  const resetHistory = useCallback(() => {
    undoStack.current = []
    redoStack.current = []
  }, [])

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (modKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if (modKey && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    historyCount: undoStack.current.length,
  }
}
