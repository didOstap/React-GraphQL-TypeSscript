import {FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/react';
import React, {InputHTMLAttributes} from 'react';
import {useField} from "formik";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string,
    label: string,
}

const InputField: React.FC<InputFieldProps> = ({label, placeholder, size: _, ...props}) => {
    const [field, {error, touched}] = useField(props);

    return (
        <FormControl isInvalid={!!error && touched}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <Input {...field} {...props} id={field.name} placeholder={placeholder}/>
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    )
};

export default InputField;
