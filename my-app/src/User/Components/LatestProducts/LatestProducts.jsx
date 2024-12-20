import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../../StoreContext/StoreContext';
import axios from 'axios';
import AppLoader from '../../../Loader';
import { RiHeart3Line, RiHeart3Fill } from 'react-icons/ri';
import toast from 'react-hot-toast';

const LatestProducts = () => {
  const { BASE_URL, wishlist } = useContext(AppContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heartIcons, setHeartIcons] = useState({}); // Store heart icon state for each product
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/products/view-products`);
        const filteredProducts = response.data.filter(product => product.isLatestProduct);
        setLatestProducts(filteredProducts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching offer products:", error);
      }
    };
    fetchLatestProducts();
  }, []);

  // add to wishlist
  const handleWishlist = async (productId, productTitle) => {
    try {
      const userId = localStorage.getItem('userId');
      const payload = {
        userId: userId,
        productId: productId
      };

      // Check if product is already in wishlist
      const isInWishlist = wishlist?.items?.some(item => item.productId._id === productId);

      if (!isInWishlist) {
        const response = await axios.post(`${BASE_URL}/user/wishlist/add`, payload);
        console.log(response.data);

        // Update heart icon state based on whether product is in wishlist
        setHeartIcons(prevState => ({
          ...prevState,
          [productId]: true, // Toggle the heart icon state
        }));

        toast.success(`${productTitle} ${isInWishlist ? 'removed from' : 'added to'} wishlist`);
      } else {
        toast.error('Product already in wishlist')
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h1 className='text-secondary text-lg xl:text-2xl lg:text-2xl font-semibold text-center xl:text-left'>
        Latest Products
      </h1>
      {isLoading || latestProducts.length === 0 ? (
        <div className="col-span-2 flex justify-center items-center">
          <AppLoader />
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-5 gap-5'>
          {latestProducts.map((product) => {
            const isInWishlist = wishlist?.items?.some(item => item.productId._id === product._id);
            return (
              <div className='group relative' key={product._id}>
                <Link
                  to="/product-details"
                  state={{ productId: product._id }}
                  className="cursor-pointer"
                >
                  <div className='w-full h-52 xl:h-80 lg:h-80 rounded-xl overflow-hidden'>
                    <img
                      src={`${BASE_URL}/uploads/category/${product.images[0]}`}
                      alt={product.title}
                      className='w-full h-full object-cover rounded-xl shadow-md
                        transition transform scale-100 duration-500 ease-in-out cursor-pointer group-hover:scale-105'
                    />
                  </div>
                </Link>
                {heartIcons[product._id] || isInWishlist ? (
                  <RiHeart3Fill
                    onClick={() => handleWishlist(product._id, product.title)}
                    className='absolute top-2 right-2 cursor-pointer text-primary bg-white w-7 h-7 xl:w-8 xl:h-8 lg:w-8 lg:h-8 p-1 rounded-full shadow-md'
                  />
                ) : (
                  <RiHeart3Line
                    onClick={() => handleWishlist(product._id, product.title)}
                    className='absolute top-2 right-2 cursor-pointer bg-white text-gray-600 w-7 h-7 xl:w-8 xl:h-8 lg:w-8 lg:h-8 p-1 rounded-full shadow-md'
                  />
                )}
                <div className='mt-3'>
                  <h4 className='font-medium text-sm xl:text-lg lg:text-lg'>{product.title}</h4>
                  <p className='text-gray-600 font-normal text-xs xl:text-sm lg:text-sm'>{product.description}</p>
                  <p className='text-primary text-base xl:text-xl lg:text-xl font-semibold mt-2'>
                    ₹{product.offerPrice}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default LatestProducts;
