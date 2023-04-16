import React from 'react';

import cls from './Error.module.scss';

const Error = ({error}) => {
    return (
        <div className={cls.error}>
            {error}
        </div>
    );
};

export default Error;