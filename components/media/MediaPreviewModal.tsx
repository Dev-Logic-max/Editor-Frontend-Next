'use client';

import { useState, useEffect, useRef } from 'react';

import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Trash2, ZoomIn, ZoomOut, Play, Pause, Volume2, VolumeX, Maximize, FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { Slider } from '@/components/ui/slider';
import { formatFileSize } from '@/utils/mediaUtils';

interface MediaItem {
    filename: string;
    originalName: string;
    url: string;
    type: 'image' | 'video' | 'document';
    size: number;
    uploadedAt: Date;
}

interface MediaPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    media: MediaItem[];
    currentIndex: number;
    onDelete: (filename: string) => void;
    documentTitle?: string;
}

export function MediaPreviewModal({
    isOpen,
    onClose,
    media,
    currentIndex: initialIndex,
    onDelete,
    documentTitle,
}: MediaPreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);

    // Video controls
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);

    const currentMedia = media[currentIndex];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < media.length - 1;

    useEffect(() => {
        setCurrentIndex(initialIndex);
        setZoom(1);
    }, [initialIndex]);

    useEffect(() => {
        if (currentMedia?.type === 'video' && videoRef.current) {
            videoRef.current.load();
            setIsPlaying(false);
            setCurrentTime(0);
        }
    }, [currentIndex]);

    const handlePrevious = () => {
        if (hasPrevious) {
            setCurrentIndex(prev => prev - 1);
            setZoom(1);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            setCurrentIndex(prev => prev + 1);
            setZoom(1);
        }
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const handleToggleMute = () => {
        if (!videoRef.current) return;

        if (isMuted) {
            videoRef.current.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            videoRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    };

    const handleSeek = (value: number[]) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
    };

    const handleDownload = async () => {
        try {
            const url = currentMedia.url.startsWith('http')
                ? currentMedia.url
                : `${process.env.NEXT_PUBLIC_API_URL}${currentMedia.url}`;

            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = currentMedia.originalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);

            toast.success('✅ Downloaded!');
        } catch (error) {
            toast.error('Failed to download');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentMedia) return null;

    const mediaUrl = currentMedia.url.startsWith('http')
        ? currentMedia.url
        : `${process.env.NEXT_PUBLIC_API_URL}${currentMedia.url}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden bg-black/95 backdrop-blur-xl border-none">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black/90 via-black/60 to-transparent p-6">
                    <div className="flex items-start justify-between text-white">
                        <div className="flex-1 mr-4">
                            <h3 className="font-bold text-xl mb-2">{currentMedia.originalName}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
                                {documentTitle && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{documentTitle}</span>
                                        </div>
                                        <span>•</span>
                                    </>
                                )}
                                <Badge variant="secondary" className="bg-white/20 text-white border-none">
                                    {currentMedia.type.toUpperCase()}
                                </Badge>
                                <span>{formatFileSize(currentMedia.size)}</span>
                                <span>•</span>
                                <span>{new Date(currentMedia.uploadedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="font-semibold">{currentIndex + 1} / {media.length}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {currentMedia.type === 'image' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                                        className="text-white hover:bg-white/20 h-10 w-10"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="h-5 w-5" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                                        className="text-white hover:bg-white/20 h-10 w-10"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="h-5 w-5" />
                                    </Button>

                                    <div className="h-8 w-px bg-white/20 mx-1" />
                                </>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDownload}
                                className="text-white hover:bg-white/20 h-10 w-10"
                                title="Download"
                            >
                                <Download className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(currentMedia.filename)}
                                className="text-red-400 hover:bg-red-500/20 h-10 w-10"
                                title="Delete"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>

                            <div className="h-8 w-px bg-white/20 mx-1" />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white hover:bg-white/20 h-10 w-10"
                                title="Close"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex items-center justify-center w-full h-[95vh] px-20 py-24">
                    {currentMedia.type === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <video
                                ref={videoRef}
                                src={mediaUrl}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                            />

                            {/* Video Controls */}
                            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 space-y-3">
                                <Slider
                                    value={[currentTime]}
                                    max={duration || 100}
                                    step={0.1}
                                    onValueChange={handleSeek}
                                    className="cursor-pointer"
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={handlePlayPause}
                                            className="h-10 w-10 text-white hover:bg-white/20"
                                        >
                                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                        </Button>

                                        <span className="text-white text-sm font-mono">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={handleToggleMute}
                                                className="h-8 w-8 text-white hover:bg-white/20"
                                            >
                                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                            </Button>
                                            <Slider
                                                value={[isMuted ? 0 : volume]}
                                                max={1}
                                                step={0.1}
                                                onValueChange={handleVolumeChange}
                                                className="w-24"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => videoRef.current?.requestFullscreen()}
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                    >
                                        <Maximize className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <motion.img
                            key={currentIndex}
                            src={mediaUrl}
                            alt={currentMedia.originalName}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: zoom }}
                            transition={{ duration: 0.3 }}
                            className="max-w-full max-h-full object-contain select-none"
                            style={{ transformOrigin: 'center' }}
                            draggable={false}
                        />
                    )}
                </div>

                {/* Navigation Arrows */}
                {hasPrevious && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevious}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 text-white border-2 border-white/20"
                    >
                        <ChevronLeft className="h-7 w-7" />
                    </Button>
                )}

                {hasNext && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 text-white border-2 border-white/20"
                    >
                        <ChevronRight className="h-7 w-7" />
                    </Button>
                )}

                {/* Thumbnails */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-6">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {media.map((item, idx) => (
                            <button
                                key={item.filename}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setZoom(1);
                                }}
                                className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all relative ${idx === currentIndex ? 'border-purple-500 ring-4 ring-purple-400/50 scale-110' : 'border-white/30 hover:border-white/60 hover:scale-105'}`}
                            >
                                {item.type === 'video' ? (
                                    <video
                                        src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                                        className="w-full h-full object-cover"
                                        muted
                                    />
                                ) : (
                                    <img
                                        src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
                                        alt={item.originalName}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {idx === currentIndex && (
                                    <div className="absolute inset-0 bg-purple-500/20" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}