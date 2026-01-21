import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IndexDB } from "./index_db";

const LOCAL_STORAGE = new IndexDB("my_app");

const AppContext = createContext(null);

export const INITIAL_STATUS = {
  health: 100,
  happiness: 50,
  mentalState: 25,
  hunger: 10,
};

export function AppProvider({ children }) {
  const [userId, setUserId] = useState(null);

  const [user, setUserState] = useState(null);
  const [status, setStatusState] = useState(INITIAL_STATUS);
  const [isLoading, setIsLoading] = useState(false);

  const reqIdRef = useRef(0);

  async function fetchUserByKey(userId) {
    const u = await LOCAL_STORAGE.getUser(userId);
    if (!u) return null;
    // 表示用に整形（email/user_name を name として使う等、好みに合わせて）
    return { id: u.id, email: u.email, name: u.user_name };
  }

  async function fetchStatusByKey(userId) {
    const s = await LOCAL_STORAGE.getStatus(userId);
    if (!s) return INITIAL_STATUS;
    return s.parameter ?? INITIAL_STATUS;
  }

  async function authenticate(identifier, pass) {
    if (!identifier || !pass) throw new Error("メール/ユーザー名とパスワードが必要です");
    const res = await LOCAL_STORAGE.login({ identifier, user_pass: pass });
    if (!res.ok) {
      // reason をメッセージに落とす（必要ならUI側で分岐）
      if (res.reason === "not_found") throw new Error("ユーザーが見つかりません");
      if (res.reason === "invalid_password") throw new Error("パスワードが違います");
      throw new Error("ログインに失敗しました");
    }
    return { userId: res.id };
  }

  // Dexie: サインアップ
  async function register({ email = "", user_name, pass }) {
    if (!user_name || !pass) throw new Error("ユーザー名/パスワードが必要です");
    const res = await LOCAL_STORAGE.createUser({
      email,
      user_name,
      user_pass: pass,
    });
    if (!res.ok) {
      if (res.reason === "user_name_exists") throw new Error("そのユーザー名は既に使われています");
      if (res.reason === "email_exists") throw new Error("そのメールは既に使われています");
      throw new Error("サインアップに失敗しました");
    }
    return { userId: res.id };
  }

  useEffect(() => {
    if (!userId) {
      setUserState(null);
      setStatusState(INITIAL_STATUS);
      return;
    }

    const myReqId = ++reqIdRef.current;
    setIsLoading(true);

    (async () => {
      try {
        const [u, s] = await Promise.all([
          fetchUserByKey(userId),
          fetchStatusByKey(userId),
        ]);

        if (reqIdRef.current !== myReqId) return;
        setUserState(u);
        setStatusState(s);
      } finally {
        if (reqIdRef.current === myReqId) setIsLoading(false);
      }
    })();
  }, [userId]);

  const api = useMemo(() => {
    const login = async ({ email, pass }) => {
      const { userId } = await authenticate(email, pass);
      setUserId(userId);
      return { ok: true };
    };

    const signup = async ({ email = "", user_name, pass }) => {
      const { userId } = await register({ email, user_name, pass });
      setUserId(userId);
      return { ok: true };
    };

    const logout = () => {
      setUserId(null);
      setUserState(null);
      setStatusState(INITIAL_STATUS);
    };

    const setName = async (name) => {
      // 表示名だけ変えるなら state 更新
      setUserState((prev) => ({ ...(prev || {}), name }));

      // DBにも保存したいなら users.user_name を更新する必要がある
      // 例: await LOCAL_STORAGE.users.update(userId, { user_name: name });
    };

    const setUser = (u) => {
      setUserState((prev) => ({ ...(prev || {}), ...(u || {}) }));
    };

    const setStatus = async (partial) => {
      setStatusState((prev) => ({ ...prev, ...(partial || {}) }));
      if (userId) {
        // DBにも反映（parameterをマージ）
        await LOCAL_STORAGE.mergeStatusParameter(userId, partial);
      }
    };

    return {
      // state
      user,
      status,
      isLoading,

      // actions
      login,
      signup,
      logout,
      setUser,
      setName,
      setStatus,
    };
  }, [user, status, isLoading, userId]);

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

export function useUser() {
  const { user, login, signup, logout, setUser, setName } = useApp();
  return { user, login, signup, logout, setUser, setName };
}

export function useStatus() {
  const { status, setStatus } = useApp();
  return { status, setStatus };
}