import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Loader from "./components/Loader";
import Header from "./components/Header";
import toast, {Toaster} from 'react-hot-toast';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { userExist, userNotExist } from "./redux/reducer/userReducer";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./redux/api/userAPI";
import { UserReducerInitialState } from "./types/reducer.types";
import ProtectedRoute from "./components/ProtectedRoute";
import { server } from "./redux/store.ts";
import io from "socket.io-client";
import { setOrderStatus } from "./redux/reducer/globalReducer.ts";
import axios from "axios";

const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const ProductDetails = lazy(() => import("./pages/ProductDetails.tsx"));
const Cart = lazy(() => import("./pages/Cart"));
const ShippingCashfree = lazy(() => import("./pages/ShippingCashfree"));
const Login = lazy(() => import("./pages/Login"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Admin Imports
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Discount = lazy(() => import("./pages/admin/discount.tsx"));

const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const Stopwatch = lazy(() => import("./pages/admin/apps/stopwatch"));
const Toss = lazy(() => import("./pages/admin/apps/toss"));
const NewProduct = lazy(() => import("./pages/admin/management/newproduct"));

const ProductManagement = lazy(() => import("./pages/admin/management/productmanagement"));
const TransactionManagement = lazy(() => import("./pages/admin/management/transactionmanagement"));
const DiscountManagement = lazy(() => import("./pages/admin/management/discountmanagement"));
const NewDiscount = lazy(() => import("./pages/admin/management/newdiscount"));

function App() {

  const {user, loading} = useSelector((state:{userReducer:UserReducerInitialState}) => state.userReducer);
  const socket = io(server);

  const dispatch = useDispatch();


  useEffect(() => {
    onAuthStateChanged(auth, async(user) => {
      if(user){
        const data = await getUser(user.uid);
        dispatch(userExist(data.user));
      }
      else {
        dispatch(userNotExist());
      }
    });
  }, []);

  useEffect(() => {
    // Fetch initial state from backend on component mount
    const fetchInitialState = async () => {
      try {
        // const response = await axios.get(`${server}/api/v1/dashboard/orderStatus`);
        await axios.get(`${server}/api/v1/dashboard/orderStatus`);
        // console.log('ORDER STATUS INFO AFTER REFRESH: ', response.data.orderStatusInfo);
      } catch (error) {
        toast.error('Failed to fetch initial button state');
        // console.log('Failed to fetch initial button state', error);
      }
    };
    fetchInitialState();
  }, []);

  useEffect(() => {
    // Listen for real-time updates
    socket.on("orderStatusUpdate", (newStatus: boolean) => {
      dispatch(setOrderStatus(newStatus));
    });

    // Clean up the listener
    return () => {
      socket.off("orderStatusUpdate");
    };
  }, [dispatch]);

  return loading ? <Loader /> : (
      <Router>
        <Header user={user} />
        <Suspense fallback={<Loader />}>
          <div className="main-body">
            <Routes>
              <Route path="/" element={<Home />}/>
              <Route path="/search" element={<Search />}/>
              <Route path="/product/:id" element={<ProductDetails />}/>
              <Route path="/cart" element={<Cart />}/>

              {/* Not Logged In User Routes */}
              <Route 
                path="/login" 
                element={
                <ProtectedRoute isAuthenticated={user ? false : true}>
                  <Login />
                </ProtectedRoute>
                } 
              />

              {/* Logged In User Routes */}
              <Route element={<ProtectedRoute isAuthenticated={user ? true : false} redirect="/login" />}>
                {/* <Route path="/shipping" element={<Shipping />}/> */}
                <Route path="/shipping" element={<ShippingCashfree />}/>
                <Route path="/orders" element={<Orders />}/>
                <Route path="/order/:id" element={<OrderDetails />}/>
                <Route path="/pay" element={<Checkout />}/>
              </Route>
              
              {/* Admin Routes */}
              <Route
                element={
                  <ProtectedRoute 
                    isAuthenticated={true} 
                    adminRoute={true} 
                    isAdmin={user?.role === "admin" ? true : false} 
                  />
                }
              >
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/product" element={<Products />} />
                <Route path="/admin/customer" element={<Customers />} />
                <Route path="/admin/transaction" element={<Transaction />} />
                <Route path="/admin/discount" element={<Discount />} />
                {/* Charts */}
                <Route path="/admin/chart/bar" element={<Barcharts />} />
                <Route path="/admin/chart/pie" element={<Piecharts />} />
                <Route path="/admin/chart/line" element={<Linecharts />} />
                {/* Apps */}
                <Route path="/admin/app/coupon" element={<Coupon />} />
                <Route path="/admin/app/stopwatch" element={<Stopwatch />} />
                <Route path="/admin/app/toss" element={<Toss />} />

                {/* Management */}
                <Route path="/admin/product/new" element={<NewProduct />} />

                <Route path="/admin/product/:id" element={<ProductManagement />} />

                <Route path="/admin/transaction/:id" element={<TransactionManagement />} />

                <Route path="/admin/discount/new" element={<NewDiscount />} />

                <Route path="/admin/discount/:id" element={<DiscountManagement />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
        <Toaster position="bottom-center" />
      </Router>
  )
}

export default App
