import React, { useState, useEffect, useContext } from 'react';
import {
    Card,
    Typography,
    CardBody,
    Chip,
    CardFooter,
    Button,
    IconButton,
} from "@material-tailwind/react";
import MonthMenu from './MonthMenu';
import axios from 'axios';
import { AppContext } from '../../../../StoreContext/StoreContext';

const TABLE_HEAD = ["Product Name", "Location", "Date", "Piece", "Amount", "Status"];

const RecentOrders = () => {
    const [recentOrders, setRecentOrders] = useState([]);
    const { BASE_URL } = useContext(AppContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BASE_URL}/admin/dashboard/view-recent/orders?month=12`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRecentOrders(response.data.data);
                console.log(response.data.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchRecentOrders();
    }, [BASE_URL]);

    // Get current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRecentOrders = recentOrders.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle next and prev page
    const handleNextPage = () => {
        if (currentPage < Math.ceil(recentOrders.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <Card className="w-full p-10">
            <div>
                <ul className="flex items-center justify-between">
                    <li className="text-2xl font-medium text-secondary">Recent Orders</li>
                    <li><MonthMenu /></li>
                </ul>
            </div>
            <CardBody className="p-0 mt-10">
                <table className="w-full table-auto text-left border-collapse">
                    <thead className="bg-quaternary">
                        <tr>
                            {TABLE_HEAD.map((head) => (
                                <th
                                    key={head}
                                    className="border-b border-gray-300 p-4 text-center"
                                >
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-custom text-secondary text-base uppercase"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecentOrders.map((recentOrder, index) => {
                            const isLast = index === currentRecentOrders.length - 1;
                            const classes = isLast
                                ? "p-4 text-center"
                                : "p-4 border-b border-gray-300 text-center";

                            return (
                                <tr key={recentOrder._id}>
                                    <td className={classes}>
                                        <div className="flex items-center gap-2">
                                            {/* <div className="w-[60px] h-[60px] rounded-md">
                                                <img
                                                    src={recentOrder.products[0].productId.image}
                                                    alt={recentOrder.products[0].productId.name}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div> */}
                                            {/* <Typography
                                                variant="small"
                                                className="font-normal font-custom text-sm"
                                            >
                                                {recentOrder.products[0].productId.name}
                                            </Typography> */}
                                        </div>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                            variant="small"
                                            className="font-normal font-custom text-sm"
                                        >
                                            {recentOrder.addressId.address}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                            variant="small"
                                            className="font-normal font-custom text-sm"
                                        >
                                            {new Date(recentOrder.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                            variant="small"
                                            className="font-normal font-custom text-sm"
                                        >
                                            {recentOrder.products[0].quantity}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                            variant="small"
                                            className="font-normal font-custom text-sm"
                                        >
                                            ₹{recentOrder.totalPrice}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Chip
                                            className={`capitalize text-sm text-center font-normal ${recentOrder.status === "delivered"
                                                ? "text-deliveredBg bg-deliveredBg/20"
                                                : recentOrder.status === "Processing"
                                                    ? "text-processingBg bg-processingBg/20"
                                                    : recentOrder.status === "Cancelled"
                                                        ? "text-cancelBg bg-cancelBg/20"
                                                        : recentOrder.status === "Pending"
                                                            ? "text-pendingBg bg-pendingBg/20"
                                                            : recentOrder.status === "Delivered"
                                                                ? "text-shippedBg bg-shippedBg/20"
                                                                : "text-gray-500 bg-gray-200"
                                                }`}
                                            value={recentOrder.status}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </CardBody>
            <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                <Button
                    variant="outlined"
                    size="sm"
                    className='font-custom border-gray-300 font-normal capitalize text-sm cursor-pointer hover:bg-black hover:text-white'
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                >
                    Prev. page
                </Button>

                <div className="flex items-center gap-2">
                    {[...Array(Math.ceil(recentOrders.length / itemsPerPage))].map((_, index) => (
                        <IconButton key={index} variant="text" size="sm" onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </IconButton>
                    ))}
                </div>

                <Button
                    variant="outlined"
                    size="sm"
                    className='font-custom border-gray-300 font-normal capitalize text-sm cursor-pointer hover:bg-black hover:text-white'
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(recentOrders.length / itemsPerPage)}
                >
                    Next page
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RecentOrders;
