import express from 'express';
import { BookListHandler } from '../handlers/bookListHandler';

export class BookListController {
    public path = '/books';

    public router: express.Router;

    private bookListHandler: BookListHandler;

    public constructor() {
        this.router = express.Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.bookListHandler = new BookListHandler();
        this.router.get(this.path, this.getBookList);
    }

    private getBookList = (req: express.Request, res: express.Response) => {
        const offset = Number(req.query.offset);
        const limit = Number(req.query.limit);
        try {
            const booksList = this.bookListHandler.getBookListFromOffset(offset, limit);
            res.status(200).send(JSON.stringify(booksList));
        } catch (error) {
            res.status(500).send(JSON.stringify({ error: error.message }));
        }
    };
}
