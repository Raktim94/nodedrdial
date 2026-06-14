'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store';

let globalSocket: Socket | null = null;

export function useWebSocket(handlers?: {
  onMessage?: (data: any) => void;
  onCall?: (data: any) => void;
  onNotification?: (data: any) => void;
  onCallStatus?: (data: any) => void;
}) {
  const { accessToken, isAuthenticated } = useAuthStore();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!isAuthenticated() || !accessToken) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;

    if (!globalSocket || globalSocket.disconnected) {
      globalSocket = io(wsUrl, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    }

    const socket = globalSocket;

    socket.on('message:new', (data) => handlersRef.current?.onMessage?.(data));
    socket.on('call:incoming', (data) => handlersRef.current?.onCall?.(data));
    socket.on('notification:new', (data) => handlersRef.current?.onNotification?.(data));
    socket.on('call:status', (data) => handlersRef.current?.onCallStatus?.(data));

    return () => {
      socket.off('message:new');
      socket.off('call:incoming');
      socket.off('notification:new');
      socket.off('call:status');
    };
  }, [accessToken]);

  const joinConversation = useCallback((contactId: string) => {
    globalSocket?.emit('join_conversation', { contactId });
  }, []);

  return { socket: globalSocket, joinConversation };
}
