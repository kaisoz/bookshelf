import { JobStorage } from '../storage/jobStorage';
import { ExportPdfJob, ExportEpubJob, ExportJob } from '../jobs/exportJob';

enum ExportTypes {
    epub = 'epub',
    pdf = 'pdf',
}

export class ExportHandler {
    private storage: JobStorage;

    public constructor(storage: JobStorage) {
        this.storage = storage;
    }

    public exportAs(type: string, bookId: string): void {
        let exportJob: ExportJob;
        if (!this.isValidType(type)) {
            throw new Error(`Invalid export type: ${type}`);
        }

        if (type === ExportTypes.epub) {
            exportJob = new ExportEpubJob(bookId);
        } else {
            exportJob = new ExportPdfJob(bookId);
        }

        this.storage.add(exportJob);
        exportJob.execute().then(() => {
            this.storage.update(exportJob);
        });
    }

    private isValidType(type: string) {
        return type in ExportTypes;
    }

    public getAllJobsAsJSON() {
        const jobsList: ExportJob[] = this.storage.getExportJobs();
        return JSON.stringify(jobsList);
    }
}
