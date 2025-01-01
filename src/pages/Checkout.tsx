import { useState } from 'react' //FormElement removed
import {Elements} from '@stripe/react-stripe-js'; //, PaymentElement, useElements, useStripe
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { NewOrderRequest } from '../types/api.types';
import { useDispatch, useSelector } from 'react-redux';
import { useNewOrderMutation } from '../redux/api/orderAPI';
import { resetCart } from '../redux/reducer/cartReducer';
import { responseToast } from '../utils/features';
import { RootState, server } from '../redux/store';
import axios from 'axios';
import { load } from '@cashfreepayments/cashfree-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CheckoutForm = () => {
    // const stripe = useStripe();
    // const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [newOrder] = useNewOrderMutation();

    let cashfree: any;

    let initializeSDK = async function () {
        cashfree = await load({
            mode: 'production'
        });
    }
    
    initializeSDK();

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    // const [orderId, setOrderId] = useState<string>("");
    const {user} = useSelector((state: RootState) => state.userReducer);
    const {shippingInfo, cartItems, subTotal, tax, discount, shippingCharges, total} = useSelector((state: RootState) => state.cartReducer);

    const getSessionId = async () => {
        try {
            const body = {
            shippingInfo,
            orderItems: cartItems,
            subTotal,
            tax,
            discount,
            shippingCharges,
            total,
            user
            };
            // console.log('body', body);
    
            const res = await axios.post(`${server}/api/v1/payment/sessionId`, body);
            // console.log('res', res);
    
            // console.log('Session ID response: ', res.data);
            // setOrderId(temp);
            // console.log("NEW ORDER ID IN GET_SESSION_ID: ", temp);
            // console.log("ORDER ID IN GET_SESSION_ID: ", orderId);

            return {
                sessionId: res.data.payment_session_id,
                orderId: res.data.order_id
            };
        } catch (error) {
            console.error('Cashfree Checkout Error: ', error);
        }
    };

    // const submitHandler = async (e:FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();

    //     if(!stripe || !elements) return;
    //     setIsProcessing(true);

    //     const orderData: NewOrderRequest = {
    //         shippingInfo,
    //         orderItems: cartItems, 
    //         subTotal, 
    //         tax, 
    //         discount, 
    //         shippingCharges, 
    //         total,
    //         user: user?._id!
    //     };

    //     const {paymentIntent, error} = await stripe.confirmPayment({
    //         elements, 
    //         confirmParams: {return_url: window.location.origin},
    //         redirect: "if_required"
    //     });

    //     if(error){
    //         setIsProcessing(false);
    //         return toast.error(error.message || "Something went wrong");
    //     }

    //     if(paymentIntent.status === "succeeded") {
    //         const res = await newOrder(orderData);
    //         dispatch(resetCart());
    //         responseToast(res, navigate, "/orders");
    //     }
    //     setIsProcessing(false);
    // };

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

    return <div className='checkout-container'>
        {/* <div className="stripe-container">
            <form onSubmit={submitHandler} action="">
                <PaymentElement />
                <button type='submit' disabled={isProcessing}>
                    {isProcessing ? "Processing...." : "Pay using Stripe"}
                </button>
            </form>
        </div>
        <h1 style={{marginTop: '2rem', marginBottom: '2rem', fontSize: '2rem', textAlign: 'center'}}>OR</h1> */}
        <h1 style={{marginTop: '5rem', marginBottom: '2rem', fontSize: '2rem', textAlign: 'center'}}>Continue Payment</h1>
        <div className='cashfree-container'>
            <button onClick={createCashfreeOrder} disabled={isProcessing}>
                {isProcessing ? "Processing...." : "Pay using Cashfree"}
            </button>
        </div>
    </div>
};

const Checkout = () => {
    const location = useLocation();
    const clientSecret:string | undefined = location.state;

    if(!clientSecret) return <Navigate to={"/shipping"} />

  return (
    <Elements options={{clientSecret}} stripe={stripePromise} >
        <CheckoutForm />
    </Elements>
  )
}

export default Checkout