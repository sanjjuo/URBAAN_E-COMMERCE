import React from 'react'
import { Button, Card } from '@material-tailwind/react';
import { DeleteModal } from '../../DeleteModal/DeleteModal';
import { useContext } from 'react';
import { AppContext } from '../../../../StoreContext/StoreContext';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import AppLoader from '../../../../Loader';

const AddedCarousel = ({ createEditCarousel, handleEditCarousel }) => {
    const { open, handleOpen, BASE_URL, modalType } = useContext(AppContext);
    const [adminCarousel, setAdminCarousel] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCarouselId, setSelectedCarouselId] = useState(null);

    useEffect(() => {
        const fetchAdminCarousel = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/admin/slider`);
                setAdminCarousel(response.data);
                setIsLoading(false)
                console.log(response.data);
            } catch (error) {
                console.log("error fetching data:", error);
            }
        }
        fetchAdminCarousel();
    }, [])

    // handle delete

    const handleCarouselDelete = async (carouselId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authorization is missing");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`
            }

            const response = await axios.delete(`${BASE_URL}/admin/slider/${carouselId}`, { headers });
            console.log(response.data);
            handleOpen()
        } catch (error) {
            console.log(error, "error deleting carousel");
            alert('Carousel is not deleted')
        }
    }
    return (
        <>
            {
                isLoading || adminCarousel.length === 0 ? (
                    <div className='col-span-2 flex justify-center items-center h-[50vh]'>
                        <AppLoader />
                    </div>

                ) : (
                    <>
                        {adminCarousel.map((carousel) => (
                            <Card className="p-5 relative" key={carousel._id}>
                                {/* carousel image */}
                                <div className='w-full h-72'>
                                    <img
                                        src={`${BASE_URL}/uploads/category/${carousel.image}`}
                                        alt={carousel.title}
                                        className='w-full h-full object-cover rounded-lg'
                                    />
                                </div>

                                <div className='flex justify-between items-end'>
                                    <ul className="mt-5 space-y-2">
                                        {/* <li className='text-secondary font-bold capitalize text-2xl'>{carousel.category}</li> */}
                                        <li className="flex items-center text-secondary">
                                            <span className="font-semibold w-24">Label:</span>
                                            <span>{carousel.label}</span>
                                        </li>
                                        <li className="flex items-center text-secondary">
                                            <span className="font-semibold w-24">Title:</span>
                                            <span>{carousel.title}</span>
                                        </li>
                                    </ul>
                                    <div className="flex gap-2 text-sm">
                                        <Button
                                            className={`text-sm font-custom capitalize font-normal py-1 px-3 rounded-3xl
                                        ${carousel.isActive ? 'bg-shippedBg text-white' : 'bg-cancelBg text-white'}`}
                                        >
                                            {carousel.isActive ? 'Active' : 'Inactive'}
                                        </Button>

                                        <button
                                            onClick={() => {
                                                setSelectedCarouselId(carousel._id)
                                                handleEditCarousel(carousel)
                                            }}
                                            className={`text-buttonBg bg-editBg w-14 h-7 flex justify-center items-center rounded-md hover:bg-buttonBg 
                                    hover:text-editBg ${createEditCarousel === "editcarousel" && selectedCarouselId === carousel._id ? "!bg-buttonBg text-editBg" : ""}`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedCarouselId(carousel._id);
                                                handleOpen('deleteModal');
                                            }

                                            }
                                            className="text-deleteBg bg-primary/20 w-14 h-7 flex justify-center items-center rounded-md hover:bg-primary hover:text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </>
                )
            }

            <DeleteModal
                open={open === "deleteModal"}
                handleOpen={handleOpen}
                title="Are you sure ?"
                description="Do you really want to delete this Carousel? This action cannot be undone."
                handleDelete={handleCarouselDelete}
                carouselId={selectedCarouselId}
                modalType={"carousel"}
            />
        </>
    )
}

export default AddedCarousel
