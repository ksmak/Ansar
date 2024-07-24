import { Button } from "@material-tailwind/react";

import { useAuth } from "../hooks/auth";

const PanelTop = () => {
    const { user, logout } = useAuth();

    return (
        <div className="h-24 bg-formbgcolor flex flex-row justify-between border-bordercolor border-b-2">
            <img className="h-20 self-center ml-10" src="ansar.png" alt="ansar" />
            <div className="flex flex-row items-center gap-2 self-end pr-4 pb-2 text-white text-sm">
                <p>Пользователь: <span className="font-bold">{user.fullName}</span></p>
                <Button variant="gradient" color="blue-gray" size="sm" onClick={() => logout()}>Выйти</Button>
            </div>
        </div>
    );
}

export default PanelTop;