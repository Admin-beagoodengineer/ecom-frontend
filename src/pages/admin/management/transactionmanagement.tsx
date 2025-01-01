import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Order, OrderItem } from "../../../types/types";
import { UserReducerInitialState } from "../../../types/reducer.types";
import { useSelector } from "react-redux";
import { useDeleteOrderMutation, useOrderDetailsQuery, useUpdateOrderMutation } from "../../../redux/api/orderAPI";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { FaTrash } from "react-icons/fa";
import { Skeleton } from "../../../components/Loader";
import { responseToast, transformImage } from "../../../utils/features";
import './printCss.css'
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";



const TransactionManagement = () => {
  const defaultData:Order = {
    shippingInfo: {
      address: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
      phone:"",
    },
    status: "",
    subTotal: 0,
    discount: 0,
    shippingCharges: 0,
    tax: 0,
    total: 0,
    orderItems: [],
    user: {name: "", _id: ""},
    _id: ""
  };

  const {user} = useSelector((state:{userReducer:UserReducerInitialState}) => state.userReducer);

  const params = useParams();
  const navigate = useNavigate();

  const {isLoading, data, isError} = useOrderDetailsQuery(params.id!);

  const {
    // shippingInfo: { address, city, state, country, pinCode , phone},
    shippingInfo: { address, city, phone},
    orderItems,
    user: { name },
    status,
    subTotal,
    total,
    discount,
    shippingCharges,
    tax
  } = data?.order || defaultData;

  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const updateHandler = async () => {
    const res = await updateOrder({
      userId: user?._id!,
      orderId: data?.order._id!
    });
    responseToast(res, navigate, "/admin/transaction");
  };

  const deleteHandler = async () => {
    const res = await deleteOrder({
      userId: user?._id!,
      orderId: data?.order._id!
    });
    responseToast(res, navigate, "/admin/transaction");
  };
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  if(isError) return <Navigate to={"/404"} />

  let digits = data?.order._id.match(/\d+/g)?.join("") || ""; // Extract all digits and join them
  let lastThree = digits.slice(-3).padStart(3, "0"); // Take the last three digits and pad if necessary

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {
          isLoading ? <Skeleton length={20} /> :
          <>
            <section
              style={{
                padding: "2rem",
              }}
            >
              <h2>Order Items</h2>
              {orderItems.map((i) => (
                <ProductCard
                  key={i._id}
                  name={i.name}
                  photo={i.photo}
                  productId={i.productId}
                  _id={i._id}
                  quantity={i.quantity}
                  price={i.price}
                />
              ))}
              <button className="print-order-btn" onClick={() => reactToPrintFn()}>Print</button>
            </section>

            <article className="shipping-info-card">
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>
              <h1>Order Info</h1>
              <h5 >User Info</h5>
              <div ref={contentRef} className="print-content">
                  <h1 className="centered-title">H2 Canteen</h1>
                <p><span>Name:</span> {name}</p>
                <p><span>Order Number: {lastThree}</span></p>
                  <p><span>Order:</span> <div className="orderItems">{orderItems.map((item) => (
                    <div key={item.name}>
                      {item.name}: {item.quantity}
                    </div>
                  ))}</div></p>
                <p>
                  {/* <span>Address:</span> {`${address}, ${city}, ${state}, ${country} ${pinCode}`} <br /> */}
                  <span>Address:</span> {`${address}, ${city}`} <br />
                  <span>Mobile Number: {phone}</span>
                </p>
                <p><span>Total:</span> {total}</p>
              </div>
              <h5>Amount Info</h5>
              <p>Subtotal: {subTotal}</p>
              <p>Shipping Charges: {shippingCharges}</p>
              <p>Tax: {tax}</p>
              <p>Discount: {discount}</p>
              <p>Total: {total}</p>

              <h5>Status Info</h5>
              <p>
                Status:{" "}
                <span
                  className={
                    status === "Delivered"
                      ? "purple"
                      : status === "Shipped"
                      ? "green"
                      : "red"
                  }
                >
                  {status}
                </span>
              </p>
              <button className="shipping-btn" onClick={updateHandler}>
                Process Status
              </button>
            </article>
          </>
        }
        
      </main>
    </div>
  );
};

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}: OrderItem) => (
  <div className="transaction-product-card">
    <img src={transformImage(photo)} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} X {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;
