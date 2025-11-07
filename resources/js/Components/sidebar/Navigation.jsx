import Dropdown from "@/Components/sidebar/Dropdown";
import SidebarLink from "@/Components/sidebar/SidebarLink";
import { usePage } from "@inertiajs/react";

export default function NavLinks() {
    const { emp_data } = usePage().props;
    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            <SidebarLink
                href={route("dashboard")}
                label="Dashboard"
                icon={<i className="fa-solid fa-gauge"></i>}
            />

            <Dropdown
                label="Rejects"
                icon={<i className="fa-solid fa-text-slash"></i>}
                links={[
                    {
                        href: route("reject.index"),
                        label: "Reject List",
                    },
                ]}
                
            />

            {/* {["Quality Assurance"].includes(emp_data?.emp_dept) && ["Senior QA Supervisor", "QA Supervisor", "QA Section Head", "QA Sr. Section Head", "QA Manager"].includes(emp_data?.emp_jobtitle) &&(
                <div>
                    <SidebarLink
                        href={route("admin")}
                        label="Administrators"
                        icon={<i className="fa-solid fa-users-gear"></i>}
                    />
                </div>
            )} */}
        </nav>
    );
}
