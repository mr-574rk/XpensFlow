import { useState } from 'react';
import { logger } from '../utils/logger';

export const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const startListening = (onResult) => {
        if (!('webkitSpeechRecognition' in window)) {
            logger.warn('Voice input not supported');
            return false;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            logger.info('Voice recognition started');
        };

        recognition.onend = () => {
            setIsListening(false);
            logger.info('Voice recognition ended');
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            logger.info('Voice input received', text);

            const parsed = parseVoiceInput(text);
            if (parsed && onResult) {
                onResult(parsed);
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            logger.error('Voice recognition error', event.error);
        };

        try {
            recognition.start();
            return true;
        } catch (error) {
            logger.error('Failed to start recognition', error);
            return false;
        }
    };

    const parseVoiceInput = (text) => {
        // Pattern: "add 2500 groceries" or "add 50 dollars food"
        const match = text.toLowerCase().match(/add\s+(\d+(?:\.\d+)?)\s+(?:dollars?\s+)?(.+)/);
        if (match) {
            return {
                amount: parseFloat(match[1]),
                description: match[2].trim()
            };
        }
        return null;
    };

    return { isListening, transcript, startListening, parseVoiceInput };
};