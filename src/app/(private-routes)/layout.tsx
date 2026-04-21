import React from 'react';


interface IProps {
    children: React.ReactNode;
}
function Layout({children}: IProps) {

    // private routes logic goes here
    const canActivate = true

    if(canActivate) return (
        <div>{children}</div>
    );
    else return null
}

export default Layout;