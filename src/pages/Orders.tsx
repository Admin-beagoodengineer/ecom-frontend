import { ReactElement, useEffect, useState } from "react";
import TableHOC from "../components/admin/TableHOC"
import { Column } from "react-table";
// import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMyOrdersQuery } from "../redux/api/orderAPI";
import toast from "react-hot-toast";
import { CustomError } from "../types/api.types";
import { Skeleton } from "../components/Loader";
import { RootState } from "../redux/store";
import { Link } from "react-router-dom";

type DataType = {
    _id: string;
    amount: number;
    quantity: number;
    discount: number;
    status: ReactElement;
    action: ReactElement;
}

const columns: Column<DataType>[] = [
    {
      Header: "ID",
      // accessor: "_id"
      accessor: (row) =>
          row._id.match(/\d+/g)?.join("").slice(-3).padStart(3, "0") || "", // Transform only for display
    },
    // {
    //     Header: "Quantity",
    //     accessor: "quantity"
    // },
    // {
    //     Header: "Discount",
    //     accessor: "discount"
    // },
    // {
    //     Header: "Amount",
    //     accessor: "amount"
    // },
    {
        Header: "Status",
        accessor: "status"
    },
    {
        Header: "Action",
        accessor: "action"
    },
]

function Orders() {
    const {user} = useSelector((state: RootState) => state.userReducer);
    const {isLoading, data, isError, error} = useMyOrdersQuery(user?._id!);

    const [rows, setRows] = useState<DataType[]>([]);
    const Table = TableHOC<DataType>(
        columns,
        rows,
        "dashboard-product-box",
        "Orders",
        rows.length > 6
      )();

    if(isError) {
        const err = error as CustomError;
        toast.error(err.data.message);
    }
    
    useEffect(() => {
      if (data)
        setRows(
          data.orders.map((i) => ({
            _id: i._id,
            amount: i.total,
            discount: i.discount,
            quantity: i.orderItems.length,
            status: (
              <span
                className={
                  i.status === "Processing"
                    ? "red"
                    : i.status === "Shipped"
                    ? "green"
                    : "purple"
                }
              >
                {i.status}
              </span>
            ),
            action: (
              <div>
                <Link to={`/order/${i._id}`} className="btn btn-primary">
                  View Info
                </Link>
              </div>
            ),
          }))
        );
    }, [data]);
    

  return (
    <div className="container">
        <h1>My Orders</h1>
        {isLoading ? <Skeleton length={20} /> : Table}
    </div>
  )
}

export default Orders