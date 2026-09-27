CREATE OR REPLACE VIEW admin_jobs_view AS
SELECT j.*, get_job_story_title(j) as story_title
FROM jobs j;
