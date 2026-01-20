// src/state/AppProvider.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

// 表示用（StatusHeaderで使う）
export const STAT_CONFIGS = [
    { key: "health", label: "健康" },
    { key: "happiness", label: "幸福度" },
    { key: "mentalState", label: "精神状態" },
    { key: "hunger", label: "満腹度" },
];

export const INITIAL_STATUS = {
    health: 100,
    happiness: 50,
    mentalState: 25,
    hunger: 10,
};

export function AppProvider({ children }) {
    const [userId, setUserId] = useState(null);

    const [user, setUser] = useState(null);
    const [status, setStatus] = useState(INITIAL_STATUS);
    // const [日記, setStatus] = use日記(null);
    const [isLoading, setIsLoading] = useState(false);

    async function fetchUserByKey(userId) {
        // DB等から取得する想定（モック実装）
        return null;
    };

    async function fetchStatusByKey(userId) {
        // DB等から取得する想定（モック実装）
        return {health: 100, happiness: 50, mentalState: 25, hunger: 10};
    };

    // (推測) 認証APIを呼んで userId を返す想定。今はモック。
    async function authenticate(email, pass) {
      // 例: const { userId } = await api.login(email, pass)
      if (!email || !pass) throw new Error("メール/パスワードが必要です");
      return { userId: "mock-user-1" };
    }

    // ユーザー更新時の処理
    useEffect(() => {
        if (!userId) {
            setUser(null);
            setStatus(INITIAL_STATUS);
            return;
        }

        const myReqId = ++reqIdRef.current;
        setIsLoading(true);

        (async () => {
            try {
                const [u, s] = await Promise.all([
                    fetchUserByKey(userId), // DB等から取得する想定
                    fetchStatusByKey(userId), // DB等から取得する想定
                ]);

                if (reqIdRef.current !== myReqId) return;
                setUser(u);
                setStatus((prev) => ({ ...prev, ...s }));
            } catch (e) {
                if (reqIdRef.current !== myReqId) return;
                console.error("ユーザー切替失敗", e);
            } finally {
                if (reqIdRef.current !== myReqId) return;
                setIsLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [userId]);

  // 外部更新API（ここが「窓口」）
  const api = useMemo(() => {
    // status: 部分上書き
    const setStatus = (partial) => {
      setStatusState((prev) => ({ ...prev, ...(partial || {}) }));
    };

    // status: 加算更新
    const addStatus = (delta) => {
      setStatusState((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(delta || {})) {
          const a = Number(next[k]);
          const b = Number(delta[k]);
          next[k] = (Number.isFinite(a) ? a : 0) + (Number.isFinite(b) ? b : 0);
        }
        return next;
      });
    };

    const resetStatus = () => setStatusState(INITIAL_STATUS);

    // user: 名前更新（null許容ならここを調整）
    const setName = (name) => {
      setUserState((prev) => ({ ...prev, name: String(name ?? "") }));
    };

    const setUser = (u) => {
      setUserState((prev) => ({ ...prev, ...(u || {}) }));
    };

    return {
      // state
      status,
      user,
      isLoading,

      // actions
      setStatus,
      addStatus,
      resetStatus,
      setName,
      setUser,
    };
  }, [status, user, isLoading]);

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

// まとめて取りたいとき
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

// 目的別（importを短くする）
export function useStatus() {
  const { status, isLoading, setStatus, addStatus, resetStatus } = useApp();
  return { status, isLoading, setStatus, addStatus, resetStatus };
}

export function useUser() {
  const { user, setName, setUser } = useApp();
  return { user, setName, setUser };
}
