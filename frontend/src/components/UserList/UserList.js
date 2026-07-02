import axios from "axios";
import { useEffect, useState } from "react";
import UserListRow from "./UserListRow";
import "./UserList.css";
import toast from "react-hot-toast";
import { Users, RefreshCw, AlertCircle } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "/api";

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API}/user/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users || []);
        } catch (err) {
            const message = err.response?.data?.message || "Error fetching user list";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleted = (userId) => {
        setUsers((currentUsers) => currentUsers.filter((user) => user._id !== userId));
    };

    return (
        <section className="users-page">
            <div className="users-container">
                <div className="users-header">
                    <div>
                        <div className="users-title-row">
                            <Users size={28} />
                            <h1>Manage Users</h1>
                        </div>
                        <p>View attendees, organizers, and admins registered on the platform.</p>
                    </div>
                    <button className="refresh-users-btn" onClick={fetchUsers} disabled={loading}>
                        <RefreshCw size={16} className={loading ? "spin" : ""} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="users-error">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="users-table-card">
                    {loading ? (
                        <div className="users-empty">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="users-empty">No users found.</div>
                    ) : (
                        <table className="userDisplayTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <UserListRow key={user._id} user={user} onDeleted={handleDeleted} />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </section>
    );
}
export default UserList;
