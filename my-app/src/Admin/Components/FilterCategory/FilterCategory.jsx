import React, { useState, useEffect, useContext } from "react";
import { Menu, MenuHandler, MenuList, Button } from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AppContext } from "../../../StoreContext/StoreContext";
import axios from "axios";

export default function FilterCategory({ setFilters, resetFilter }) {
    const { BASE_URL } = useContext(AppContext);
    const [selectedCategories, setSelectedCategories] = useState([]); // Store category IDs
    const [categories, setCategories] = useState([]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/admin/category/get`);
                setCategories(response.data);
            } catch (error) {
                console.log(error, ": Error fetching categories");
            }
        };
        fetchCategories();
    }, [BASE_URL]);

    // Reset selected categories when resetFilter is triggered
    useEffect(() => {
        if (resetFilter) {
            setSelectedCategories([]);
            setFilters((prevFilters) => ({
                ...prevFilters,
                category: undefined, // Reset category filter
            }));
        }
    }, [resetFilter, setFilters]);

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategories((prev) => {
            const newSelectedCategories = prev.includes(category.id)
                ? prev.filter(item => item !== category.id) // Deselect category
                : [...prev, category.id]; // Select category

            // If no categories are selected, reset the filter to show all products
            if (newSelectedCategories.length === 0) {
                setFilters((prevFilters) => ({
                    ...prevFilters,
                    category: undefined, // Reset category filter
                }));
            } else {
                setFilters((prevFilters) => ({
                    ...prevFilters,
                    category: newSelectedCategories, // Update category filter with selected categories
                }));
            }

            return newSelectedCategories; // Return updated selected category IDs
        });
    };


    // Handle Apply now button click
    const handleApplyFilters = () => {
        // Update the filter state with the selected category IDs when the user clicks Apply now
        setFilters((prevFilters) => ({
            ...prevFilters,
            category: selectedCategories.join(",") // Join the selected category IDs into a comma-separated string
        }));
    };

    // Prevent the click event from propagating to the Menu component
    const handleClickInside = (event) => {
        event.stopPropagation();
    };

    return (
        <Menu>
            <MenuHandler>
                <Button
                    className="!bg-white text-secondary rounded-xl cursor-pointer flex items-center gap-5 p-3 font-custom capitalize text-base font-normal border-gray-300 border-[1px] shadow-none focus:shadow-none focus:outline-none hover:shadow-none outline-none"
                >
                    <div className="flex gap-1 whitespace-nowrap overflow-x-auto hide-scrollbar w-32">
                        {selectedCategories.length > 0
                            ? selectedCategories
                                .map(id => categories.find(category => category.id === id)?.name) // Find category names based on IDs
                                .join(", ")
                            : "Select Category"}
                    </div>
                    <ChevronDownIcon strokeWidth={2.5} className="h-3.5 w-3.5 transition-transform" />
                </Button>
            </MenuHandler>
            <MenuList className="rounded-2xl w-full max-w-lg p-0">
                <div className="border-b-[1px] p-5 focus:outline-none">
                    <h1 className="text-secondary font-semibold text-lg text-center">Select Category</h1>
                    <ul className="mt-5 text-secondary flex flex-wrap justify-center items-center gap-2">
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                onClick={(e) => {
                                    handleCategorySelect(category);
                                    handleClickInside(e);
                                }}
                                className={`cursor-pointer border-[1px] border-gray-400 text-sm w-[30%] p-2 flex justify-center items-center rounded-full 
                                ${selectedCategories.includes(category.id) ? "bg-primary text-white" : ""}`}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-5 flex flex-col justify-center items-center gap-5 focus:outline-none">
                    <p className="text-sm">*You can choose multiple categories</p>
                    <Button
                        onClick={handleApplyFilters} // Apply filters on click
                        className="bg-primary font-custom text-sm tracking-wider font-normal capitalize py-2 px-4"
                    >
                        Apply now
                    </Button>
                </div>
            </MenuList>
        </Menu>
    );
}
