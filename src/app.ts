import express from 'express';
import { JobStorage } from './storage/jobStorage';
import { ExportController } from './controllers/exportController';
import { ImportController } from './controllers/importController';
import { BookListController } from './controllers/bookListController';

export class App {
    public app: express.Application;

    public port: number;

    public staticContentPath: string;

    public constructor(port: number, staticContentPath: string) {
        this.app = express();
        this.port = port;
        this.initMiddlewares(staticContentPath);
        this.initControllers(new JobStorage());
    }

    private initMiddlewares(staticContentPath: string) {
        this.app.use(express.json());
        this.app.use(express.static(staticContentPath));
        this.app.use(this.errorHandler);
    }

    private errorHandler = (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(error.stack);
        const errorObj = { error: '' };
        if (error instanceof SyntaxError) {
            errorObj.error = 'Invalid JSON';
        } else {
            errorObj.error = 'Server error';
        }
        res.status(500).send(JSON.stringify(errorObj));
    };

    private initControllers(storage: JobStorage) {
        const exportController = new ExportController(storage);
        this.app.use('/', exportController.router);

        const importController = new ImportController(storage);
        this.app.use('/', importController.router);

        const bookListController = new BookListController();
        this.app.use('/', bookListController.router);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}
