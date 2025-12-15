'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface AINotionStyleProps {
    editor: Editor | null;
    isActive: boolean;
    suggestedText: string;
    action: string;
    onAccept: () => void;
    onReject: () => void;
    onRetry?: () => void;
}

export function AINotionStyle({
    editor,
    isActive,
    suggestedText,
    action,
    onAccept,
    onReject,
    onRetry,
}: AINotionStyleProps) {
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
    const selectionRange = useRef<{ from: number; to: number } | null>(null);
    const originalText = useRef<string>('');
    const insertedPosition = useRef<{ from: number; to: number } | null>(null);

    // Store selection and original text when becoming active
    useEffect(() => {
        if (isActive && editor && suggestedText) {
            const { from, to } = editor.state.selection;
            //   selectionRange.current = { from, to };

            // IMPORTANT: Store original text BEFORE any operations
            const originalContent = editor.state.doc.textBetween(from, to, ' ');
            originalText.current = originalContent;
            selectionRange.current = { from, to };

            console.log('📝 Original text stored:', originalContent);

            // Delete selected text and insert AI suggestion
            editor
                .chain()
                .focus()
                .deleteRange({ from, to })
                .insertContentAt(from, suggestedText)
                .run();

            // Store the new position after insertion
            insertedPosition.current = {
                from: from,
                to: from + suggestedText.length
            };

            // Update button position
            setTimeout(() => updateButtonPosition(), 50);
        }
    }, [isActive, suggestedText, editor]);

    const updateButtonPosition = () => {
        if (!editor || !insertedPosition.current) return;

        try {
            const { view } = editor;
            const coords = view.coordsAtPos(insertedPosition.current.to);

            if (coords) {
                setCursorPosition({
                    top: coords.top + window.scrollY - 10,
                    left: coords.left + window.scrollX + 20,
                });
            }
        } catch (error) {
            console.error('Error updating button position:', error);
        }
    };

    const handleAccept = () => {
        if (!editor || !insertedPosition.current) return;

        try {
            // Just move cursor to end of suggestion and keep the text
            editor.commands.focus();
            editor.commands.setTextSelection(insertedPosition.current.to);

            toast('AI suggestion accepted!', {icon: '✨'});
            onAccept();
        } catch (error) {
            console.error('Error accepting suggestion:', error);
            toast.error('Failed to accept suggestion');
        }
    };

    const handleRejectV1 = () => {
        if (!editor || !insertedPosition.current || !selectionRange.current) return;

        try {
            // Delete the AI suggestion
            editor
                .chain()
                .focus()
                .deleteRange({
                    from: insertedPosition.current.from,
                    to: insertedPosition.current.to
                })
                .insertContentAt(insertedPosition.current.from, originalText.current)
                .run();

            toast('❌ AI suggestion rejected');
            onReject();
        } catch (error) {
            console.error('Error rejecting suggestion:', error);
            toast.error('Failed to reject suggestion');
        }
    };

    const handleReject = () => {
        if (!editor || !insertedPosition.current) return;

        try {
            const originalContent = originalText.current;
            const insertPos = insertedPosition.current;

            console.log('🔙 Restoring original text:', originalContent); // Debug log
            console.log('📍 Position:', insertPos); // Debug log

            // Delete the AI suggestion and restore original text
            editor
                .chain()
                .focus()
                .deleteRange({
                    from: insertPos.from,
                    to: insertPos.to
                })
                .insertContentAt(insertPos.from, originalContent)
                .setTextSelection(insertPos.from + originalContent.length)
                .run();

            toast('❌ AI suggestion rejected');
            onReject();
        } catch (error) {
            console.error('Error rejecting suggestion:', error);
            toast.error('Failed to reject suggestion');
        }
    };

    if (!isActive || !suggestedText) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                    position: 'fixed',
                    top: `${cursorPosition.top}px`,
                    left: `${cursorPosition.left}px`,
                    zIndex: 1000,
                }}
                className="flex flex-col gap-2 bg-white rounded-lg shadow-2xl border-2 border-purple-200 p-2 min-w-[140px]"
            >
                {/* Action Label */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-linear-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-md">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">{action}</span>
                </div>

                {/* Accept Button */}
                <Button
                    onClick={handleAccept}
                    size="sm"
                    className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md h-8 px-3 transition-all"
                >
                    <Check className="h-4 w-4 mr-1.5" />
                    Accept
                </Button>

                {/* Reject Button */}
                <Button
                    onClick={handleReject}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 h-8 px-3 transition-all"
                >
                    <X className="h-4 w-4 mr-1.5" />
                    Reject
                </Button>

                {/* Retry Button (optional) */}
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:bg-gray-100 h-8 px-3"
                    >
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        Retry
                    </Button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}