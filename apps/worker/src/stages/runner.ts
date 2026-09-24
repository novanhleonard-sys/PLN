export interface Job {
  id: string;
  payload: any;
}

export interface StageContext {
  supabase: any;
  logger: any;
}

export type StageHandler = (ctx: StageContext, job: Job) => Promise<void>;