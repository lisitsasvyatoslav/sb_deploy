import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { EditorView } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const plusButtonPluginKey = new PluginKey('plusButton');

/**
 * Renders a "+" button to the left of every paragraph on hover.
 * Clicking the button triggers a callback (e.g. to open an attachment menu).
 */
export const PlusButtonExtension = Extension.create({
  name: 'plusButton',

  addProseMirrorPlugins() {
    const editor = this.editor;

    function buildDecorations(
      doc: ProseMirrorNode,
      menuOpenAtPos: number | null
    ): DecorationSet {
      const decorations: Decoration[] = [];

      doc.descendants((node: ProseMirrorNode, pos: number) => {
        if (node.type.name !== 'paragraph') {
          return;
        }

        const widget = Decoration.widget(
          pos + 1,
          (view: EditorView) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className =
              'plus-button-widget' +
              (menuOpenAtPos === pos ? ' plus-button-widget--active' : '');
            button.setAttribute('aria-label', 'Add attachment');
            button.contentEditable = 'false';
            button.textContent = '+';
            button.addEventListener('mousedown', (e) => {
              e.preventDefault();
              e.stopPropagation();

              const rect = button.getBoundingClientRect();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const st = (editor.storage as any)?.plusButton;
              if (st) {
                st.open = true;
                st.menuOpenAtPos = pos;
                st.x = rect.right + 8;
                st.y = rect.bottom + 4;
              }
              view.dispatch(
                view.state.tr.setMeta(plusButtonPluginKey, {
                  open: true,
                })
              );
            });

            return button;
          },
          {
            side: -1,
            key: `plus-${pos}`,
          }
        );

        decorations.push(widget);
      });

      return DecorationSet.create(doc, decorations);
    }

    return [
      new Plugin({
        key: plusButtonPluginKey,
        state: {
          init(_: unknown, state: EditorState) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const storage = (editor.storage as any)?.plusButton;
            const menuOpenAtPos = storage?.menuOpenAtPos ?? null;
            return buildDecorations(state.doc, menuOpenAtPos);
          },
          apply(
            tr: Transaction,
            oldDecorations: DecorationSet,
            _oldState: EditorState,
            newState: EditorState
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const storage = (editor.storage as any)?.plusButton;
            const menuOpenAtPos = storage?.menuOpenAtPos ?? null;

            const meta = tr.getMeta(plusButtonPluginKey);
            const menuClose = tr.getMeta('plusMenuClose');

            // Rebuild on doc changes or menu open/close
            if (tr.docChanged || meta || menuClose) {
              return buildDecorations(newState.doc, menuOpenAtPos);
            }

            return oldDecorations;
          },
        },
        props: {
          decorations(state: EditorState) {
            return plusButtonPluginKey.getState(state);
          },
        },
      }),
    ];
  },

  addStorage() {
    return {
      open: false,
      menuOpenAtPos: null as number | null,
      x: 0,
      y: 0,
    };
  },
});
