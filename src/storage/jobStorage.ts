/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { ImportJob } from '../jobs/importJob';
import { ExportJob } from '../jobs/exportJob';
import { Job, JobType } from '../jobs/job';

export class JobStorage {
    private jobsMap = new Map();

    public constructor() {
        for (const type in JobType) {
            this.jobsMap.set(type, []);
        }
    }

    public add(job: Job) {
        const jobList = this.jobsMap.get(job.getJobType());
        jobList.push(job);
    }

    public update(job: Job) {
        const jobList = this.jobsMap.get(job.getJobType());
        this.reorder(jobList, job);
    }

    private reorder(list: Job[], updatedJob: Job) {
        list.forEach((currentJob, index) => {
            if (this.areTheSameJob(currentJob, updatedJob)) {
                list.splice(index, 1);
                list.unshift(updatedJob);
                // eslint-disable-next-line no-useless-return
                return;
            }
        });
    }

    private areTheSameJob(job1: Job, job2: Job) {
        return job1.bookId === job2.bookId && job1.createdAt === job2.createdAt;
    }

    public getImportJobs(): ImportJob[] {
        return this.jobsMap.get(JobType.import);
    }

    public getExportJobs(): ExportJob[] {
        return this.jobsMap.get(JobType.export);
    }
}
