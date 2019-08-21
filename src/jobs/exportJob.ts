import { Job, JobType } from './job';

export class ExportJob extends Job {
    public constructor(bookId: string, type: string) {
        super(bookId, type);
        this.jobType = JobType.export;
    }
}

export class ExportPdfJob extends ExportJob {
    public constructor(bookId: string) {
        super(bookId, 'pdf');
        this.processingTimeInSecs = 25;
    }
}

export class ExportEpubJob extends ExportJob {
    public constructor(bookId: string) {
        super(bookId, 'epub');
        this.processingTimeInSecs = 10;
    }
}
