import { useDispatch, useSelector } from 'react-redux';

// Typed hooks (plain JS versions — just re-exports for consistency)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);

// ── Auth selectors ────────────────────────────────────────────────────────────
export const useAuth = () => useAppSelector((state) => state.auth);
export const useUser = () => useAppSelector((state) => state.auth.user);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);

// ── Chat selectors ────────────────────────────────────────────────────────────
export const useChat = () => useAppSelector((state) => state.chat);
export const useChatMessages = () => useAppSelector((state) => state.chat.messages);
export const useChatLoading = () => useAppSelector((state) => state.chat.loading);

// ── Documents selectors ───────────────────────────────────────────────────────
export const useDocuments = () => useAppSelector((state) => state.documents);
export const useDocumentsList = () => useAppSelector((state) => state.documents.documents);
