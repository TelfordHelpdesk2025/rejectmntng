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
                    // {
                    //     href: route("data.filter"),
                    //     label: "Data Filter & Export",
                    // },
                ]}
                
            />

                <div>
                    <SidebarLink
                        href={route("reject.summary.index")}
                        label="Summary Export"
                        icon={<i className="fa-solid fa-file-export"></i>}
                    />
                </div>

            {["superadmin", "admin"].includes(emp_data?.emp_system_role) && ["1328", "139"] .includes(emp_data?.emp_id) && (
                <div>
                    <SidebarLink
                        href={route("admin")}
                        label="RJ Controllers"
                        icon={<i className="fa-solid fa-users-gear"></i>}
                    />
                </div>
            )}
        </nav>
    );
}
