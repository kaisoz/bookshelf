import express from 'express';
import { JobStorage } from '../storage/jobStorage';
import { ImportHandler } from '../handlers/importHandler';

export class ImportController {
    private importHandler: ImportHandler;

    public path = '/import';

    public router = express.Router();

    public constructor(storage: JobStorage) {
        this.importHandler = new ImportHandler(storage);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(this.path, this.importJobEndpoint);
        this.router.get(this.path, this.getAllJobsEndpoint);
    }

    private importJobEndpoint = (req: express.Request, res: express.Response) => {
        const { bookId } = req.body;
        const { type } = req.body;
        const { url } = req.body;

        try {
            this.importHandler.importFrom(type, url, bookId);
            res.status(200).send();
        } catch (error) {
            res.status(500).send(JSON.stringify({ error: error.message }));
        }
    };

    private getAllJobsEndpoint = (req: express.Request, res: express.Response) => {
        try {
            const jsonJobs = this.importHandler.getAllJobsAsJSON();
            res.status(200).send(jsonJobs);
        } catch (error) {
            res.status(500).send(JSON.stringify({ error: error.message }));
        }
    };
}
