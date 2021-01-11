import React, {useCallback} from 'react';
import {Form, Formik} from "formik";
import {Box, Button} from '@chakra-ui/react';

import Wrapper from '../components/Wrapper';
import InputField from "../components/InputField";
import {useRegisterMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";

const Register: React.FC<{}> = () => {
    const router = useRouter();
    const [, register] = useRegisterMutation();

    const handleRegister = useCallback(async (values, {setErrors}) => {
        const response = await register({options: values});
        if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
        } else if (response.data?.register.user) {
            await router.push('/');
        }
    }, [register, router]);

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{email: '', username: '', password: ''}}
                onSubmit={handleRegister}
            >
                {({isSubmitting}) => (
                    <Form>
                        <InputField
                            name="email"
                            label="Email"
                            placeholder="Email"
                        />
                        <InputField
                            name="username"
                            label="Username"
                            placeholder="Username"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                label="Password"
                                placeholder="Password"
                                type="password"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Register);
