export type EthAmount =  string

export type Network = 'ethereum' | 'polygon' | 'solana'


export interface Paginated<T> {
    data: T[]
    page: number
    pageSize: number
    total: number
    totalPages: number
}