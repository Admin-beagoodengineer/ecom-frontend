import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.tsx'
import { useLatestProductsQuery } from '../redux/api/productAPI.ts'
import toast from 'react-hot-toast';
import { Skeleton } from '../components/Loader.tsx';
import { CartItem } from '../types/types.ts';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/reducer/cartReducer.ts';
import HomeCarousel from '../components/HomeCarousel.tsx';

function Home() {
  const { data, isError, isLoading } = useLatestProductsQuery("");
  const dispatch = useDispatch();

  const addToCartHandler = (cartItem: CartItem) => {
    if(cartItem.stock < 1) return toast.error("Out of Stock");

    dispatch(addToCart(cartItem));
    toast.success("Item added to Cart");
  };

  if(isError) toast.error("Cannot fetch the Products");

  return (
    <div className='home'>
      <section>
        <HomeCarousel />
      </section>
      <h1>Latest Products
        <Link to={"/search"} className='findmore'>More</Link>
      </h1>

      <main>
        <div className='latest-products-container'>
          { isLoading ? <Skeleton width='80vw' /> :
            data?.products.map((i) => (
              <ProductCard 
                key={i._id}
                productId={i._id} 
                name={i.name} 
                price={i.price} 
                stock={i.stock} 
                photos={i.photos} 
                handler={addToCartHandler} 
              />
            ))
          }
        </div>
      </main>
    </div>
  )
}

export default Home