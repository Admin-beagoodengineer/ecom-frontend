import { FaTrash } from "react-icons/fa6";
import { Skeleton } from "../../../components/Loader";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { RootState, server } from "../../../redux/store";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useFetchData } from "6pp";
import { SingleDiscountResponse } from "../../../types/api.types";

const DiscountManagement = () => {
    const {user} = useSelector((state: RootState) => state.userReducer);
    const {id} = useParams();
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const [codeUpdate, setCodeUpdate] = useState("");
    const [amountUpdate, setAmountUpdate] = useState(0);

    const { data, loading: isLoading, error } = useFetchData<SingleDiscountResponse>({
      url: `${server}/api/v1/payment/coupon/${id}?id=${user?._id}`,
      key: "discount-code",
      dependencyProps: []
    });

    if(error) {
      toast.error(error);
    }
 
    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setBtnLoading(true);

      try {
        const {data} = await axios.put(`${server}/api/v1/payment/coupon/${id}?id=${user?._id}`, {
          code: codeUpdate,
          amount: amountUpdate
        }, {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        });

        if(data.success){
          setAmountUpdate(0);
          setCodeUpdate("");
          toast.success(data.message);
          navigate("/admin/discount");
        }
      } 
      catch (error) {
        // console.log(error);
      }
      finally{
        setBtnLoading(false);
      }
    };

    useEffect(() => {
      if(data){
        setCodeUpdate(data.coupon.code);
        setAmountUpdate(data.coupon.amount);
      }
    }, [data]);

    const deleteHandler = async () => {
      setBtnLoading(true);

      try {
        const {data} = await axios.delete(`${server}/api/v1/payment/coupon/${id}?id=${user?._id}`, {
          withCredentials: true
        });

        if(data.success){
          toast.success(data.message);
          navigate("/admin/discount");
        }
      } 
      catch (error) {
        // console.log(error);
      }
      finally{
        setBtnLoading(false);
      }
    };

    return (
        <div className="admin-container">
          <AdminSidebar />
          <main className="product-management">
            {
              isLoading ? <Skeleton length={20} /> : (
                <>
                    <article>
                        <button className="product-delete-btn" onClick={deleteHandler}>
                        <FaTrash />
                        </button>
                        <form onSubmit={submitHandler}>
                        <h2>Manage</h2>
                        <div>
                            <label>Name</label>
                            <input
                            type="text"
                            placeholder="Coupon Code"
                            value={codeUpdate}
                            onChange={(e) => setCodeUpdate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label>Price</label>
                            <input
                            type="number"
                            placeholder="Price"
                            value={amountUpdate}
                            onChange={(e) => setAmountUpdate(Number(e.target.value))}
                            />
                        </div>

                        <button disabled={btnLoading} type="submit">{btnLoading ? 'Updating...' : 'Update'}</button>
                        </form>
                    </article>
                </>
              )
            }
          </main>
        </div>
    );
};

export default DiscountManagement