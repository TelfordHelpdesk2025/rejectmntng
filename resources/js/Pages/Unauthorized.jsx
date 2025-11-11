import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Unauthorized() {

    const logout = () => {
            const token = localStorage.getItem("authify-token");
            localStorage.removeItem("authify-token");
            router.get(route("logout"));
            window.location.href = `http://192.168.2.221/authify/public/logout?key=${encodeURIComponent(
                token
            )}&redirect=${encodeURIComponent(route("dashboard"))}`;
        };

    return (
        <>
            <Head title="Unauthorized" />

            <div className="flex items-center justify-center min-h-screen px-6 bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-[60pt] font-bold text-gray-800 dark:text-gray-100 mb-0">
                        Unauthorized
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        You do not have the necessary authorization to access
                        this system.
                    </p>

                    <button
                        onClick={logout}
                        className="inline-block px-6 py-2 mt-3 text-lg font-semibold text-blue-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
