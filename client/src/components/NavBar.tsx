import React, {useCallback} from 'react';
import {Box, Button, Flex, Link} from '@chakra-ui/react';
import NextLink from 'next/link';

import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";

const NavBar: React.FC<{}> = () => {
    const [{fetching, data}] = useMeQuery({
        pause: isServer(),
    });
    const [{fetching: fetchingLogout}, logout] = useLogoutMutation();

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout])

    let body = null;

    if (fetching) {

    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    onClick={handleLogout}
                    variant="link"
                    isLoading={fetchingLogout}
                >
                    Logout
                </Button>
            </Flex>
        )
    }

    return (
        <Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4}>
            <Box ml="auto">
                {body}
            </Box>
        </Flex>
    )
}

export default React.memo(NavBar);