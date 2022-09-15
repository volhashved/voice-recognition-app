class ResponseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ResponseError'
    }
}

export interface IResponseError extends Error {
    status?: number
    message: string
    code?: string
    stack?: string
}

interface IServerErrorData {
    code?: string
    message: string
    stack?: string
    status?: number
}

const responseError = (errorData: IServerErrorData): IResponseError => {
    const { message } = errorData
    const error = new ResponseError(message) as IResponseError

    return { ...error, ...errorData }
}

const checkResponse = async (response: Response) => {
    const data = await response.json()

    if (response.ok) {
        return data
    }
    const errorData =
        typeof data.error === 'string' ? JSON.parse(data.error) : data.error

    const error = responseError({
        status: response.status,
        ...errorData,
    })

    throw error
}

const networkError = (error: Error) => {
    throw responseError({ message: `Network error: ${error}` })
}

const send = async (url: string, options?: RequestInit) => {
    return fetch(url, options)
        .then(checkResponse, networkError)
        .catch((error) => {
            console.error(`Response error: `, error)

            throw error
        })
}

const post = ({
    url,
    options,
    data,
}: {
    url: string
    options?: RequestInit
    data?: any
}) =>
    send(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : null,
        ...options,
    })

const get = (url: string, options?: RequestInit) => send(url, options)

export { post, get }
