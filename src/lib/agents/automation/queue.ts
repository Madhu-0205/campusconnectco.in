/**
 * Bounded Agent Job Queue
 *
 * Implements:
 * 1. Concurrency limits (prevents unbounded parallel AI calls)
 * 2. Deduplication (same entity job cannot be enqueued multiple times concurrently)
 * 3. Exponential backoff and retry limits
 * 4. Bounded memory and timeout safety
 */

export interface AgentJob<T = any> {
  id: string;
  type: string;
  data: T;
  retries: number;
  maxRetries: number;
  enqueuedAt: Date;
  scheduledFor?: Date;
}

export interface QueueOptions {
  maxConcurrency?: number;
  defaultMaxRetries?: number;
}

export class AgentJobQueue {
  private queue: AgentJob[] = [];
  private activeJobs: Map<string, AgentJob> = new Map();
  private maxConcurrency: number;
  private defaultMaxRetries: number;
  private isProcessing = false;

  constructor(options?: QueueOptions) {
    this.maxConcurrency = options?.maxConcurrency || 3;
    this.defaultMaxRetries = options?.defaultMaxRetries || 2;
  }

  /**
   * Enqueues a job with deduplication by ID.
   */
  public enqueue<T>(job: Omit<AgentJob<T>, "retries" | "maxRetries" | "enqueuedAt"> & { maxRetries?: number }): boolean {
    // Check if already active or pending
    if (this.activeJobs.has(job.id) || this.queue.some((q) => q.id === job.id)) {
      return false; // Deduplicated
    }

    // Limit maximum pending queue depth to 100 to prevent memory leak
    if (this.queue.length >= 100) {
      console.warn(`[AgentQueue] Queue depth reached capacity (100). Rejecting job: ${job.id}`);
      return false;
    }

    const fullJob: AgentJob<T> = {
      ...job,
      retries: 0,
      maxRetries: job.maxRetries ?? this.defaultMaxRetries,
      enqueuedAt: new Date()
    };

    this.queue.push(fullJob);
    return true;
  }

  /**
   * Processes the next available batch of jobs using the provided worker handler.
   */
  public async processBatch(handler: (job: AgentJob) => Promise<void>): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;
    let processedCount = 0;

    try {
      while (this.queue.length > 0 && this.activeJobs.size < this.maxConcurrency) {
        const job = this.queue.shift();
        if (!job) break;

        this.activeJobs.set(job.id, job);

        // Execute job with bounded error handling
        try {
          await handler(job);
          processedCount++;
        } catch (err: any) {
          console.error(`[AgentQueue] Job ${job.id} failed:`, err?.message || err);
          if (job.retries < job.maxRetries) {
            job.retries++;
            // Exponential backoff
            const delayMs = Math.min(30000, 1000 * 2 ** job.retries);
            setTimeout(() => {
              this.queue.push(job);
            }, delayMs);
          }
        } finally {
          this.activeJobs.delete(job.id);
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return processedCount;
  }

  public getStatus() {
    return {
      pending: this.queue.length,
      active: this.activeJobs.size,
      maxConcurrency: this.maxConcurrency
    };
  }
}

let defaultQueueInstance: AgentJobQueue | null = null;

export function getAgentJobQueue(): AgentJobQueue {
  if (!defaultQueueInstance) {
    defaultQueueInstance = new AgentJobQueue();
  }
  return defaultQueueInstance;
}
