import React, {useCallback, useState} from 'react';
import {Form, Formik} from "formik";
import InputField from "../../components/InputField";
import {Box, Button, Link} from "@chakra-ui/react";
import {NextPage} from 'next';
import {withUrqlClient} from "next-urql";
import {useRouter} from "next/router";
import NextLink from 'next/link';

import Wrapper from "../../components/Wrapper";
import {useChangePasswordMutation} from "../../generated/graphql";
import {toErrorMap} from "../../utils/toErrorMap";
import {createUrqlClient} from "../../utils/createUrqlClient";


const ChangePassword: NextPage<{ token: string }> = ({token}) => {
    const router = useRouter();
    const [tokenError, setTokenError] = useState('');
    const [, changePassword] = useChangePasswordMutation();

    const handleChangePassword = useCallback(async (values, {setErrors}) => {
        const response = await changePassword({token, newPassword: values.newPassword})

        if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);

            if ('token' in errorMap) {
                setTokenError(errorMap.token);
            }

            setErrors(errorMap);

        } else if (response.data?.changePassword.user) {
            await router.push('/');
        }


    }, [changePassword, token])

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{newPassword: ''}}
                onSubmit={handleChangePassword}
            >
                {({isSubmitting}) => (
                    <Form>
                        <InputField
                            name="newPassword"
                            label="New Password"
                            placeholder="New Password"
                            type="password"
                        />
                        {tokenError ?
                            <Box>
                                <Box>{tokenError}</Box>
                                <NextLink href="/forgot-password">
                                    <Link>Forget it again</Link>
                                </NextLink>
                            </Box>
                            : null}
                        <Button
                            mt={4}
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

ChangePassword.getInitialProps = ({query}) => ({
    token: query.token as string,
});

export default withUrqlClient(createUrqlClient)(ChangePassword as any);
