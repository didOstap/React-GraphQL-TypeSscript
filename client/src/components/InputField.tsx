import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Textarea,
} from '@chakra-ui/react';
import React, {InputHTMLAttributes} from 'react';
import {useField} from "formik";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string,
    label: string,
    textArea?: boolean,
}

const InputField: React.FC<InputFieldProps> = ({label, placeholder, textArea, size: _, ...props}) => {
    const [field, {error, touched}] = useField(props);

    let Field: any;
    if (textArea) {
        Field = Textarea
    } else {
        Field = Input
    }

        return (
            <FormControl isInvalid={!!error && touched}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Field {...field} {...props} id={field.name} placeholder={placeholder}/>
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
            </FormControl>
        )
};

export default React.memo(InputField);
