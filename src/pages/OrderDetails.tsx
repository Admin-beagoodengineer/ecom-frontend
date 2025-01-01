import { Link, Navigate, useParams } from "react-router-dom";
import { useRef } from "react";
import { useOrderDetailsQuery } from "../redux/api/orderAPI";
import { Order, OrderItem } from "../types/types";
import { Skeleton } from "../components/Loader";
import { transformImage } from "../utils/features";

const OrderDetails = () => {
  const defaultData: Order = {
    shippingInfo: {
      address: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
      phone: "",
    },
    status: "",
    subTotal: 0,
    discount: 0,
    shippingCharges: 0,
    tax: 0,
    total: 0,
    orderItems: [],
    user: { name: "", _id: "" },
    _id: "",
  };

  const params = useParams();
  console.log('id: ', params.id);
  const { isLoading, data, isError } = useOrderDetailsQuery(params.id!);
  const contentRef = useRef<HTMLDivElement>(null);

  if (isError) return <Navigate to="/404" />;

  const {
    shippingInfo: { address, city, phone },
    orderItems,
    user: { name },
    status,
    subTotal,
    total,
    discount,
    shippingCharges,
    tax,
  } = data?.order || defaultData;

  const orderIdLastThree = data?.order._id.slice(-3).padStart(3, "0");

  return (
    <div className="order-details-container">
      {isLoading ? (
        <Skeleton length={20} />
      ) : (
        <>
          <section className="order-summary">
            <h1>Order Details</h1>
            <div ref={contentRef} className="order-summary-content">
              <p>
                <strong>Name:</strong> {name}
              </p>
              <p>
                <strong>Order Number:</strong> {orderIdLastThree}
              </p>
              <p>
                <strong>Shipping Address:</strong> {`${address}, ${city}`}
              </p>
              <p>
                <strong>Phone:</strong> {phone}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${status.toLowerCase()}`}>{status}</span>
              </p>
              <p>
                <strong>Order Items:</strong>
                <div>
                  {orderItems.map((item) => (
                    <div key={item._id} className="order-item">
                      {item.name} - {item.quantity} x ₹{item.price} = ₹
                      {item.quantity * item.price}
                    </div>
                  ))}
                </div>
              </p>
              <p>
                <strong>Total:</strong> ₹{total}
              </p>
            </div>
          </section>

          <section className="order-items">
            <h2>Order Items</h2>
            {orderItems.map((item) => (
              <ProductCard
                _id={item._id}
                key={item._id}
                name={item.name}
                photo={item.photo}
                price={item.price}
                quantity={item.quantity}
                productId={item.productId}
              />
            ))}
          </section>

          <section className="order-amount-info">
            <h2>Amount Details</h2>
            <p>Subtotal: ₹{subTotal}</p>
            <p>Shipping Charges: ₹{shippingCharges}</p>
            <p>Tax: ₹{tax}</p>
            <p>Discount: ₹{discount}</p>
            <p>
              <strong>Total: ₹{total}</strong>
            </p>
          </section>
        </>
      )}
    </div>
  );
};

const ProductCard = ({ name, photo, price, quantity, productId }: OrderItem) => (
  <div className="product-card">
    <img src={transformImage(photo)} alt={name} />
    <Link to={`/product/${productId}`} className="product-link">
      {name}
    </Link>
    <p>
      {quantity} x ₹{price} = ₹{quantity * price}
    </p>
  </div>
);

export default OrderDetails;