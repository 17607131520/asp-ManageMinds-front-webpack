import React,{lazy} from "react";
import {createBrowserRouter} from "react-router-dom"

const Home=lazy(()=>import("@/pages/Home"))
const Login=lazy(()=>import("@/pages/Login"))

const routers=createBrowserRouter([
    {
        path:'/',
        element:<Home/>
    },
    {
        path:"/login",
        element:<Login/>
    }
])

export default routers