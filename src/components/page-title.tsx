import { JSX } from "react";

const PageTitle = ({ title, icon }: { title: string | JSX.Element; icon: JSX.Element }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {icon}
            {title}
        </div>
    );
};

export default PageTitle;
