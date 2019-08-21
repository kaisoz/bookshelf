import express from 'express';
import { ExportHandler } from '../handlers/exportHandler';
import { JobStorage } from '../storage/jobStorage';

export class ExportController {
    private exportHandler: ExportHandler;

    public path = '/export';

    public router: express.Router;

    public constructor(storage: JobStorage) {
        this.exportHandler = new ExportHandler(storage);
        this.router = express.Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(this.path, this.getAllJobsEndpoint);
        this.router.post(this.path, this.exportJobEndpoint);
    }

    private exportJobEndpoint = (req: express.Request, res: express.Response) => {
        const { bookId } = req.body;
        const { type } = req.body;

        try {
            this.exportHandler.exportAs(type, bookId);
            res.status(200).send();
        } catch (error) {
            res.status(500).send(JSON.stringify({ error: error.message }));
        }
    };

    private getAllJobsEndpoint = (req: express.Request, res: express.Response) => {
        try {
            const jsonJobs = this.exportHandler.getAllJobsAsJSON();
            res.status(200).send(jsonJobs);
        } catch (error) {
            res.status(500).send(JSON.stringify({ error: error.message }));
        }
    };
}
