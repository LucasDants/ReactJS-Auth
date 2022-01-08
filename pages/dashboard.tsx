import { destroyCookie } from "nookies"
import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me')
        .then(response => console.log(response, 'dashboard')).catch(err => console.log(err, 'dashboard'))
    }, [])

    return (
        <h1>{user?.email}</h1>
    )
}


export const getServerSideProps = withSSRAuth(async ctx => {
    const apiClient = setupAPIClient(ctx)
    // try {
    //     const response = await apiClient.get('me')
    //     console.log(response.data)
    // } catch (err) {
    //     destroyCookie(ctx, 'nextauth.token')
    //     destroyCookie(ctx, 'nextauth.refreshToken')

    //     return {
    //         redirect: {
    //             destination: '/',
    //             permanent: false
    //         }
    //     }
    // }

    return {
        props: {}
    }
})