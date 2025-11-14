import { updateDocument } from '@/lib/api/documents';
import { debounce } from 'lodash';

// export const debouncedSave = debounce(async (editor: any, docId: string, userId: string, updateFn: any) => {
//   if (!editor.isEmpty && editor.isFocused) {
//     const json = editor.getJSON();
//     await updateFn(docId, { content: json });
//   }
// }, 3000);

export const debouncedSave = debounce(async (updateFn: () => Promise<void>) => {
  await updateFn();
}, 3000);

// export const debouncedUpdate = debounce(async (docId: string, data: any) => {
//   try {
//     await updateDocument(docId, data);
//   } catch (error) {
//     throw error;  // Handled in caller
//   }
// }, 3000);