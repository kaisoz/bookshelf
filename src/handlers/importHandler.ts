import { URL } from 'url';
import { JobStorage } from '../storage/jobStorage';
import { ImportJob } from '../jobs/importJob';

enum ImportTypes {
    word,
    pdf,
    wattpad,
    evernote,
}

export class ImportHandler {
    private storage: JobStorage;

    public constructor(storage: JobStorage) {
        this.storage = storage;
    }

    public importFrom(type: string, url: string, bookId: string) {
        if (!this.isValidType(type)) {
            throw new Error(`Invalid import type: ${type}`);
        }

        if (!this.isValidUrl(url)) {
            throw new Error(`Invalid url: ${url}`);
        }

        const importJob = new ImportJob(bookId, type, url);
        this.storage.add(importJob);
        importJob.execute().then(() => {
            this.storage.update(importJob);
        });
    }

    // eslint-disable-next-line class-methods-use-this
    private isValidType(type: string) {
        return type in ImportTypes;
    }

    // eslint-disable-next-line class-methods-use-this
    private isValidUrl(url: string) {
        let validUrl = true;
        try {
            // eslint-disable-next-line no-new
            new URL(url);
        } catch (err) {
            validUrl = false;
        }

        return validUrl;
    }

    public getAllJobsAsJSON() {
        const jobsList: ImportJob[] = this.storage.getImportJobs();
        return JSON.stringify(jobsList);
    }
}
