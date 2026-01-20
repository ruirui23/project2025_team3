import "./Header.css";

export default function Header({
    user = null,
    onLoginClick,
    onSignupClick,
    onProfileClick,
}) {
    return (
        <header>
            <div className="app-header-left-spacer" />
            <h1 className="app-header-title">ステログ</h1>
            <div className="app-header-right">
                {!user ? (
                <div className="auth-buttons">
                    <button className="auth-btn login" onClick={onLoginClick}>
                    ログイン
                    </button>
                    <button className="auth-btn signup" onClick={onSignupClick}>
                    サインアップ
                    </button>
                </div>
                ) : (
                <button className="user-button" onClick={onProfileClick}>
                    <div className="user-avatar">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" />
                    ) : (
                        <span className="user-avatar-fallback">
                        {user.name.slice(0, 1).toUpperCase()}
                        </span>
                    )}
                    </div>
                    <span className="user-name">{user.name}</span>
                </button>
                )}
            </div>
        </header>
    );
}