import { Button, Checkbox, Typography } from '@material-tailwind/react';
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa6';
import { IoIosArrowBack, IoMdCloudUpload } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { useContext } from 'react';
import { AppContext } from '../../../../StoreContext/StoreContext';
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiMiniXMark } from 'react-icons/hi2';


const AddProduct = () => {
    const { BASE_URL } = useContext(AppContext) //BASE URL
    const navigate = useNavigate()
    const [attributeFields, setAttributeFields] = useState([{ color: "", sizes: [{ size: "", stock: "" }] }]);
    const [productTitle, setProductTitle] = useState('')
    const [productCategory, setProductCategory] = useState('')
    const [productSubCategory, setProductSubCategory] = useState('')
    const [productActualPrice, setProductActualPrice] = useState('')
    const [productDiscount, setProductDiscount] = useState('')
    const [productOfferPrice, setProductOfferPrice] = useState('')
    const [checkboxes, setCheckboxes] = useState({
        latest: false,
        offer: false,
        featured: false,
    });
    const [specifications, setSpecifications] = useState({
        netWeight: '',
        fit: '',
        sleevesType: '',
        Length: '',
        occasion: '',
        innerLining: '',
        material: ''
    });

    const [productDescription, setProductDescription] = useState('')
    const [productImage, setProductImage] = useState([])
    const [productManuName, setProductManuName] = useState('')
    const [productManuBrand, setProductManuBrand] = useState('')
    const [productManuAddress, setProductManuAddress] = useState('')
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [filteredSubCategories, setFilteredSubCategories] = useState([]); //for getting subcategory having same catgeory id

    // handle image
    const handleProductImageUpload = (e) => {
        const files = Array.from(e.target.files); // Convert FileList to array
        setProductImage((prevImages) => [...prevImages, ...files]); // Append new files
    };

    // manage text color based ob bg-color
    const getContrastYIQ = (color) => {
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) return 'text-black'; // Default to black for invalid or empty colors
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? 'text-black' : 'text-white';
    };

    // handle input change of specifications
    const handleSpecificationChange = (e, key) => {
        setSpecifications(prev => ({
            ...prev,
            [key]: e.target.value
        }));
    };

    // Handler for checkbox change
    const handleCheckboxChange = (e, checkboxName) => {
        setCheckboxes({ ...checkboxes, [checkboxName]: e.target.checked });
    };

    // fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/admin/category/get`);
                setCategories(response.data);
                console.log(response.data);
            } catch (error) {
                console.log(error, ": Error fetching data");
            }
        }
        fetchCategories();
    }, [])


    // price computation
    useEffect(() => {
        if (productActualPrice && productDiscount) {
            // Convert discount percentage to decimal and calculate offer price
            const discountValue = parseFloat(productDiscount) / 100;
            const calculatedOfferPrice = productActualPrice - (productActualPrice * discountValue);
            setProductOfferPrice(calculatedOfferPrice.toFixed(2)); // Limit to 2 decimal places
        }
    }, [productActualPrice, productDiscount]);


    // subcategory display based on category id
    useEffect(() => {
        if (productCategory) {
            const filtered = subCategories.filter(
                (subcategory) => subcategory.MainCategory.id === productCategory
            );
            setFilteredSubCategories(filtered);
        } else {
            setFilteredSubCategories([]);
        }
    }, [productCategory, subCategories]);

    // fetch Sub categories
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/admin/Subcategory/get`);
                setSubCategories(response.data)
                console.log(response.data);
            } catch (error) {
                console.log(error, ": error fetching sub categories");
            }
        }
        fetchSubCategories();
    }, [])

    // form submission
    const handleCreateProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authorization is missing");
                return;
            }

            // Validate inputs
            if (!productTitle.trim() || !productCategory.trim()) {
                alert("Product title and category are required");
                return;
            }

            const productFormData = new FormData();
            productFormData.append('title', productTitle);
            productFormData.append('category', productCategory);
            productFormData.append('subcategory', productSubCategory);
            productFormData.append('actualPrice', productActualPrice);
            productFormData.append('discount', productDiscount);
            // Calculate offer price
            const calculatedOfferPrice = productActualPrice - (productActualPrice * (productDiscount / 100));
            productFormData.append('offerPrice', calculatedOfferPrice.toFixed(2));
            productFormData.append('isLatestProduct', checkboxes.latest);
            productFormData.append('isOfferProduct', checkboxes.offer);
            productFormData.append('isFeaturedProduct', checkboxes.featured);
            productFormData.append('description', productDescription);
            // Append specifications to features
            Object.entries(specifications).forEach(([key, value]) => {
                productFormData.append(`features[${key}]`, value || null);
            });
            // Append images
            productImage.forEach((image) => {
                productFormData.append('images', image);
            });
            //append color size and stock
            const colors = attributeFields.reduce((acc, field) => {
                if (field.color.trim()) {
                    const validSizes = field.sizes
                        .filter(size =>
                            size.size.trim() &&
                            size.stock !== '' &&
                            !isNaN(Number(size.stock))
                        )
                        .map(size => ({
                            size: size.size.trim(),
                            stock: Number(size.stock)
                        }));

                    if (validSizes.length > 0) {
                        acc.push({
                            color: field.color.trim(),
                            sizes: validSizes
                        });
                    }
                }
                return acc;
            }, []);

            // Ensure colors are added correctly
            if (colors.length > 0) {
                productFormData.append('colors', JSON.stringify(colors));
            }
            // Append manufacturer details
            productFormData.append('manufacturerName', productManuName);
            productFormData.append('manufacturerBrand', productManuBrand);
            productFormData.append('manufacturerAddress', productManuAddress);

            // Debugging: Log the FormData
            for (const [key, value] of productFormData.entries()) {
                console.log(key, value);
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            };

            const response = await axios.post(
                `${BASE_URL}/admin/products/create-product`,
                productFormData,
                { headers }
            );

            console.log(response.data);
            toast.success("Product is created");

            // Reset form
            setProductTitle('');
            setProductCategory('');
            setProductSubCategory('');
            setProductActualPrice('');
            setProductDiscount('');
            setCheckboxes({ latest: false, offer: false, featured: false });
            setSpecifications({ netWeight: "", fit: "", sleevesType: "", Length: "", occasion: "", innerLining: "", material: "" })
            setAttributeFields([{ color: "", size: "", stock: "" }]);
            setProductDescription('');
            setProductImage([]);
            setProductManuName('');
            setProductManuBrand('');
            setProductManuAddress('');
        } catch (error) {
            console.error("Error in form submission:", error?.response?.data || error.message);
            alert(error?.response?.data?.message || "Product is not created");
        }
    };


    const handleAddColorField = () => {
        setAttributeFields([...attributeFields, { color: "", sizes: [{ size: "", stock: "" }] }]);
    };

    const handleDeleteColorField = (index) => {
        if (attributeFields.length > 1) {
            setAttributeFields(attributeFields.filter((_, i) => i !== index));
        }
        else {
            toast.error("Atleast one attribute field is required");
        }
    };


    const handleAddSizeField = (colorIndex) => {
        const updatedFields = [...attributeFields];
        updatedFields[colorIndex].sizes.push({ size: "", stock: "" });
        setAttributeFields(updatedFields);
    };


    const handleDeleteSizeField = (colorIndex, sizeIndex) => {
        const updatedFields = [...attributeFields];

        if (updatedFields[colorIndex]?.sizes && updatedFields[colorIndex].sizes.length > 1) {
            updatedFields[colorIndex].sizes = updatedFields[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
        } else {
            toast.error("Sizes and Stock is required");
        }

        setAttributeFields(updatedFields);
    };


    const handleSizeFieldChange = (colorIndex, sizeIndex, key, value) => {
        const updatedFields = [...attributeFields];

        // Check if 'sizes' exists and is an array
        if (updatedFields[colorIndex]?.sizes) {
            updatedFields[colorIndex].sizes[sizeIndex][key] = value;
        }
        setAttributeFields(updatedFields);
    };

    // Handle input changes
    const handleAttributeInputChange = (index, key, value) => {
        const updatedFields = [...attributeFields];
        updatedFields[index][key] = value;
        setAttributeFields(updatedFields);
    };


    return (
        <>
            <p onClick={() => navigate(-1)} className='flex items-center cursor-pointer hover:text-primary'>
                <IoIosArrowBack /> Back</p>
            <h1 className='text-2xl lg:text-3xl font-semibold'>Create Product</h1>
            <form action='' className="grid lg:grid-cols-2 gap-10 mt-5" onSubmit={handleCreateProductSubmit}>
                <div className='bg-white rounded-xl shadow-md h-fit'>
                    <div className='p-5'>
                        <h2 className="text-xl font-medium mb-3 lg:mb-0 text-secondary">Product Information</h2>
                    </div>
                    <hr />
                    <div className='p-5 space-y-6'>
                        {/* title */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="" className='font-normal text-base'>Product title</label>
                            <input
                                type="text"
                                name="name"
                                value={productTitle}
                                onChange={(e) => setProductTitle(e.target.value)}
                                id=""
                                placeholder='Enter Product title'
                                className='border-[1px] 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                     focus:outline-none'/>
                        </div>

                        {/* category */}
                        <div className='flex justify-between items-center gap-2'>
                            <div className='flex flex-col gap-1 w-full'>
                                <label className='font-normal text-base'>Product Category</label>
                                <select
                                    name="selectField"
                                    value={productCategory}
                                    onChange={(e) => setProductCategory(e.target.value)}
                                    className="w-full text-sm text-secondary font-light bg-gray-100/50 border p-2 rounded focus:outline-none focus:cursor-pointer"
                                >
                                    <option value="Option 1">Select Category</option>
                                    {
                                        categories.map((category) => (
                                            <option key={category.id} value={category.id} className='capitalize'>{category.name}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            {/* subcategory */}
                            <div className='flex flex-col gap-1 w-full'>
                                <label className='font-normal text-base'>Sub Category</label>
                                <select
                                    name="selectField"
                                    value={productSubCategory}
                                    onChange={(e) => setProductSubCategory(e.target.value)}
                                    className="w-full text-sm text-secondary font-light bg-gray-100/50 border p-2 rounded focus:outline-none focus:cursor-pointer"
                                >
                                    <option value="Option 1">Select SubCategory</option>
                                    {
                                        filteredSubCategories.map((subcategory) => (
                                            <option key={subcategory.id} value={subcategory.id} className='capitalize'>{subcategory.title}</option>
                                        ))
                                    }

                                </select>
                            </div>
                        </div>
                        {/* price */}
                        <div className='flex justify-between items-center gap-2'>
                            <div className='flex flex-col gap-1 w-1/3'>
                                <label className='font-normal text-base'>Actual Price</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={productActualPrice}
                                    onChange={(e) => setProductActualPrice(e.target.value)}
                                    id=""
                                    placeholder='Actual Price'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                     focus:outline-none'/>
                            </div>
                            <div className='flex flex-col gap-1 w-1/3'>
                                <label className='font-normal text-base'>Discount (%)</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={productDiscount}
                                    onChange={(e) => setProductDiscount(e.target.value)}
                                    id=""
                                    placeholder='Discount'
                                    className='border-[1px] w-full
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                     focus:outline-none'/>
                            </div>
                            {/* offer price */}
                            <div className='flex flex-col gap-1 w-1/3'>
                                <label htmlFor="" className='font-normal text-base'>Offer Price</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={productOfferPrice}
                                    onChange={(e) => setProductOfferPrice(e.target.value)}
                                    id=""
                                    placeholder='Offer price'
                                    className='border-[1px] w-full
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                     focus:outline-none'/>
                            </div>
                        </div>
                        {/* checkboxes eg:latest, featured, offer */}
                        <div className='flex items-center justify-between'>
                            <Checkbox label={
                                <Typography className='font-custom text-secondary text-base font-normal'>Latest Products</Typography>}
                                color='pink'
                                value={checkboxes.latest}
                                onChange={(e) => handleCheckboxChange(e, 'latest')}
                                className='border-2 border-primary rounded-sm w-4 h-4'
                            />
                            <Checkbox label={
                                <Typography className='font-custom text-secondary text-base font-normal'>Offer Products</Typography>}
                                color='pink'
                                value={checkboxes.offer}
                                onChange={(e) => handleCheckboxChange(e, 'offer')}
                                className='border-2 border-primary rounded-sm w-4 h-4'
                            />
                            <Checkbox label={
                                <Typography className='font-custom text-secondary text-base font-normal'>Featured Products</Typography>}
                                color='pink'
                                value={checkboxes.featured}
                                onChange={(e) => handleCheckboxChange(e, 'featured')}
                                className='border-2 border-primary rounded-sm w-4 h-4'
                            />
                        </div>

                        {/* specifications */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="" className='font-normal text-base'>Specifications</label>
                            <div className='flex items-center gap-1 mt-4'>
                                <label htmlFor="" className='font-normal text-sm w-32'>NetWeight</label>
                                <input
                                    type="text"
                                    name="value"
                                    value={specifications.netWeight}
                                    onChange={(e) => handleSpecificationChange(e, 'netWeight')}
                                    placeholder='value'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                    focus:outline-none'
                                />
                            </div>
                            <div className='flex items-center gap-1'>
                                <label htmlFor="" className='font-normal text-sm w-32'>Fit</label>
                                <input
                                    type="text"
                                    name="value"
                                    value={specifications.fit}
                                    onChange={(e) => handleSpecificationChange(e, 'fit')}
                                    placeholder='value'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                    focus:outline-none'
                                />
                            </div>
                            <div className='flex items-center gap-1'>
                                <label htmlFor="" className='font-normal text-sm w-32'>Sleeves Type</label>
                                <input
                                    type="text"
                                    name="value"
                                    value={specifications.sleevesType}
                                    onChange={(e) => handleSpecificationChange(e, 'sleevesType')}
                                    placeholder='value'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                    focus:outline-none'
                                />
                            </div>
                            <div className='flex items-center gap-1'>
                                <label htmlFor="" className='font-normal text-sm w-32'>Length</label>
                                <input
                                    type="text"
                                    name="value"
                                    value={specifications.Length}
                                    onChange={(e) => handleSpecificationChange(e, 'Length')}
                                    placeholder='value'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                    focus:outline-none'
                                />
                            </div>
                            <div className='flex items-center gap-1'>
                                <label htmlFor="" className='font-normal text-sm w-32'>Occassion</label>
                                <input
                                    type="text"
                                    name="value"
                                    value={specifications.occasion}
                                    onChange={(e) => handleSpecificationChange(e, 'occasion')}
                                    placeholder='value'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                    focus:outline-none'
                                />
                            </div>
                            <div className='flex items-center gap-1'>
                                <label htmlFor="" className='font-normal text-sm w-32'>Inner Lining</label>
                                <input
                                    type="text"
                                    name="value"
                                    value={specifications.innerLining}
                                    onChange={(e) => handleSpecificationChange(e, 'innerLining')}
                                    placeholder='value'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                    focus:outline-none'
                                />
                            </div>
                            <div className='flex items-center gap-1'>
                                <label htmlFor="" className='font-normal text-sm w-32'>Material</label>
                                <input
                                    type="text"
                                    name="value"
                                    value={specifications.material}
                                    onChange={(e) => handleSpecificationChange(e, 'material')}
                                    placeholder='value'
                                    className='border-[1px] w-full 
                                    bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                                    focus:outline-none'
                                />
                            </div>
                        </div>


                        {/* description */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="" className='font-normal text-base'>Product Description</label>
                            <textarea
                                name="description"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                rows="10"
                                className="w-full border-[1px] bg-gray-100/50 p-2 rounded resize-none overflow-y-scroll focus:outline-none
                                        placeholder:text-sm placeholder:font-light placeholder:text-gray-500 hide-scrollbar"
                                placeholder="Enter your description here..."
                                style={{ maxHeight: '100px' }}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* second col */}
                {/* photo upload */}
                <div className='bg-white rounded-xl shadow-md p-5 space-y-6 h-fit'>
                    <div className='flex gap-5'>
                        <div className="flex flex-col justify-center items-center w-72 h-56 border-4 border-dashed border-primary rounded-xl">
                            <input
                                type="file"
                                id="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleProductImageUpload}
                            />
                            <label htmlFor="file" className="flex flex-col items-center cursor-pointer">
                                <IoMdCloudUpload className="text-primary text-5xl" />
                                <p className="text-secondary text-xs">Browse files to upload</p>
                            </label>
                        </div>

                        <ul className="flex-1 space-y-2 h-56 overflow-y-auto hide-scrollbar">
                            {productImage.length === 0 ? (
                                <p className="text-xs text-gray-600 font-normal flex justify-center items-center h-full">
                                    Your selected images display here
                                </p>
                            ) : (
                                productImage.map((image, index) => (
                                    <li key={index} className="flex items-start justify-between bg-primary/15 rounded-md p-2">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-[60px] h-[60px]">
                                                <img src={URL.createObjectURL(image)} alt="" className="w-full h-full object-cover rounded-md" />
                                            </div>
                                            <p className="text-secondary font-normal text-xs">{image.name}</p> {/* Display file name */}
                                        </div>
                                        <MdDelete
                                            onClick={() => setProductImage((prevImages) => prevImages.filter((_, imgIndex) => imgIndex !== index))}
                                            className="text-deleteBg text-lg cursor-pointer hover:text-primary"
                                        />
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* manufacter name */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="" className='font-normal text-base'>Manufacturer Name</label>
                        <input
                            type="text"
                            name="name"
                            value={productManuName}
                            onChange={(e) => setProductManuName(e.target.value)}
                            id=""
                            placeholder='Enter Name'
                            className='border-[1px] 
                        bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                            focus:outline-none'/>
                    </div>

                    {/* manufacter brand */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="" className='font-normal text-base'>Manufacturer Brand</label>
                        <input
                            type="text"
                            name="name"
                            value={productManuBrand}
                            onChange={(e) => setProductManuBrand(e.target.value)}
                            id=""
                            placeholder='Enter Brand'
                            className='border-[1px] 
                        bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                            focus:outline-none'/>
                    </div>

                    {/* manufacter address */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="" className='font-normal text-base'>Manufacturer Address</label>
                        <input
                            type="text"
                            name="name"
                            value={productManuAddress}
                            onChange={(e) => setProductManuAddress(e.target.value)}
                            id=""
                            placeholder='Enter Address'
                            className='border-[1px] 
                        bg-gray-100/50 p-2 rounded-md placeholder:text-sm placeholder:font-light placeholder:text-gray-500
                            focus:outline-none'/>
                    </div>

                    {/* color size stock */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="">Set Product Attributes</label>
                            <FaPlus
                                className="text-2xl text-primary cursor-pointer"
                                onClick={handleAddColorField}
                            />
                        </div>
                        {attributeFields.map((field, colorIndex) => (
                            <div key={colorIndex} className="flex flex-col gap-2">
                                {/* Color Picker and Header */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="w-64 bg-primary text-white rounded-md font-custom tracking-wider flex items-center justify-center gap-2 p-2 cursor-pointer relative">
                                            <input
                                                type="color"
                                                value={field.color}
                                                onChange={(e) => handleAttributeInputChange(colorIndex, "color", e.target.value)}
                                                className="absolute w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <p className='text-sm flex items-center gap-2'><FaPlus className="text-base" />Add Color</p>
                                        </div>
                                        <div className='w-full'>
                                            <input
                                                type="text"
                                                value={field.color}
                                                placeholder="Enter color name or color code"
                                                onChange={(e) => handleAttributeInputChange(colorIndex, "color", e.target.value)}
                                                className={`w-full p-2 text-center bg-gray-100/50 border rounded-md text-sm uppercase placeholder:capitalize focus:outline-none ${getContrastYIQ(field.color)}`}
                                                style={{ backgroundColor: field.color }}
                                            />
                                        </div>
                                    </div>
                                    <MdDelete
                                        className="text-xl text-primary cursor-pointer"
                                        onClick={() => handleDeleteColorField(colorIndex)}
                                    />
                                </div>

                                {/* Sizes and Stock Table */}
                                <div className='flex flex-col gap-2'>
                                    {Array.isArray(field.sizes) && field.sizes.map((sizeField, sizeIndex) => (
                                        <div key={sizeIndex} className="flex items-center justify-between gap-2">
                                            <Button
                                                onClick={() => handleAddSizeField(colorIndex)}
                                                className='bg-gray-100/50 border border-gray-300 text-secondary shadow-none rounded-3xl w-11 h-10 p-2 flex items-center justify-center 
                                                font-custom font-normal capitalize text-sm hover:shadow-none'
                                            ><FaPlus /></Button>
                                            <div className='flex items-center gap-2 w-full'>
                                                <input
                                                    type="text"
                                                    value={sizeField.size}
                                                    placeholder="Enter size"
                                                    onChange={(e) => handleSizeFieldChange(colorIndex, sizeIndex, "size", e.target.value)}
                                                    className="border w-full bg-gray-100/50 p-2 rounded-md uppercase placeholder:text-sm focus:outline-none placeholder:capitalize"
                                                />
                                                <input
                                                    type="number"
                                                    value={sizeField.stock}
                                                    placeholder="Enter stock quantity"
                                                    onChange={(e) => handleSizeFieldChange(colorIndex, sizeIndex, "stock", e.target.value)}
                                                    className="border w-full bg-gray-100/50 p-2 rounded-md placeholder:text-sm focus:outline-none placeholder:capitalize"
                                                />
                                            </div>
                                            <HiMiniXMark
                                                className="text-2xl text-primary cursor-pointer"
                                                onClick={() => handleDeleteSizeField(colorIndex, sizeIndex)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* button */}
                    <div className='flex justify-center items-center !mt-5'>
                        <Button type='submit' className='bg-buttonBg font-custom font-normal tracking-wider'>submit product</Button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default AddProduct
