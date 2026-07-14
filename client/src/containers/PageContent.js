import Header from "./Header"
/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import routes from '../routes'
import { Suspense, lazy } from 'react'
import SuspenseContent from "./SuspenseContent"
import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from "react"

const Page404 = lazy(() => import('../pages/protected/404'))

const HEADER_REVEAL_ZONE_PX = 72

function PageContent(){
    const mainContentRef = useRef(null);
    const {pageTitle} = useSelector(state => state.header)
    const [showHeader, setShowHeader] = useState(false);


    // Scroll back to top on new page load
    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
          });
      }, [pageTitle])

    // Navbar auto-hide: faqat sahifa tepasida turib, kursor navbar zonasiga
    // borganda ko'rinadi; aks holda yashirin turadi.
    useEffect(() => {
        const mainEl = mainContentRef.current;

        const isAtTop = () => mainEl.scrollTop <= 4;

        const handleScroll = () => {
            if (!isAtTop()) setShowHeader(false);
        };
        const handleMouseMove = (e) => {
            setShowHeader(isAtTop() && e.clientY <= HEADER_REVEAL_ZONE_PX);
        };
        const handleMouseLeave = () => setShowHeader(false);

        mainEl.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            mainEl.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return(
        <div className="drawer-content flex flex-col h-full relative">
            <div
                className={`absolute top-0 left-0 right-0 z-30 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
            >
                <Header/>
            </div>
            <main className="flex-1 overflow-y-auto pt-8 px-6  bg-base-200" ref={mainContentRef}>
                <Suspense fallback={<SuspenseContent />}>
                        <Routes>
                            {
                                routes.map((route, key) => {
                                    return(
                                        <Route
                                            key={key}
                                            exact={true}
                                            path={`${route.path}`}
                                            element={<route.component />}
                                        />
                                    )
                                })
                            }

                            {/* Redirecting unknown url to 404 page */}
                            <Route path="*" element={<Page404 />} />
                        </Routes>
                </Suspense>
                <div className="h-16"></div>
            </main>
        </div> 
    )
}


export default PageContent
