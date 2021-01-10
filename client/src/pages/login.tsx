import React, {useCallback} from 'react';
import {Form, Formik} from "formik";
import {Box, Button} from '@chakra-ui/react';

import Wrapper from '../components/Wrapper';
import InputField from "../components/InputField";
import {useLoginMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";

const Login: React.FC<{}> = () => {
    const router = useRouter();
    const [, login] = useLoginMutation();

    const handleRegister = useCallback(async (values, {setErrors}) => {
        const response = await login(values);
        if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
        } else if(response.data?.login.user) {
            await router.push('/');
        }
    }, [login, router]);

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{username: '', password: ''}}
                onSubmit={handleRegister}
            >
                {({isSubmitting}) => (
                    <Form>
                        <InputField
                            name="username"
                            label="username"
                            placeholder="username"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                label="password"
                                placeholder="password"
                                type="password"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default Login;
