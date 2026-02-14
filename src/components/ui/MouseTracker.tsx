import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const MouseTracker: React.FC = () => {
    const [isHovering, setIsHovering] = useState(false);

    // Mouse position state
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Spring configuration for smooth "magnetic" feel
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over interactive elements
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: '-50%',
                translateY: '-50%',
            }}
        >
            {/* Main Cursor Dot */}
            <motion.div
                animate={{
                    scale: isHovering ? 4 : 1, // Expands significantly on hover
                    opacity: isHovering ? 0.8 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 bg-luxury-gold rounded-full shadow-[0_0_20px_rgba(197,160,89,0.8)]"
            />

            {/* Outer Ring (optional, adds depth) */}
            <motion.div
                animate={{
                    scale: isHovering ? 1.5 : 0,
                    opacity: isHovering ? 1 : 0
                }}
                className="absolute inset-0 w-4 h-4 border border-white rounded-full -z-10"
            />
        </motion.div>
    );
};
