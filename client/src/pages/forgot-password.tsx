import React, {useCallback, useState} from 'react';
import {Form, Formik} from "formik";
import InputField from "../components/InputField";
import {Box, Button} from "@chakra-ui/react";
import {withUrqlClient} from "next-urql";

import Wrapper from "../components/Wrapper";
import {createUrqlClient} from "../utils/createUrqlClient";
import {useForgotPasswordMutation} from "../generated/graphql";


const ForgotPassword: React.FC<{}> = () => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();

    const handleForgotPassword = useCallback(async (values) => {
        await forgotPassword(values)
        setComplete(true);
    }, [forgotPassword])

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{email: ''}}
                onSubmit={handleForgotPassword}
            >
                {({isSubmitting}) => complete ?
                    <Box>if account with that email exist, we sent you an email</Box> :
                    <Form>
                        <InputField
                            name="email"
                            label="Email"
                            placeholder="Email"
                        />
                        <Button
                            mt={4}
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Change Password
                        </Button>
                    </Form>
                }
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword as any);
