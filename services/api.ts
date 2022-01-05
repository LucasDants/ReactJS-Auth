import axios, { AxiosError } from "axios";
import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";

let cookies = parseCookies();
let isRefreshing = false
let failedRequestsQueue = []

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

export function signOut() {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')
    Router.push('/')
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        cookies = parseCookies();

        const { "nextauth.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config //toda a config da req que fizemos para o backend, para repetir a req

       if(!isRefreshing) {
            isRefreshing = true

            api
            .post("/refresh", {
                refreshToken,
            })
            .then((response) => {
                const { token } = response.data;

                setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/", //quais caminhos da aplicação tem acesso ao cookie (/ todos tem)
                });
                setCookie(undefined, "nextauth.refreshToken", response.data.refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/", //quais caminhos da aplicação tem acesso ao cookie (/ todos tem)
                });

                api.defaults.headers['Authorization'] = `Bearer ${token}`

                failedRequestsQueue.forEach(request => request.onSuccess(token))
                failedRequestsQueue = []

            }).catch(err => {
                 failedRequestsQueue.forEach(request => request.onFailure(err))
                failedRequestsQueue = []
            }).finally(() => {
                isRefreshing = false
            })
       }

       return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
                onSuccess: (token: string) => {
                    originalConfig.headers['Authorization'] = `Bearer ${token}`
                    resolve(api(originalConfig))
                },
                onFailure: (err: AxiosError) => {
                    reject(err)
                },
            })
       })

      } else {
        // deslogar
            signOut()

      }
    }

    return Promise.reject(error) // deixar o axios lidar com os errors nos catchs das funções
  }
);
