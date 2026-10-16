export class AppError extends Error {
    //pq aqui é public e não se usa o status nesse trecho?
    constructor(message: string, public status: number){
        super(message);
    }
}