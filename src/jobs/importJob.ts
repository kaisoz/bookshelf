import { Job, JobType } from './job';

export class ImportJob extends Job {
    public url: string;

    public constructor(bookId: string, type: string, url: string) {
        super(bookId, type);
        this.processingTimeInSecs = 60;
        this.jobType = JobType.import;
        this.url = url;
    }

    public toJSON() {
        const json: any = super.toJSON();
        json.url = this.url;
        return json;
    }
}
