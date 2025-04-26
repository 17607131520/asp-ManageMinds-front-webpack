import React,{Suspense} from "react";
import {createRoot} from "react-dom/client"
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ZhCN from 'antd/locale/zh_CN';
import routers from "./routers"
import "./index.less"

const container = document.getElementById('root')
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <ConfigProvider locale={ZhCN}>
            <Suspense fallback={<div>...加载中</div>}>
                <RouterProvider router={routers} />
            </Suspense>
        </ConfigProvider>
    </React.StrictMode>
)