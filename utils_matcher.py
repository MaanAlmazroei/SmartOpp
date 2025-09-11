import pandas as pd

def match_cv_to_jobs(cv_category: str, jobs_csv: str = "job_posts_part/classified_wadhefa_dataset.csv", top_n: int = 10):
    """
    Match a CV category with jobs from the classified Wadhefa dataset.

    Args:
        cv_category (str): Category predicted by the CV classifier (e.g., "IT")
        jobs_csv (str): Path to the classified jobs dataset
        top_n (int): Number of jobs to return

    Returns:
        pd.DataFrame: Filtered jobs matching the CV category
    """
    try:
        df = pd.read_csv(jobs_csv)
    except FileNotFoundError:
        raise FileNotFoundError(f"Jobs file not found: {jobs_csv}")

    if "predicted_category" not in df.columns:
        raise ValueError("Dataset must have a 'predicted_category' column.")

    # Filter jobs by predicted category
    matched = df[df["predicted_category"] == cv_category]

    # Return top N jobs
    return matched.head(top_n)


# Optional: allow direct testing if run as a script
if __name__ == "__main__":
    sample_category = "IT"
    results = match_cv_to_jobs(sample_category)
    print(f"Sample results for category '{sample_category}':")
    print(results[["title", "url", "predicted_category"]])
