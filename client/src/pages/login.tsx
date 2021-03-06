import React, {useCallback} from 'react';
import {Form, Formik} from "formik";
import {Box, Button, Flex, Link} from '@chakra-ui/react';
import NextLink from 'next/link';
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";

import InputField from "../components/InputField";
import {useLoginMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {createUrqlClient} from "../utils/createUrqlClient";
import Wrapper from "../components/Wrapper";

const Login: React.FC<{}> = () => {
    const router = useRouter();
    const [, login] = useLoginMutation();

    const handleRegister = useCallback(async (values, {setErrors}) => {
        const response = await login(values);
        if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
        } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
                await router.push(router.query.next);
            } else {
                await router.push('/');
            }
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
                        <Flex mt={2}>
                            <NextLink href="/forgot-password">
                                <Link ml="auto">forgot password?</Link>
                            </NextLink>
                        </Flex>
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
