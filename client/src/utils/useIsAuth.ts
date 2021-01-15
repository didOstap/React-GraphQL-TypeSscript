import {useEffect} from 'react';
import {useMeQuery} from "../generated/graphql";
import {useRouter} from "next/router";

export const useIsAuth = () => {
    const router = useRouter();
    const [{data, fetching}] = useMeQuery();

    useEffect(() => {
        if (!fetching && !data?.me) {
            router.replace('/login').then(() => {
            });
        }
    }, [data, fetching])
}