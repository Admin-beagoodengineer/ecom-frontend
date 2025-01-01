import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { RootState, server } from "../redux/store";
import toast from "react-hot-toast";
import { resetCart, saveShippingInfo } from "../redux/reducer/cartReducer";
import { ShippingInfo } from "../types/types";
import { responseToast } from "../utils/features";
import { NewOrderRequest } from "../types/api.types";
import { load } from '@cashfreepayments/cashfree-js';
import { useNewOrderMutation } from "../redux/api/orderAPI";

function ShippingCashfree() {
    const {cartItems, coupon} = useSelector((state: RootState) => state.cartReducer);
    const { user } = useSelector((state: RootState) => state.userReducer);
    const [errors, setErrors] = useState<string | null>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
    });

    const [newOrder] = useNewOrderMutation();
    const {shippingInfo: backendShippingInfo, cartItems: backendCartItems, subTotal, tax, discount, shippingCharges, total} = useSelector((state: RootState) => state.cartReducer);

    let cashfree: any;

    let initializeSDK = async function () {
        cashfree = await load({
            mode: 'production'
        });
    }
    
    initializeSDK();

    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const getSessionId = async () => {
        try {
            const body = {
            shippingInfo: backendShippingInfo,
            orderItems: backendCartItems,
            subTotal,
            tax,
            discount,
            shippingCharges,
            total,
            user
            };
            // console.log('body', body);
    
            const res = await axios.post(`${server}/api/v1/payment/sessionId`, body);

            return {
                sessionId: res.data.payment_session_id,
                orderId: res.data.order_id
            };
        } catch (error) {
            console.error('Cashfree Checkout Error: ', error);
        }
    };

    const verifyCashfreePayment = async (orderId: string) => {
        try {
            const orderData: NewOrderRequest = {
                shippingInfo,
                orderItems: cartItems, 
                subTotal, 
                tax, 
                discount, 
                shippingCharges, 
                total,
                user: user?._id!
            };

            // console.log('ORDER ID: ', orderId);

            let res = await axios.post(`${server}/api/v1/payment/verify`, {orderId});
            // console.log("RES IN VERIFY: ", res);

            if(res && res.data){
                const res = await newOrder(orderData);
                dispatch(resetCart());
                responseToast(res, navigate, "/orders");
            }
        } catch (error) {
            // console.log('Verify Cashfree Payment Error: ', error);
        }
    }

    const createCashfreeOrder = async () => {
        // console.log('reached fn')
        try {
            let sessionIdObj = await getSessionId();
            // console.log("SESSION ID: ", sessionIdObj?.sessionId);
            // console.log('ORDER ID IN CHECKOUT FUNCTION: ', sessionIdObj?.orderId);
            let checkoutOptions = {
                paymentSessionId: sessionIdObj?.sessionId,
                redirectTarget: "_modal", // If we don't put this, we'll be redirected to cashfree website
            }
            cashfree.checkout(checkoutOptions).then((res: any) => {
                if(!res.error) console.log("Cashfree payment initiated");
                else return toast.error("Cashfree payment failed");
                verifyCashfreePayment(sessionIdObj?.orderId);
            });
            setIsProcessing(false);
        } catch (error) {
            // console.log('Create Cashfree Order Error: ', error);
        }
    };

    function isDataValid(data: ShippingInfo): boolean {
        // Validate phone: Must be a 10-digit number
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(data.phone)) {
          setErrors("Invalid phone number");
          return false;
        }
      
        // Validate address: Must not be empty
        if (data.address.trim() === "") {
          setErrors("Address cannot be empty");
          return false;
        }
      
        // Validate city: Must not be empty
        if (data.city.trim() === "") {
          setErrors("City cannot be empty");
          return false;
        }
      
        // Validate state: Must not be empty
        if (data.state.trim() === "") {
          setErrors("State cannot be empty");
          return false;
        }
      
        // Validate country: Must not be empty
        if (data.country.trim() === "") {
          setErrors("Country cannot be empty");
          return false;
        }
      
        // Validate pinCode: Must be a 5- or 6-digit number
        const pinCodeRegex = /^\d{5,6}$/;
        if (!pinCodeRegex.test(data.pinCode)) {
          setErrors("Invalid pin code");
          return false;
        }
      
        // If all validations pass
        return true;
    }

    const submitHandler = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!isDataValid(shippingInfo)) return;

        dispatch(saveShippingInfo(shippingInfo));

        try {
            await axios.post(`${server}/api/v1/payment/create?id=${user?._id}`, 
            {
                items: cartItems,
                shippingInfo,
                coupon,
            }, 
            {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            createCashfreeOrder();

        } catch (error) {
            // console.log(error);
            toast.error("Something went wrong");
        }
    };

    const changeHandler = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingInfo(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    useEffect(() => {
        if(cartItems.length <= 0) return navigate("/cart");
    }, [cartItems]);

  return (
    <div className="shipping">
        <button className="back-btn" onClick={() => navigate("/cart")}><BiArrowBack /></button>
        <form onSubmit={submitHandler}>
            <h1>Shipping Details</h1>
            <input required type="number" placeholder="Phone Number (+91)" name="phone" value={shippingInfo.phone} onChange={changeHandler} />
            <input required type="text" placeholder="Address" name="address" value={shippingInfo.address} onChange={changeHandler} />
            <input required type="text" placeholder="City" name="city" value={shippingInfo.city} onChange={changeHandler} />
            <input required type="text" placeholder="State" name="state" value={shippingInfo.state} onChange={changeHandler} />
            <select name="country" required value={shippingInfo.country} onChange={changeHandler}>
                <option value="">Choose Country</option>
                <option value="india">India</option>
            </select>
            <input required type="number" placeholder="Pin Code" name="pinCode" value={shippingInfo.pinCode} onChange={changeHandler} />
            <p style={{color: 'red', height: '10px', marginTop: '-15px', textAlign: 'center'}}>{errors}</p>

            <button type="submit">{isProcessing ? "Processing...." : "Pay using Cashfree"}</button>
        </form>
    </div>
  )
}

export default ShippingCashfree