import { Button, Card, Radio } from '@material-tailwind/react'
import React, { useState, useEffect, useContext } from 'react'
import { IoIosArrowBack } from 'react-icons/io'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import namer from 'color-namer'; // Import the color-namer library
import { AppContext } from '../../../StoreContext/StoreContext'
import AppLoader from '../../../Loader'

const Checkout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const checkoutDetailsId = location.state.checkoutId
    const { BASE_URL, viewCart } = useContext(AppContext);
    const [checkoutData, setCheckoutData] = useState({});
    const [isLoading, setIsLoading] = useState(true)
    const [deliveryCharge, setDeliveryCharge] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Online Payment')

    const checkoutDetails = checkoutData.checkout;
    console.log(checkoutDetails);

    // token and userId
    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');


    // Function to get the nearest named color
    const getNamedColor = (colorCode) => {
        try {
            const namedColors = namer(colorCode);
            return namedColors.pantone[0].name || "Unknown Color";
        } catch (error) {
            console.error("Invalid color code:", error);
            return "Invalid Color";
        }
    };

    useEffect(() => {
        const fetchCheckoutDetails = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/user/checkout/checkout/${checkoutDetailsId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCheckoutData(response.data || {});
                console.log(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching checkout details:', error);
            }
        };
        fetchCheckoutDetails();
    }, [BASE_URL, checkoutDetailsId]);


    useEffect(() => {
        const fetchDeliveryChargeList = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/admin/delivery-fee/view`);
                const deliveryFees = response.data.data || [];
                setDeliveryCharge(deliveryFees);
            } catch (error) {
                console.error('Error fetching delivery charge list:', error);
            }
        };
        fetchDeliveryChargeList();
    }, [BASE_URL]);


    // Calculate the delivery charge based on the cart items and available delivery fees
    const calculateDeliveryCharge = (cartItems) => {
        if (!deliveryCharge.length || !cartItems) return 0;

        let totalDeliveryFee = 0;
        cartItems.forEach((item) => {
            // Find the closest delivery fee matching the quantity in cart
            const matchingFees = deliveryCharge.filter((fee) => fee.quantity <= item.quantity);
            const bestMatch = matchingFees.length > 0 ? matchingFees[matchingFees.length - 1].deliveryFee : 0;
            totalDeliveryFee += bestMatch;
        });

        return totalDeliveryFee;
    };

    // // Calculate subtotal (cart items total amount multiplied with total quantity)
    // const calculateSubtotal = (cartItems) => {
    //     if (!cartItems) return 0;

    //     return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    // };

    const calculateTotalPrice = () => {
        const subtotal = viewCart.totalPrice;
        const deliveryCharge = calculateDeliveryCharge(checkoutDetails?.cartItems);

        return subtotal + deliveryCharge;
    };

    // handleSubmitOrder
    const handleSubmitOrder = async () => {
        try {
            const orderPayload = {
                userId: userId,
                addressId: checkoutDetails.addressId._id,
                products: checkoutDetails.cartItems,
                totalPrice: checkoutDetails.totalPrice,
                deliveryCharge: calculateDeliveryCharge(checkoutDetails?.cartItems),
                paymentMethod: paymentMethod
            }

            console.log(orderPayload);

            const response = await axios.post(`${BASE_URL}/user/order/create`, orderPayload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div className="p-4 xl:py-16 xl:px-32 lg:py-16 lg:px-32 bg-userBg h-[calc(100vh-4rem)] pb-20 overflow-y-auto">
                <h1 className="flex items-center gap-2 text-lg xl:text-xl lg:text-xl font-medium cursor-pointer" onClick={() => navigate(-1)}>
                    <IoIosArrowBack className="text-secondary text-2xl cursor-pointer" /> Back
                </h1>
                <div className='grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 mt-10 gap-5'>
                    {isLoading ? (
                        <div className='flex justify-center items-center h-[50vh]'>
                            <AppLoader />
                        </div>
                    ) : (
                        <>
                            <Card className='p-4 xl:p-6 lg:p-6 h-fit'>
                                <h1 className='text-secondary font-medium capitalize text-xl mb-3'>Delivery address information</h1>
                                <form action="" className='space-y-3'>
                                    {/* name */}
                                    <div className="flex flex-col gap-1 w-full">
                                        <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={checkoutDetails?.addressId?.name}
                                            id="name"
                                            disabled
                                            className="border-[2px] capitalize bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    {/* email */}
                                    <div className="flex flex-col gap-1 w-full">
                                        <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            disabled
                                            value={checkoutDetails?.addressId?.email}
                                            className="border-[1px] capitalize bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    {/* number */}
                                    <div className="flex flex-col gap-1 w-full">
                                        <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                            Phone Number
                                        </label>
                                        <input
                                            type="number"
                                            name="number"
                                            id="number"
                                            disabled
                                            value={checkoutDetails?.addressId?.number}
                                            className="border-[1px] capitalize bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    {/* address */}
                                    <div className="flex flex-col gap-1 w-full">
                                        <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            id="address"
                                            disabled
                                            value={checkoutDetails?.addressId?.address}
                                            className="border-[1px] capitalize bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    {/* landmark */}
                                    <div className="flex flex-col gap-1 w-full">
                                        <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                            Landmark
                                        </label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            id="landmark"
                                            disabled
                                            value={checkoutDetails?.addressId?.landmark}
                                            className="border-[1px] capitalize bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                        />
                                    </div>
                                    {/* city state pincode */}
                                    <div className="flex gap-1 w-full">
                                        {/* city */}
                                        <div className="flex flex-col gap-1 w-1/3">
                                            <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="text"
                                                id="text"
                                                disabled
                                                value={checkoutDetails?.addressId?.city}
                                                className="border-[1px] capitalize w-full bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                            />
                                        </div>
                                        {/* state */}
                                        <div className="flex flex-col gap-1 w-1/3">
                                            <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                name="text"
                                                id="text"
                                                disabled
                                                value={checkoutDetails?.addressId?.state}
                                                className="border-[1px] capitalize w-full bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                            />
                                        </div>
                                        {/* pincode */}
                                        <div className="flex flex-col gap-1 w-1/3">
                                            <label htmlFor="name" className="font-medium text-sm xl:text-base lg:text-base text-secondary">
                                                Pin Code
                                            </label>
                                            <input
                                                type="number"
                                                name="number"
                                                id="number"
                                                disabled
                                                value={checkoutDetails?.addressId?.pincode}
                                                className="border-[1px] capitalize w-full bg-gray-100 border-gray-100 text-gray-600 p-2 rounded-lg focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </Card>
                        </>
                    )}
                    {/* cart and total price */}
                    {isLoading || checkoutDetails?.cartItems === 0 ? (
                        <div className='flex justify-center items-center h-[50vh]'>
                            <AppLoader />
                        </div>
                    ) : (
                        <>
                            <div className='space-y-5'>
                                {/* cart */}
                                <Card className='p-4 xl:p-6 lg:p-6 h-[500px] overflow-y-auto hide-scrollbar'>
                                    <h1 className='text-secondary font-medium capitalize text-lg mb-3'>Review your cart</h1>
                                    <div>
                                        {checkoutDetails?.cartItems?.map((item, index) => (
                                            <div key={index} className='flex gap-5 mb-4'>
                                                <div className='w-20 h-28 xl:w-28 xl:h-32'>
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="w-full h-full object-cover rounded-lg"
                                                        onError={(e) => e.target.src = '/no-image.jpg'}
                                                    />
                                                </div>
                                                <div className='flex flex-col justify-between'>
                                                    <div>
                                                        <h1 className='text-base text-secondary font-medium xl:mb-2 lg:mb-2'>{item?.name || 'No name'}</h1>
                                                        <ul className='xl:space-y-1 lg:space-y-1'>
                                                            <li className='text-sm capitalize text-secondary'>Color : {getNamedColor(item.color)}</li>
                                                            <li className='text-sm capitalize text-secondary'>Size : {item.size}</li>
                                                            <li className='text-sm capitalize text-secondary'>Quantity : {item.quantity}</li>
                                                        </ul>
                                                    </div>
                                                    <div className='mt-2'>
                                                        <p className='text-secondary font-semibold text-xl'>₹{item.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                                {/* total price */}
                                <Card className='p-4 xl:p-6 lg:p-6'>
                                    <ul className='space-y-2'>
                                        <li className='flex items-center justify-between'>
                                            <span className='text-secondary flex items-center gap-3'>Subtotal
                                                <span className='text-sm'>(Including discount)</span></span>
                                            <span className='text-secondary font-bold'>₹{checkoutDetails?.discountedTotal || 0.00}</span>
                                        </li>
                                        <li className='flex items-center justify-between'>
                                            <span className='text-secondary'>Shipping</span>
                                            <span className='text-secondary font-bold'>
                                                ₹{calculateDeliveryCharge(checkoutDetails?.cartItems)}
                                            </span>
                                        </li>
                                        <li className='flex items-center justify-between'>
                                            <span className='text-secondary'>Discount</span>
                                            <span className='text-secondary font-bold'>{checkoutDetails?.coupenAmount || 0.00}</span>
                                        </li>
                                        <li className='flex items-center justify-between'>
                                            <span className='text-secondary'>Total</span>
                                            <span className='text-secondary font-bold'>
                                                ₹{calculateTotalPrice()}
                                            </span>
                                        </li>

                                    </ul>
                                    <div className='mt-5'>
                                        <h3 className='font-medium text-sm xl:text-base lg:text-base text-secondary'>Payment Options</h3>
                                        <div className='flex flex-col xl:flex-row lg:flex-row lg:items-center xl:items-center gap-0 xl:gap-10 lg:gap-10'>
                                            <Radio
                                                name="type"
                                                label="Online Payment"
                                                color='pink'
                                                checked={paymentMethod === 'Online Payment'}
                                                onChange={() => setPaymentMethod('Online Payment')} // Explicitly setting the value
                                            />
                                            <Radio
                                                name="type"
                                                label="Cash on Delivery"
                                                color='pink'
                                                checked={paymentMethod === 'Cash on Delivery'}
                                                onChange={() => setPaymentMethod('Cash on Delivery')} // Explicitly setting the value
                                            />

                                        </div>
                                    </div>
                                    <Link to='/order'>
                                        <Button onClick={handleSubmitOrder} className='hidden xl:block lg:block mt-5 bg-primary font-custom capitalize font-normal text-sm tracking-wider hover:bg-secondary'>Confirm Order</Button>
                                    </Link>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className='bg-white shadow-md fixed bottom-0 inset-x-0 z-50 w-full p-4 xl:hidden lg:hidden'>
                <Link to='/order'>
                    <Button onClick={handleSubmitOrder} className='w-full bg-primary font-custom capitalize font-normal text-sm tracking-wider hover:bg-secondary'>Confirm Order</Button>
                </Link>
            </div>
        </>
    )
}

export default Checkout
