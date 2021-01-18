import React, { useState} from "react";
import {withUrqlClient} from "next-urql";
import {Box, Button, Flex, Heading, Link, Stack, Text} from "@chakra-ui/react";
import NextLink from "next/link";

import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 33,
        cursor: null as null | string
    });
    const [{data, fetching}] = usePostsQuery({variables});
    const handlePagination =() => {
        setVariables({
            limit: variables.limit,
            cursor: data!.posts.posts[data!.posts.posts.length - 1].createdAt
        })
    };

    if (!data && !fetching) {
        return <div>Something went wrong...</div>
    }

    return (
        <Layout>
            <Flex align="center">
                <Heading>POSTS</Heading>
                <NextLink href="/create-post">
                    <Link ml="auto">
                        Create Post
                    </Link>
                </NextLink>
            </Flex>
            {
                !data ?
                    <div>Loading...</div> :
                    (
                        <Stack>{
                            data.posts.posts.map(p =>
                                <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                                    <Heading fontSize="xl">index: {p.id}{p.title}</Heading>
                                    <Text mt={4}>{p.textSnippet}</Text>
                                </Box>
                            )
                        }</Stack>
                    )
            }
            {data?.posts.hasMore ?
                <Flex>
                    <Button onClick={handlePagination} isLoading={fetching} m="auto" my={8}>
                        Load More
                    </Button>
                </Flex>
                : null
            }
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index)
