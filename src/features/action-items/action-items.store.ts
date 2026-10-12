import { create } from "zustand";
import { isSameDropTarget, type BoardDropTarget } from "./utils/board-dnd";

type ActionItemsState = {
  /** The card being dragged on the board; null while none is. */
  draggedId: string | null;
  /** Where that card would land, which the cards and columns draw; null for nowhere new. */
  dropTarget: BoardDropTarget | null;
  setDraggedId: (id: string | null) => void;
  setDropTarget: (target: BoardDropTarget | null) => void;
};

export const useActionItemsStore = create<ActionItemsState>()((set) => ({
  draggedId: null,
  dropTarget: null,
  setDraggedId: (id) => set({ draggedId: id, dropTarget: null }),
  // A drag reports every move; only a new place re-renders the cards that draw it.
  setDropTarget: (target) =>
    set((state) => (isSameDropTarget(state.dropTarget, target) ? state : { dropTarget: target })),
}));
