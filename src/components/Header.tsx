import { useState } from "react"
import { FaSearch, FaShoppingCart, FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa"
import { Link } from "react-router-dom"
import { User } from "../types/types";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface PropsType {
  user: User | null,
}

function Header({ user }: PropsType) {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {cartItems} = useSelector((state: RootState) => state.cartReducer);

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      toast.success("Sign out Successful");
      setIsOpen(false);
    } catch (error) {
      toast.error("Sign out Failed");
    }
  };

  return (
    <>
      <nav className="header">
        <div className="header-left">
          <Link to={"/"}><img className="logo" src="/h2-canteen.webp" /></Link>
        </div>
        <div className="header-right">
          <Link onClick={() => setIsOpen(false)} to={"/"}>Home</Link>
          <Link onClick={() => setIsOpen(false)} to={"/search"}><FaSearch /></Link>
          <Link onClick={() => setIsOpen(false)} to={"/cart"}>
            <div className="nav-cart">
              <FaShoppingCart />
              {cartItems && cartItems.length > 0 && <div className="cart-item-number">{cartItems.length}</div>}
            </div>
          </Link>
          {
            user?._id ? (
              <>
                <button onClick={() => setIsOpen(prev => !prev)}>
                  <FaUser />
                </button>
                <dialog style={{ zIndex: '999', marginTop: '50px', marginLeft: '10px' }} open={isOpen}>
                  <div>
                    {
                      user.role === "admin" && (
                        <Link onClick={() => setIsOpen(false)} to="/admin/dashboard">Admin</Link>
                      )
                    }
                    <Link onClick={() => setIsOpen(false)} to="/orders">Orders</Link>
                    <button onClick={logoutHandler}>
                      <FaSignOutAlt />
                    </button>
                  </div>
                </dialog>
              </>
            ) : <Link to={"/login"}><FaSignInAlt /></Link>
          }
        </div>
      </nav>
      {/* Additional layer below the header */}
      {/* <div style={{
        backgroundColor: 'red',
        color: 'white',
        textAlign: 'center',
        padding: '10px 0',
        fontWeight: 'bold'
      }}>
       This store will be serviceable from 6 PM till 4 AM. Please place your order in the meantime.
      </div> */}
    </>
  )
}

export default Header;
