'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaTimes } from 'react-icons/fa';

export function PromotionBlock() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-blue-100 p-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
                <p>Unlock AI features and unlimited collaboration!</p>
            </div>
            <Button variant="ghost" onClick={() => setIsVisible(false)}>
                <FaTimes />
            </Button>
        </div>
    );
}