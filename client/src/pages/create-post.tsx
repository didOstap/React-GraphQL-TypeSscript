import React, {useCallback} from 'react';
import {Form, Formik} from 'formik';
import {Box, Button} from '@chakra-ui/react';

import InputField from "../components/InputField";
import {useCreatePostMutation} from "../generated/graphql";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {useRouter} from "next/router";
import Layout from "../components/Layout";
import {useIsAuth} from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = () => {
    useIsAuth();
    const router = useRouter();
    const [, createPost] = useCreatePostMutation();

    const handleCreatePost = useCallback(async (values) => {
        const {error} = await createPost({input: values});
        if (!error) {
            await router.push('/');
        }
    }, [createPost]);

    return (
        <Layout variant="small">
            <Formik
                initialValues={{title: '', text: ''}}
                onSubmit={handleCreatePost}
            >
                {({isSubmitting}) => (
                    <Form>
                        <InputField
                            name="title"
                            label="Title"
                            placeholder="Title"
                        />
                        <Box mt={4}>
                            <InputField
                                textArea
                                name="text"
                                label="Body"
                                placeholder="Text"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Create Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);