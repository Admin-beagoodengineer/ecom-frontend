import { ReactElement, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useAllUsersQuery, useDeleteUserMutation } from "../../redux/api/userAPI";
import { CustomError } from "../../types/api.types";
import toast from "react-hot-toast";
import { Skeleton } from "../../components/Loader";
import { responseToast } from "../../utils/features";
import { useSocket } from "../../components/SocketContext";

interface DataType {
  avatar: ReactElement;
  name: string;
  email: string;
  gender: string;
  role: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Avatar",
    accessor: "avatar",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Gender",
    accessor: "gender",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Role",
    accessor: "role",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Customers = () => {
  const {user} = useSelector((state: RootState) => state.userReducer);
  const {isLoading, data, isError, error} = useAllUsersQuery(user?._id!);
  const [rows, setRows] = useState<DataType[]>([]);

  const [deleteUser] = useDeleteUserMutation();

  const deleteHandler = async (userId: string) => {
    const res = await deleteUser({userId, adminUserId: user?._id!});
    responseToast(res, null, "");
  };

  if(isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  useEffect(() => {
    if(data) setRows(data.users.map((i) => ({
      avatar: <img src={i.photo} alt={i.name} style={{borderRadius: '50%'}} />,
      name: i.name,
      email: i.email,
      gender: i.gender,
      role: i.role,
      action: <button onClick={() => deleteHandler(i._id)}><FaTrash /></button>
    })));
  }, [data]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for transaction events
    socket.on("transaction_completed", (data) => {
      console.log("New transaction completed:", data);
      alert(`Transaction completed by ${data.user} for ₹${data.amount}`);
    });

    socket.on("transaction_failed", (data) => {
      console.log("Transaction failed:", data);
      alert(`Transaction failed for order ${data.orderId}: ${data.status}`);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("transaction_completed");
      socket.off("transaction_failed");
    };
  }, [socket]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Customers",
    rows.length > 6
  )();

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading ? <Skeleton length={20} /> : Table}</main>
    </div>
  );
};

export default Customers;
