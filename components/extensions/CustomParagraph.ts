import { Extension } from "@tiptap/core";

export const CustomParagraph = Extension.create({
  name: "paragraph",

  group: "block",
  content: "inline*",

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement("div");
      wrapper.className =
        "group relative flex items-start gap-3 py-1 -mx-8 px-8 hover:bg-gray-50 rounded-lg";

      // --- Drag handle (works automatically with DragHandle extension) ---
      const dragHandle = document.createElement("div");
      dragHandle.className =
        "opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mt-1";
      dragHandle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2">
          <circle cx="8" cy="8" r="2"/>
          <circle cx="16" cy="8" r="2"/>
          <circle cx="8" cy="16" r="2"/>
          <circle cx="16" cy="16" r="2"/>
        </svg>
      `;

      // --- Plus button ---
      const plusButton = document.createElement("button");
      plusButton.textContent = "+";
      plusButton.className =
        "opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all";

      plusButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const pos = getPos() + node.nodeSize;
        editor.commands.insertContentAt(pos, { type: "paragraph" });
      });

      // --- Content container ---
      const content = document.createElement("div");
      content.className = "flex-1 min-w-0";

      wrapper.appendChild(dragHandle);
      wrapper.appendChild(content);
      wrapper.appendChild(plusButton);

      return {
        dom: wrapper,
        contentDOM: content,
      };
    };
  },
});
