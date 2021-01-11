import React, {useCallback} from 'react';
import {Form, Formik} from "formik";
import {Box, Button} from '@chakra-ui/react';

import Wrapper from '../components/Wrapper';
import InputField from "../components/InputField";
import {useLoginMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";

const Login: React.FC<{}> = () => {
    const router = useRouter();
    const [, login] = useLoginMutation();

    const handleRegister = useCallback(async (values, {setErrors}) => {
        const response = await login(values);
        if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
        } else if (response.data?.login.user) {
            await router.push('/');
        }
    }, [login, router]);

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{usernameOrEmail: '', password: ''}}
                onSubmit={handleRegister}
            >
                {({isSubmitting}) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            label="Username or email"
                            placeholder="Username or email"
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
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Login);
