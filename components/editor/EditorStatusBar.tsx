'use client';

import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { PiChatCenteredTextDuotone } from "react-icons/pi";
import { GiQueenCrown } from "react-icons/gi";
import { HiUsers } from "react-icons/hi2";

import { EditorLayout, useEditorSettings } from "@/hooks/useEditorSettings";
import { formatDistanceToNow } from "date-fns";

interface EditorStatusBarProps {
    document?: any
    saveStatus: string;
    connectionStatus: string;
    activeUsers: any[];
    editor?: any;
}

export function EditorStatusBar({ document, saveStatus, connectionStatus, activeUsers, editor }: EditorStatusBarProps) {
    const { settings } = useEditorSettings();

    const [letterCount, setLetterCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    const [userTimestamps, setUserTimestamps] = useState<Record<string, number>>({});
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

    const [sessionTime, setSessionTime] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);

    const layout = settings.appearance?.layout;

    // 🕒 Start session timer
    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            setSessionTime(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ✍️ Count letters & words
    useEffect(() => {
        if (!editor) return;

        const updateCounts = () => {
            const text = editor.getText().trim();
            setLetterCount(text.length);
            setWordCount(text.length > 0 ? text.split(/\s+/).length : 0);
        };

        updateCounts();
        editor.on("update", updateCounts);
        return () => editor.off("update", updateCounts);
    }, [editor]);

    // 🎯 Track cursor position
    useEffect(() => {
        if (!editor) return;

        const updateCursorPos = () => {
            const { from } = editor.state.selection;
            const text = editor.state.doc.textBetween(0, from, "\n");
            const lines = text.split("\n");
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            setCursorPosition({ line, column });
        };

        updateCursorPos();
        editor.on("selectionUpdate", updateCursorPos);
        return () => editor.off("selectionUpdate", updateCursorPos);
    }, [editor]);

    // 👥 Track active users timestamps
    useEffect(() => {
        if (!activeUsers.length) return;
        const now = Date.now();
        setUserTimestamps(prev => {
            const updated = { ...prev };
            activeUsers.forEach(u => {
                updated[u.userId] = now;
            });
            return updated;
        });
    }, [activeUsers]);

    // Track how long user has been in the document
    useEffect(() => {
        const joinedAt = Date.now();
        const interval = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - joinedAt) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimeSpent = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Saving...':
            case 'Connecting...':
                return 'text-yellow-500';
            case 'Error':
            case 'Authentication Failed':
                return 'text-red-500';
            case 'Disconnected':
                return 'text-orange-500';
            default:
                return 'text-green-500';
        }
    };

    return (
        <div className={`bg-gray-50 px-4 py-1 flex flex-wrap justify-between items-center gap-2 ${layout === EditorLayout.Document ? 'rounded-xl m-2' : 'border-b'}`}>
            <span className="flex items-center gap-4 order-1">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-mono">
                    <span className="hidden md:block">Status:</span>
                    <span className={getStatusColor(connectionStatus)}>{connectionStatus}</span>
                </div>
                <span className="hidden sm:block text-sm font-mono">Letters: <b>{letterCount}</b></span>
                <span className="block relative"><PiChatCenteredTextDuotone className="w-6 h-6" />
                    <span className="absolute text-center text-[10px] font-bold content-center w-5 h-5 rounded-full border -top-2.5 left-3.5 bg-gray-100 border-gray-400">{letterCount}</span>
                </span>
                <span className="hidden sm:block text-sm font-mono">Words: <b>{wordCount}</b></span>
            </span>
            <span className="flex items-center gap-4 order-3 md:order-2">
                <span className="text-sm font-sans font-medium text-shadow-lg">
                    ⏱️ {formatTimeSpent(timeSpent)}
                </span>
                <span className="text-xs sm:text-sm">
                    📍 Line {cursorPosition.line} : Col {cursorPosition.column}
                </span>
            </span>
            <div className="flex items-center gap-2 md:gap-4 order-2">
                {activeUsers.length > 1 && (
                    <div className="flex items-center gap-1">
                        {activeUsers.map((u) => (
                            <div
                                key={u.clientId}
                                className="w-4 h-4 rounded-full border"
                                style={{ background: u.color }}
                                title={u.name}
                            />
                        ))}
                    </div>
                )}
                <span className="hidden sm:block text-xs font-mono text-gray-500">Active:</span>
                <HoverCard openDelay={100}>
                    <HoverCardTrigger asChild>
                        <Badge className="text-xs font-mono font-bold rounded-full border border-gray-800/60 text-center text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                            <HiUsers className="text-purple-600" /> {activeUsers.length} <span className="block sm:hidden">Active</span>
                        </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60">
                        <p className="text-xs text-gray-600 mb-2">Currently active users:</p>
                        <div className="flex flex-col gap-2">
                            {activeUsers.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center">No active users</p>
                            ) : (
                                activeUsers.map((u) => {
                                    const initials = u.name ? u.name.split(' ').map((n: string) => n.charAt(0)).join('') : 'U';
                                    const profilePhotoUrl = u?.avatar && `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${u.avatar}`
                                    const isCreator = u.userId === document?.creator?._id;
                                    const lastSeen = userTimestamps[u.userId] ? formatDistanceToNow(userTimestamps[u.userId], { addSuffix: true }) : "just now";
                                    return (
                                        <div
                                            key={u.clientId}
                                            className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition"
                                        >
                                            <Avatar className="w-10 h-10 border" style={{ background: u.avatarGradient || "gray" }}>
                                                <AvatarImage src={profilePhotoUrl} />
                                                <AvatarFallback className="text-[10px] bg-transparent">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-semibold">{u.name}</span>
                                                    {isCreator && <GiQueenCrown className="text-amber-500 w-4 h-4" />}
                                                    {isCreator && <span className="text-xs font-semibold px-1 rounded-lg bg-green-200">Creator</span>}
                                                </div>
                                                <span className="text-[10px] text-gray-500">Last seen {lastSeen}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </HoverCardContent>
                </HoverCard>
                <div className="flex items-center gap-1 text-xs sm:text-sm font-mono">
                    <span className="hidden md:block">Document:</span>
                    <span className={getStatusColor(saveStatus)}>{saveStatus}</span>
                </div>
            </div>
        </div>
    );
}
