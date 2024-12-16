import React, { useState } from 'react';
import {
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Button,
} from "@material-tailwind/react";
import { IoIosArrowDown } from 'react-icons/io';

const sizes = ["s", "m", "l", "xl", "xxl", "3xl", "4xl", "5xl"];

const FilterBySize = ({ handleCategory }) => {
    const [selectedSize, setSelectedSize] = useState(""); // State for selected size

    const handleSizeSelection = (size) => {
        setSelectedSize(size); // Update button label
        handleCategory(size); // Pass size to parent handler
    };

    return (
        <Menu>
            <MenuHandler>
                <Button
                    variant="outlined"
                    className="w-full shadow-none font-custom flex justify-between items-center py-2 px-3 
                         border-gray-400 text-gray-600 font-medium rounded-3xl focus:outline-none"
                >
                    Filter by size
                    <span className="text-xs capitalize bg-primary px-2 text-white rounded-md">
                        {selectedSize || "All"}
                    </span>
                    <IoIosArrowDown className="text-lg text-gray-400" />
                </Button>
            </MenuHandler>
            <MenuList className="w-72 max-h-64 rounded-xl">
                {sizes.map((size, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleSizeSelection(size)} // Pass size directly
                        className="uppercase font-medium font-custom text-gray-600 cursor-pointer border-2 rounded-full w-10 h-10
                                flex justify-center items-center mb-1"
                    >
                        {size}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
};

export default FilterBySize;
