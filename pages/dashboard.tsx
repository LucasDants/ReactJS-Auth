import { destroyCookie } from "nookies"
import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {
    const { user, signOut } = useContext(AuthContext)

    const userCanSeeMetrics = useCan({
        permissions: ['metrics.list'],
    })

    useEffect(() => {
        api.get('/me')
        .then(response => console.log(response, 'dashboard')).catch(err => console.log(err, 'dashboard'))
    }, [])

    return (
       <>
            <h1>{user?.email}</h1>
            {userCanSeeMetrics && <div>Métricas</div>}
            <Can permissions={['metrics.list']}>
                <div>Métricas</div>
            </Can>
            <button onClick={signOut}>Sign Out</button>
       </>
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