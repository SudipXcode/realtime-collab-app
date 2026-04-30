"use client"
import React from 'react'


import { useSelector } from "react-redux"
import Heading from './Heading';
import Body from './Body';
import Footer from './Footer';

const Details = () => {
    const selectedTask = useSelector((state: any) => state.task.selectedTask);

    return (
        <div className="w-90 flex-none border-l  border-[#2D2D2D] h-full ">
            {selectedTask ?
                <div className="w-full h-full   flex flex-col justify-between items-center ">
                    <Heading selectedTask={selectedTask} />
                    <Body selectedTask={selectedTask} />
                    <Footer selectedTask={selectedTask} />
                </div>
                :
                <div className="w-full h-full flex flex-col  justify-between items-end relative">
                    <div className="absolute top-[6%] left-[6%] w-14 h-14 bg-[#232323] rounded-full" />
                    <div className="absolute top-[8%] right-[8%] w-16 h-16 bg-[#232323] rounded-xl rotate-12" />
                    <div className="absolute top-[28%] left-[12%] w-12 h-12 bg-[#232323] rounded-full" />
                    <div className="absolute top-[35%] right-[10%] w-18 h-18 bg-[#232323] rounded-2xl rotate-45" />
                    <div className="absolute top-[15%] left-[45%] w-15 h-15 bg-[#232323] rounded-full" />
                    <div className="absolute top-[55%] left-[5%] w-20 h-20 bg-[#232323] rounded-xl rotate-6" />
                    <div className="absolute top-[65%] right-[12%] w-13 h-13 bg-[#232323] rounded-full" />
                    <div className="absolute bottom-[20%] left-[30%] w-17 h-17 bg-[#232323] rounded-3xl rotate-12" />
                    <div className="absolute bottom-[10%] right-[25%] w-14 h-14 bg-[#232323] rounded-lg rotate-45" />
                    <div className="absolute bottom-[6%] left-[10%] w-19 h-19 bg-[#232323] rounded-full" />
                </div>
            }

        </div>
    )
}

export default Details

