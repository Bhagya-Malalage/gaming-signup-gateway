function Header({ userRole }) {
    return (
        <header>
            {/* ...existing code... */}
            {userRole !== 'admin' && (
                <button className="user-view-button">USER VIEW</button>
            )}
            {/* ...code... */}
        </header>
    );
}