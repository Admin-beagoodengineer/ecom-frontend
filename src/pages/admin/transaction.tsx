import { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { useSelector } from "react-redux";
import { useAllOrdersQuery } from "../../redux/api/orderAPI";
import { CustomError } from "../../types/api.types";
import toast from "react-hot-toast";
import { RootState } from "../../redux/store";
import { Skeleton } from "../../components/Loader";

interface DataType {
  user: string;
  amount: number;
  discount: number;
  quantity: number;
  status: ReactElement;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Avatar",
    accessor: "user",
  },
  // {
  //   Header: "Amount",
  //   accessor: "amount",
  // },
  // {
  //   Header: "Discount",
  //   accessor: "discount",
  // },
  // {
  //   Header: "Quantity",
  //   accessor: "quantity",
  // },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Transaction = () => {
  const {user} = useSelector((state: RootState) => state.userReducer);
  const [rows, setRows] = useState<DataType[]>([]);
  const {isLoading, data, isError, error, refetch} = useAllOrdersQuery(user?._id!);
  const [soundCooldown, setSoundCooldown] = useState(false); // Throttle flag

  const [numOfOrders, setNumOfOrders] = useState(0);

  if(isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  const playSound = () => {
    if (!soundCooldown) {
      setSoundCooldown(true);
      const audio = new Audio("/notification.mp3");
      audio.play();

      // Reset the flag after 2 seconds
      setTimeout(() => {
        setSoundCooldown(false);
      }, 2000);
    }
  };

  // Polling: Refetch every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      // console.log('refetched');
    }, 10000); // 300,000 ms = 5 minutes

    return () => clearInterval(interval); // Cleanup on unmount
  }, [refetch]);

  useEffect(() => {
    if (data) {
      const orders = data.orders;

      // Update rows for the table
      setRows(
        orders.map((order) => ({
          user: order.user.name,
          amount: order.total,
          discount: order.discount,
          quantity: order.orderItems.length,
          status: (
            <span
              className={
                order.status === "Processing"
                  ? "red"
                  : order.status === "Shipped"
                  ? "green"
                  : "purple"
              }
            >
              {order.status}
            </span>
          ),
          action: <Link to={`/admin/transaction/${order._id}`}>Manage</Link>,
        }))
      );

      // Check for new orders
      if (orders.length > numOfOrders) {
        const newOrders = orders.slice(numOfOrders);
        // console.log("NEW ORDERS: ", newOrders);
        // console.log("NUM OF ORDERS: ", numOfOrders);

        // Toast and play sound for each new order
        newOrders.forEach((order) => {
          toast.success(`New order added by ${order.user.name}`);
          playSound();
        });

        // Update the number of orders tracked
        setNumOfOrders(orders.length);
      }
    }

  }, [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Orders",
    rows.length > 6
  )();
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading ? <Skeleton length={20} /> : Table}</main>
    </div>
  );
};

export default Transaction;
