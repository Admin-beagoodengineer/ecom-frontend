import { FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { UserReducerInitialState } from "../../../types/reducer.types";
import { useSelector } from "react-redux";
import { useDeleteProductMutation, useProductDetailsQuery, useUpdateProductMutation } from "../../../redux/api/productAPI";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "../../../components/Loader";
import { responseToast, transformImage } from "../../../utils/features";
import { useFileHandler } from "6pp";

const Productmanagement = () => {
  const {user} = useSelector((state:{userReducer:UserReducerInitialState}) => state.userReducer);
  const params = useParams();
  const {data, isLoading, isError} = useProductDetailsQuery(params.id!);
  const navigate = useNavigate();

  const {price, stock, name, photos ,category, description} = data?.product || {
    price: 0,
    stock: 0,
    name: "",
    photos: [],
    category: "",
    description: ""
  };

  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [nameUpdate, setNameUpdate] = useState<string>(name);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  const [descriptionUpdate, setDescriptionUpdate] = useState<string>(description);
  const [isUpdating, setIsUpdating] = useState(false);

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
  //   const file: File | undefined = e.target.files?.[0];

  //   const reader: FileReader = new FileReader();

  //   if (file) {
  //     reader.readAsDataURL(file);
  //     reader.onloadend = () => {
  //       if (typeof reader.result === "string") {
  //         setPhotoUpdate(reader.result);
  //         setPhotoFile(file);
  //       }
  //     };
  //   }
  // };

  const photoFiles = useFileHandler("multiple", 10, 5);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      if(nameUpdate) formData.set("name", nameUpdate);
      if(priceUpdate) formData.set("price", priceUpdate.toString());
      if(stockUpdate !== undefined) formData.set("stock", stockUpdate.toString());
      if(categoryUpdate) formData.set("category", categoryUpdate);
      if(descriptionUpdate) formData.set("description", descriptionUpdate);

      if(photoFiles.file && photoFiles.file.length > 0){
        photoFiles.file.forEach((file) => {
          formData.append("photos", file);
        })
      }
  
      const res = await updateProduct({formData, userId: user?._id!, productId: data?.product._id!});
  
      responseToast(res, navigate, "/admin/product");
    } 
    catch (error) {
      // console.log(error);
    }
    finally{
      setIsUpdating(false);
    }
  };

  const deleteHandler = async () => {
    const res = await deleteProduct({userId: user?._id!, productId: data?.product._id!});

    responseToast(res, navigate, "/admin/product");
  };

  useEffect(() => {
    if(data) {
      setNameUpdate(data.product.name);
      setPriceUpdate(data.product.price);
      setStockUpdate(data.product.stock);
      setCategoryUpdate(data.product.category);
      setDescriptionUpdate(data.product.description);
    }
  }, [data]);

  if(isError) return <Navigate to={"/404"} />

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {
          isLoading ? <Skeleton length={20} /> : (
            <>
              <section>
                <strong>ID - {data?.product._id}</strong>
                <img src={transformImage(photos[0]?.url)} alt="Product" />
                <p>{name}</p>
                {stock > 0 ? (
                  <span className="green">{stock} Available</span>
                ) : (
                  <span className="red"> Not Available</span>
                )}
                <h3>₹{price}</h3>
              </section>
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
                      placeholder="Name"
                      value={nameUpdate}
                      onChange={(e) => setNameUpdate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Description</label>
                    <textarea
                      placeholder="Description"
                      value={descriptionUpdate}
                      onChange={(e) => setDescriptionUpdate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Price</label>
                    <input
                      type="number"
                      placeholder="Price"
                      value={priceUpdate}
                      onChange={(e) => setPriceUpdate(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Stock</label>
                    <input
                      type="number"
                      placeholder="Stock"
                      value={stockUpdate}
                      onChange={(e) => setStockUpdate(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label>Category</label>
                    <input
                      type="text"
                      placeholder="eg. laptop, camera etc"
                      value={categoryUpdate}
                      onChange={(e) => setCategoryUpdate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Photos</label>
                    <input 
                      type="file"
                      accept="image/" 
                      multiple
                      onChange={photoFiles.changeHandler} />
                  </div>

                  {
                    photoFiles.error && <p>{photoFiles.error}</p>
                  }

                  {
                    photoFiles.preview && 
                    <div style={{display: 'flex', gap: '1rem', overflowX: 'auto'}}>
                      {
                        photoFiles.preview.map((img, i) => (
                          <img style={{width: 100, height: 100, objectFit: 'contain'}} key={i} src={img} alt="New Image" />
                        ))
                      }
                    </div>
                  }

                  <button disabled={isUpdating} type="submit">{isUpdating ? 'Updating...' : 'Update'}</button>
                </form>
              </article>
            </>
          )
        }
      </main>
    </div>
  );
};

export default Productmanagement;
