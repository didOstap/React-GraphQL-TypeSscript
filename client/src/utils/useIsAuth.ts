import {useEffect} from 'react';
import {useMeQuery} from "../generated/graphql";
import {useRouter} from "next/router";

export const useIsAuth = () => {
    const router = useRouter();
    const [{data, fetching}] = useMeQuery();

    useEffect(() => {
        if (!fetching && !data?.me) {
            router.replace(`/login?next=${router.pathname}`).then(() => {
            });
        }
    }, [data, fetching])
}
