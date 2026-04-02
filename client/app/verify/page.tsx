"use client";

import VerifyOtp from "@/components/VerifyOTP";
import { Suspense } from "react";
import Loading from "@/components/Loading";

const VerifyPage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <VerifyOtp />
        </Suspense>
    )
}

export default VerifyPage