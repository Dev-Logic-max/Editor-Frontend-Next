// components/services/TableInsertModal.tsx
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { X, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import '../../styles/editor.css';

interface TableInsertModalProps {
    editor: Editor | null;
    isOpen: boolean;
    onClose: () => void;
}

export function TableInsertModal({ editor, isOpen, onClose }: TableInsertModalProps) {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });

    const maxRows = 10;
    const maxCols = 10;

    const handleInsertTable = () => {
        if (!editor) return;

        editor
            .chain()
            .focus()
            .insertTable({ rows, cols, withHeaderRow: true })
            .run();

        toast.success(`✅ Inserted ${rows}x${cols} table!`);
        onClose();

        // Reset
        setRows(3);
        setCols(3);
        setHoveredCell({ row: 0, col: 0 });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TableIcon className="h-5 w-5 text-purple-600" />
                        Insert Table
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Visual Grid Selector */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            Click to select table size: <strong className="text-purple-600">{rows} × {cols}</strong>
                        </p>
                        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
                                {Array.from({ length: maxRows }).map((_, rowIndex) =>
                                    Array.from({ length: maxCols }).map((_, colIndex) => (
                                        <motion.div
                                            key={`${rowIndex}-${colIndex}`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onMouseEnter={() => {
                                                setHoveredCell({ row: rowIndex + 1, col: colIndex + 1 });
                                            }}
                                            onClick={() => {
                                                // ✅ FIX: Click to select
                                                setRows(rowIndex + 1);
                                                setCols(colIndex + 1);
                                                setHoveredCell({ row: rowIndex + 1, col: colIndex + 1 });
                                            }}
                                            className={`
              w-6 h-6 border-2 rounded cursor-pointer transition-all
              ${rowIndex < rows && colIndex < cols
                                                    ? 'bg-purple-400 border-purple-600'
                                                    : rowIndex < hoveredCell.row && colIndex < hoveredCell.col
                                                        ? 'bg-purple-200 border-purple-400'
                                                        : 'bg-white border-gray-300 hover:border-purple-300'
                                                }
            `}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Manual Input */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Rows</label>
                            <input
                                type="number"
                                min="1"
                                max={maxRows}
                                value={rows}
                                onChange={(e) => {
                                    const val = Math.min(maxRows, Math.max(1, parseInt(e.target.value) || 1));
                                    setRows(val);
                                }}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                autoFocus={false}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Columns</label>
                            <input
                                type="number"
                                min="1"
                                max={maxCols}
                                value={cols}
                                onChange={(e) => {
                                    const val = Math.min(maxCols, Math.max(1, parseInt(e.target.value) || 1));
                                    setCols(val);
                                }}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                            <strong>💡 Tip:</strong> The first row will be a header row.
                            You can add/remove rows and columns later using the table menu.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInsertTable}
                            className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                            <TableIcon className="h-4 w-4 mr-2" />
                            Insert Table
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}