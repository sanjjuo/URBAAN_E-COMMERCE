import { Button, Radio } from '@material-tailwind/react'
import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { RiDeleteBin5Line } from 'react-icons/ri'
import { AppContext } from '../../../../StoreContext/StoreContext'
import { useContext } from 'react'
import toast from 'react-hot-toast'

const EditSubCategories = ({ initialSubCategory }) => {
    const { BASE_URL } = useContext(AppContext)
    const [editSubCategoryTitle, setEditSubCategoryTitle] = useState('');
    const [editSubCategorySelect, setEditSubCategorySelect] = useState('');
    const [editSubCategoryImage, setEditSubCategoryImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [editSubCategoryIsActive, setEditSubCategoryIsActive] = useState(true); // Default to 'enable'


    // Handle status change
    const handleStatusChange = (status) => {
        setEditSubCategoryIsActive(status === 'active');
    };

    useEffect(() => {
        if (initialSubCategory) {
            setEditSubCategoryTitle(initialSubCategory.title);
            setEditSubCategorySelect(initialSubCategory.MainCategory);
            setEditSubCategoryImage(initialSubCategory.SubImageUrl);
            console.log(initialSubCategory);
        }
    }, [initialSubCategory]);

    useEffect(() => {
        const fetchEditCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Authorization is missing');
                    return;
                }

                const response = await axios.get(`${BASE_URL}/admin/category/get`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchEditCategories();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditSubCategoryImage({ image: file });
        }
    };

    const handleEditSubCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authorization is missing');
                return;
            }

            const editSubCategoryFormData = new FormData();
            editSubCategoryFormData.append('title', editSubCategoryTitle);
            editSubCategoryFormData.append('MainCategory', editSubCategorySelect.MainCategory);

            if (editSubCategoryImage && editSubCategoryImage.image) {
                editSubCategoryFormData.append('image', editSubCategoryImage.image); // File upload
            } else {
                editSubCategoryFormData.append('image', editSubCategoryImage); // Existing image URL
            }
            editSubCategoryFormData.append('isActive', editSubCategoryIsActive); // Add the status here

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-type': 'multipart/form-data',
            };

            const response = await axios.patch(`${BASE_URL}/admin/Subcategory/update/${initialSubCategory.id}`,
                editSubCategoryFormData, { headers });

            console.log('Subcategory updated:', response.data);
            toast.success('Subcategory is updated!');

            setEditSubCategoryTitle('');
            setEditSubCategorySelect('');
            setEditSubCategoryImage(null);
            setEditSubCategoryIsActive(true)
        } catch (error) {
            console.error('Error updating subcategory:', error.response?.data || error.message);
            alert('Failed to update subcategory.');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md sticky top-5 transition-all duration-300 ease-in-out">
            <div className="p-5">
                <h2 className="text-xl font-medium mb-0 text-secondary">Edit Sub Categories</h2>
            </div>
            <hr />
            <div className="p-5">
                <form className="space-y-5" onSubmit={handleEditSubCategorySubmit}>
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label className="font-normal text-base">Subcategory Title</label>
                        <input
                            type="text"
                            value={editSubCategoryTitle}
                            onChange={(e) => setEditSubCategoryTitle(e.target.value)}
                            placeholder="Subcategory Title"
                            className="border-[1px] text-secondary bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500 focus:outline-none"
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1">
                        <label className="font-normal text-base">Category</label>
                        <select
                            value={editSubCategorySelect.id}
                            onChange={(e) => setEditSubCategorySelect(e.target.value)}
                            className="w-full text-sm text-secondary font-light bg-gray-100/50 border p-2 rounded focus:outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* status type */}

                    <div className='flex flex-col gap-1 w-full'>
                        <label className='font-normal text-base'>Status type</label>
                        <div className="flex gap-10">
                            <Radio
                                name="type"
                                color='green'
                                label="Enable"
                                checked={editSubCategoryIsActive}
                                onChange={() => handleStatusChange('active')}
                            />
                            <Radio
                                name="type"
                                color='pink'
                                label="Disable"
                                checked={!editSubCategoryIsActive}
                                onChange={() => handleStatusChange('inactive')}
                            />
                        </div>
                    </div>


                    {/* Image Upload */}
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="font-normal text-base">Image</label>
                            <RiDeleteBin5Line
                                onClick={() => setEditSubCategoryImage(null)}
                                className="text-deleteBg text-xl hover:text-primary cursor-pointer"
                            />
                        </div>
                        <div className="w-full h-48 flex justify-center items-center border-2 rounded-xl mt-2">
                            {editSubCategoryImage ? (
                                <img
                                    src={editSubCategoryImage.image ? URL.createObjectURL(editSubCategoryImage.image) : editSubCategoryImage}
                                    alt="Uploaded"
                                    className="w-full h-full rounded-lg"
                                />
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        id="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <label htmlFor="file" className="flex flex-col items-center cursor-pointer">
                                        <img src="/imgupload.png" alt="Upload Placeholder" className="w-16" />
                                        <p className="text-secondary text-xs">Browse files to upload</p>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" className="bg-buttonBg font-normal tracking-wider font-custom text-sm">
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSubCategories;
