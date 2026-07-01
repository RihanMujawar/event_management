import axios from "axios";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:3001";

function UserListRow({ user, onDeleted }) {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isCurrentUser = currentUser._id === user._id;

    const handleDelete = async () => {
        if (isCurrentUser) {
            toast.error("You cannot delete your own account");
            return;
        }

        const confirmed = window.confirm(`Delete ${user.name}?`);
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API}/user/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("User deleted successfully");
            onDeleted(user._id);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error deleting user");
        }
    };

    return (
        <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.phone}</td>
            <td>
                <span className={`role-badge role-${user.role}`}>
                    {user.role}
                </span>
            </td>
            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
            <td>
                <button onClick={handleDelete} className="delete-button" disabled={isCurrentUser}>
                    <Trash2 size={15} />
                    Delete
                </button>
            </td>
        </tr>
    )
}
export default UserListRow;
