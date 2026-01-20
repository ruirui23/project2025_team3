import "./BottomNavigation.css";
import { NavLink } from "react-router-dom";

export default function BottomNavigation() {
    return (
        <nav>
            <NavItem to="/" label="Home" />
            <NavItem to="/analytics" label="Analytics" />
            <NavItem to="/history" label="History" />
            {/* <NavItem to="/game" label="Game" /> */}
            <NavItem to="/profile" label="Profile" />
            {/* <NavItem to="/settings" label="Settings" /> */}
        </nav>
    );
}

function NavItem({ to, label }) {
    return <NavLink to={to}>{label}</NavLink>;
}
